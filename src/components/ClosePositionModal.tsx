'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { closeOptionTrade } from '@/app/actions/close-option-trade'
import { Loader2 } from 'lucide-react'

interface ClosePositionModalProps {
  isOpen: boolean
  onClose: () => void
  trade: any
  onPositionClosed: () => void
}

export function ClosePositionModal({
  isOpen,
  onClose,
  trade,
  onPositionClosed,
}: ClosePositionModalProps) {
  const [formData, setFormData] = useState({
    stockPrice: '',
    exitPremium: '',
    exitReason: 'manual' as 'profit_target' | 'stop_loss' | 'time_stop' | 'day1_circuit_breaker' | 'manual',
    notes: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.stockPrice || !formData.exitPremium) {
      setError('Stock price and exit premium are required')
      return
    }

    const stockPrice = parseFloat(formData.stockPrice)
    const exitPremium = parseFloat(formData.exitPremium)

    if (isNaN(stockPrice) || isNaN(exitPremium)) {
      setError('Please enter valid numbers')
      return
    }

    if (exitPremium < 0) {
      setError('Exit premium cannot be negative (use 0 if expired worthless)')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await closeOptionTrade({
        tradeId: trade.id,
        stockPrice,
        exitPremium,
        exitReason: formData.exitReason,
        notes: formData.notes,
      })

      if (result.success) {
        setSuccess(result.message || 'Position closed successfully')
        setTimeout(() => {
          onPositionClosed()
        }, 1500)
      } else {
        setError(result.message || 'Failed to close position')
      }
    } catch (error: any) {
      console.error('Error closing trade:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const entryValue = trade.entryPremium * trade.contracts * 100
  const exitValue = formData.exitPremium
    ? parseFloat(formData.exitPremium) * trade.contracts * 100
    : 0
  const pnlDollars = exitValue - entryValue
  const pnlPercent = entryValue > 0
    ? ((exitValue - entryValue) / entryValue) * 100
    : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl">
            Close Position: {trade.ticker}
          </DialogTitle>
          <DialogDescription className="text-base">
            <span className="font-semibold">Entry:</span> {trade.contracts} contract
            {trade.contracts > 1 ? 's' : ''} @ ${trade.entryPremium?.toFixed(2)}
            {' | '}
            <span className="font-semibold">Strike:</span> ${trade.strikePrice?.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Current Stock Price *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.stockPrice}
                onChange={(e) => setFormData({ ...formData, stockPrice: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 160.50"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Current market price</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Exit Premium *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.exitPremium}
                onChange={(e) => setFormData({ ...formData, exitPremium: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 7.20"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Selling premium (0 if expired)</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Exit Reason *
            </label>
            <select
              value={formData.exitReason}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  exitReason: e.target.value as any,
                })
              }
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="profit_target">Profit Target Hit (+50%)</option>
              <option value="stop_loss">Stop Loss Triggered (-30%)</option>
              <option value="time_stop">Time Stop (Max DTE)</option>
              <option value="day1_circuit_breaker">Day 1 Circuit Breaker (-10%)</option>
              <option value="manual">Manual Exit</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Why are you closing this position?</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Observations, lessons learned, etc."
              rows={3}
            />
          </div>

          {formData.exitPremium && (
            <div className={`border-2 rounded-lg p-4 ${pnlDollars >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="text-sm font-medium text-gray-700 mb-2">Estimated P&L</div>
              <div className={`text-4xl font-bold ${pnlDollars >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {pnlDollars >= 0 ? '+' : ''}${pnlDollars.toFixed(2)}
              </div>
              <div className={`text-2xl font-bold mt-1 ${pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Entry: ${entryValue.toFixed(2)} → Exit: ${exitValue.toFixed(2)}
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-600 bg-green-50 p-4 rounded-lg border border-green-200">
              ✅ {success}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-12"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 h-12 text-lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Closing...
                </>
              ) : (
                'Close Position'
              )}
            </Button>
          </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
