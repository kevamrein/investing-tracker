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
import { Plus } from 'lucide-react'
import { createInvestment } from '@/app/actions/create-investment'

interface AddInvestmentModalProps {
  isOpen: boolean
  onClose: () => void
  onInvestmentAdded: () => void
  companyId: string
}

export function AddInvestmentModal({
  isOpen,
  onClose,
  onInvestmentAdded,
  companyId,
}: AddInvestmentModalProps) {
  const [formData, setFormData] = useState({
    accountType: 'taxable',
    transactionType: 'buy',
    investmentDate: '',
    shares: '',
    pricePerShare: '',
    notes: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.investmentDate || !formData.shares || !formData.pricePerShare) {
      setError('Investment date, shares, and price per share are required.')
      return
    }

    setIsLoading(true)
    setError('')

    const formDataObj = new FormData()
    formDataObj.append('accountType', formData.accountType)
    formDataObj.append('companyId', companyId)
    formDataObj.append('transactionType', formData.transactionType)
    formDataObj.append('investmentDate', formData.investmentDate)
    formDataObj.append('shares', formData.shares)
    formDataObj.append('pricePerShare', formData.pricePerShare)
    if (formData.notes) formDataObj.append('notes', formData.notes.trim())

    try {
      const result = await createInvestment(formDataObj)

      if (result.success) {
        setFormData({
          accountType: 'taxable',
          transactionType: 'buy',
          investmentDate: '',
          shares: '',
          pricePerShare: '',
          notes: '',
        })
        onInvestmentAdded()
        onClose()
      } else {
        setError(result.message || 'Failed to create investment.')
      }
    } catch (error) {
      console.error('Error creating investment:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-border/50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold text-card-foreground flex items-center">
            <Plus className="w-6 h-6 mr-3 text-primary" />
            Add Transaction
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Record a new investment transaction.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="accountType"
              className="block text-sm font-semibold text-card-foreground mb-2"
            >
              Account Type *
            </label>
            <select
              id="accountType"
              value={formData.accountType}
              onChange={(e) => handleInputChange('accountType', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background/50"
              required
            >
              <option value="taxable">Taxable</option>
              <option value="ira">IRA</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="transactionType"
              className="block text-sm font-semibold text-card-foreground mb-2"
            >
              Transaction Type *
            </label>
            <select
              id="transactionType"
              value={formData.transactionType}
              onChange={(e) => handleInputChange('transactionType', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background/50"
              required
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="investmentDate"
              className="block text-sm font-semibold text-card-foreground mb-2"
            >
              Investment Date *
            </label>
            <input
              type="date"
              id="investmentDate"
              value={formData.investmentDate}
              onChange={(e) => handleInputChange('investmentDate', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background/50"
              required
            />
          </div>
          <div>
            <label
              htmlFor="shares"
              className="block text-sm font-semibold text-card-foreground mb-2"
            >
              Shares *
            </label>
            <input
              type="number"
              id="shares"
              value={formData.shares}
              onChange={(e) => handleInputChange('shares', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background/50"
              placeholder="e.g., 100"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div>
            <label
              htmlFor="pricePerShare"
              className="block text-sm font-semibold text-card-foreground mb-2"
            >
              Price Per Share *
            </label>
            <input
              type="number"
              id="pricePerShare"
              value={formData.pricePerShare}
              onChange={(e) => handleInputChange('pricePerShare', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background/50"
              placeholder="e.g., 150.00"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-semibold text-card-foreground mb-2"
            >
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background/50"
              placeholder="Optional notes about this transaction"
              rows={3}
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isLoading ? 'Creating...' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
