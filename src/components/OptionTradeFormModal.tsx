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
import { createOptionTrade } from '@/app/actions/create-option-trade'
import { Loader2 } from 'lucide-react'

interface OptionTradeFormModalProps {
  isOpen: boolean
  onClose: () => void
  opportunity: any
  onTradeCreated: () => void
}

export function OptionTradeFormModal({
  isOpen,
  onClose,
  opportunity,
  onTradeCreated,
}: OptionTradeFormModalProps) {
  const [formData, setFormData] = useState({
    stockPrice: opportunity.currentPrice?.toString() || '',
    strikePrice: '',
    premium: '',
    dte: '35',
    contracts: '1',
    notes: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.stockPrice || !formData.strikePrice || !formData.premium) {
      setError('Stock price, strike, and premium are required')
      return
    }

    const stockPrice = parseFloat(formData.stockPrice)
    const strikePrice = parseFloat(formData.strikePrice)
    const premium = parseFloat(formData.premium)
    const contracts = parseInt(formData.contracts)

    if (isNaN(stockPrice) || isNaN(strikePrice) || isNaN(premium) || isNaN(contracts)) {
      setError('Please enter valid numbers')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await createOptionTrade({
        opportunityId: opportunity.id,
        stockPrice,
        strikePrice,
        premium,
        dte: parseInt(formData.dte),
        contracts,
        notes: formData.notes,
      })

      if (result.success) {
        setSuccess(`Trade entered! Total cost: $${result.totalCost?.toFixed(2) || 'N/A'}`)
        setTimeout(() => {
          onTradeCreated()
        }, 1500)
      } else {
        setError(result.message || 'Failed to create trade')
      }
    } catch (error: any) {
      console.error('Error creating trade:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const totalCost = formData.premium && formData.contracts
    ? parseFloat(formData.premium) * parseInt(formData.contracts) * 100
    : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl">
            Enter Paper Trade: {opportunity.ticker}
          </DialogTitle>
          <DialogDescription className="text-base">
            <span className="font-semibold">Score: {opportunity.score}</span> | Drop:{' '}
            {opportunity.dropPct.toFixed(1)}% | Beat: +{opportunity.epsBeatPct.toFixed(1)}%
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Stock Price *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.stockPrice}
                onChange={(e) => setFormData({ ...formData, stockPrice: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 150.00"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Current stock price</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Strike Price (ATM) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.strikePrice}
                onChange={(e) => setFormData({ ...formData, strikePrice: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 150.00"
                required
              />
              <p className="text-xs text-gray-500 mt-1">At-the-money strike</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Premium (per contract) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.premium}
              onChange={(e) => setFormData({ ...formData, premium: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 5.50"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Option premium in dollars</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                DTE (Days to Expiration) *
              </label>
              <input
                type="number"
                value={formData.dte}
                onChange={(e) => setFormData({ ...formData, dte: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="30-45"
                min="1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 30-45 days</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Contracts *
              </label>
              <input
                type="number"
                value={formData.contracts}
                onChange={(e) => setFormData({ ...formData, contracts: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1"
                min="1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Each = 100 shares</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Trade rationale, observations, etc."
              rows={3}
            />
          </div>

          {totalCost > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-800 font-medium">Total Cost</div>
              <div className="text-3xl font-bold text-blue-900 mt-1">
                ${totalCost.toFixed(2)}
              </div>
              <div className="text-xs text-blue-700 mt-1">
                {formData.contracts} contract{parseInt(formData.contracts) > 1 ? 's' : ''} ×{' '}
                ${formData.premium || '0'} × 100 shares
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
                  Entering...
                </>
              ) : (
                'Enter Trade'
              )}
            </Button>
          </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
