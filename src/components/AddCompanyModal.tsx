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
import { createCompany } from '@/app/actions/create-company'

interface AddCompanyModalProps {
  isOpen: boolean
  onClose: () => void
  onCompanyAdded: () => void
}

export function AddCompanyModal({ isOpen, onClose, onCompanyAdded }: AddCompanyModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    ticker: '',
    recommendationDate: '',
    priceTarget: '',
    timeframe: '',
    notes: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.ticker.trim() || !formData.recommendationDate) {
      setError('Name, ticker, and recommendation date are required.')
      return
    }

    setIsLoading(true)
    setError('')

    const formDataObj = new FormData()
    formDataObj.append('name', formData.name.trim())
    formDataObj.append('ticker', formData.ticker.trim())
    formDataObj.append('recommendationDate', formData.recommendationDate)
    if (formData.priceTarget) formDataObj.append('priceTarget', formData.priceTarget)
    if (formData.timeframe) formDataObj.append('timeframe', formData.timeframe.trim())
    if (formData.notes) formDataObj.append('notes', formData.notes.trim())

    try {
      const result = await createCompany(formDataObj)

      if (result.success) {
        setFormData({
          name: '',
          ticker: '',
          recommendationDate: '',
          priceTarget: '',
          timeframe: '',
          notes: '',
        })
        onCompanyAdded()
        onClose()
      } else {
        setError(result.message || 'Failed to create company.')
      }
    } catch (error) {
      console.error('Error creating company:', error)
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
            Add New Company
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Add a new company to track investments.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-card-foreground mb-2">
              Company Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background/50"
              placeholder="e.g., Apple Inc."
              required
            />
          </div>
          <div>
            <label
              htmlFor="ticker"
              className="block text-sm font-semibold text-card-foreground mb-2"
            >
              Ticker Symbol *
            </label>
            <input
              type="text"
              id="ticker"
              value={formData.ticker}
              onChange={(e) => handleInputChange('ticker', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background/50 uppercase"
              placeholder="e.g., AAPL"
              required
            />
          </div>
          <div>
            <label
              htmlFor="recommendationDate"
              className="block text-sm font-semibold text-card-foreground mb-2"
            >
              Recommendation Date *
            </label>
            <input
              type="date"
              id="recommendationDate"
              value={formData.recommendationDate}
              onChange={(e) => handleInputChange('recommendationDate', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background/50"
              required
            />
          </div>
          <div>
            <label
              htmlFor="priceTarget"
              className="block text-sm font-semibold text-card-foreground mb-2"
            >
              Price Target
            </label>
            <input
              type="number"
              id="priceTarget"
              value={formData.priceTarget}
              onChange={(e) => handleInputChange('priceTarget', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background/50"
              placeholder="e.g., 150.00"
              step="0.01"
            />
          </div>
          <div>
            <label
              htmlFor="timeframe"
              className="block text-sm font-semibold text-card-foreground mb-2"
            >
              Timeframe
            </label>
            <input
              type="text"
              id="timeframe"
              value={formData.timeframe}
              onChange={(e) => handleInputChange('timeframe', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background/50"
              placeholder="e.g., 12-24 months"
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
              {isLoading ? 'Creating...' : 'Add Company'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
