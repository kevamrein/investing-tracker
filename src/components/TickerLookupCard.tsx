'use client'

import { useState, FormEvent } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, X, Loader2, AlertCircle, Info, XCircle } from 'lucide-react'
import { lookupTickerOpportunity } from '@/app/actions/lookup-ticker-opportunity'
import { OptionOpportunityCard } from './OptionOpportunityCard'

interface TickerLookupCardProps {
  onAddToScanner?: (opportunity: any) => void
}

export function TickerLookupCard({ onAddToScanner }: TickerLookupCardProps) {
  const [ticker, setTicker] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<any>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!ticker.trim()) {
      return
    }

    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await lookupTickerOpportunity(ticker)

      if (response.success && response.opportunity) {
        setResult(response.opportunity)
      } else if (response.error) {
        setError(response.error)
      }
    } catch (err) {
      setError({
        type: 'api_error',
        message: 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setTicker('')
    setResult(null)
    setError(null)
  }

  const handleTickerChange = (value: string) => {
    // Auto-uppercase and limit to 5 characters
    const cleaned = value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5)
    setTicker(cleaned)
  }

  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'invalid_ticker':
      case 'no_beat':
      case 'no_drop':
        return <XCircle className="h-6 w-6 text-red-600" />
      case 'not_found':
        return <AlertCircle className="h-6 w-6 text-yellow-600" />
      case 'no_earnings':
        return <Info className="h-6 w-6 text-blue-600" />
      default:
        return <AlertCircle className="h-6 w-6 text-gray-600" />
    }
  }

  const getErrorColor = (type: string) => {
    switch (type) {
      case 'invalid_ticker':
      case 'no_beat':
      case 'no_drop':
        return 'bg-red-50 border-red-200'
      case 'not_found':
        return 'bg-yellow-50 border-yellow-200'
      case 'no_earnings':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-2xl">
          <Search className="mr-2 h-6 w-6 text-blue-600" />
          Quick Ticker Lookup
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Check any stock for earnings beat + drop opportunities (not saved to scanner)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={ticker}
              onChange={(e) => handleTickerChange(e.target.value)}
              placeholder="e.g., AAPL, NVDA, SNOW"
              className="w-full px-4 py-3 text-lg font-semibold border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase"
              disabled={isLoading}
              maxLength={5}
            />
            {ticker && !isLoading && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            disabled={isLoading || !ticker.trim()}
            size="lg"
            className="px-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                Lookup
              </>
            )}
          </Button>
        </form>

        {/* Result Display */}
        {result && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-blue-700 bg-blue-100 px-3 py-2 rounded-lg">
              <span className="font-medium">Preview Result (Not Saved)</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-7 text-blue-700 hover:text-blue-900"
              >
                Clear
              </Button>
            </div>
            <OptionOpportunityCard
              opportunity={result}
              isOneOff={true}
              onAddToScanner={onAddToScanner}
            />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className={`border-2 rounded-lg p-4 ${getErrorColor(error.type)}`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getErrorIcon(error.type)}
              </div>
              <div className="flex-1 space-y-2">
                <div className="font-semibold text-gray-900">
                  {error.type === 'invalid_ticker' && 'Invalid Ticker'}
                  {error.type === 'not_found' && 'Ticker Not Found'}
                  {error.type === 'no_earnings' && 'No Recent Earnings'}
                  {error.type === 'no_beat' && "Didn't Beat Earnings"}
                  {error.type === 'no_drop' && 'Insufficient Price Drop'}
                  {error.type === 'api_error' && 'Error Fetching Data'}
                </div>
                <p className="text-sm text-gray-700">
                  {error.message}
                </p>

                {/* Detailed Error Information */}
                {error.details && (
                  <div className="mt-3 space-y-1 text-sm">
                    {error.type === 'no_beat' && error.details && (
                      <div className="bg-white/50 rounded p-3 space-y-1">
                        <div className="font-medium text-gray-900">Earnings Details:</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-600">Estimated EPS:</span>
                            <span className="font-semibold ml-2">${error.details.estimatedEps}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Actual EPS:</span>
                            <span className="font-semibold ml-2">${error.details.actualEps}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Beat/Miss:</span>
                            <span className={`font-semibold ml-2 ${parseFloat(error.details.beatPercent) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                              {error.details.beatPercent}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <span className="font-semibold ml-2">{error.details.earningsDate}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 mt-2">
                          This strategy requires an earnings beat. Try another ticker.
                        </div>
                      </div>
                    )}

                    {error.type === 'no_drop' && error.details && (
                      <div className="bg-white/50 rounded p-3 space-y-1">
                        <div className="font-medium text-gray-900">Price Movement:</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-600">Pre-earnings:</span>
                            <span className="font-semibold ml-2">${error.details.preEarningsPrice}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Post-earnings:</span>
                            <span className="font-semibold ml-2">${error.details.postEarningsPrice}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Change:</span>
                            <span className={`font-semibold ml-2 ${parseFloat(error.details.dropPct) < 0 ? 'text-red-700' : 'text-green-700'}`}>
                              {error.details.dropPct}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">EPS Beat:</span>
                            <span className="font-semibold ml-2 text-green-700">+{error.details.epsBeatPct}%</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 mt-2">
                          Beat earnings but didn&apos;t drop enough. Strategy requires minimum 10% drop.
                        </div>
                      </div>
                    )}

                    {error.type === 'no_earnings' && error.details && (
                      <div className="bg-white/50 rounded p-3 space-y-1 text-xs">
                        {error.details.earningsDate && (
                          <div>
                            <span className="text-gray-600">Earnings date:</span>
                            <span className="font-semibold ml-2">{error.details.earningsDate}</span>
                          </div>
                        )}
                        {error.details.daysSinceEarnings !== undefined && (
                          <div>
                            <span className="text-gray-600">Days ago:</span>
                            <span className="font-semibold ml-2">{error.details.daysSinceEarnings} days</span>
                          </div>
                        )}
                        {error.details.daysUntil !== undefined && (
                          <div>
                            <span className="text-gray-600">Days until:</span>
                            <span className="font-semibold ml-2">{error.details.daysUntil} days</span>
                          </div>
                        )}
                        {error.details.windowDays && (
                          <div className="text-gray-600 mt-2">
                            Strategy looks for opportunities within {error.details.windowDays} days of earnings.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Show reason if available */}
                {error.details?.reason && (
                  <div className="mt-3 text-xs italic text-gray-600 bg-gray-100 rounded p-2">
                    <strong>Technical note:</strong> {error.details.reason}
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="mt-3"
                >
                  Try Another Ticker
                </Button>

                {/* Debug info - shows all error details */}
                {process.env.NODE_ENV === 'development' && error.details && (
                  <details className="mt-3 text-xs">
                    <summary className="cursor-pointer text-gray-500">Debug Info</summary>
                    <pre className="mt-2 bg-gray-900 text-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(error, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        {!result && !error && !isLoading && (
          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
            <div className="font-medium text-gray-700 mb-1">How it works:</div>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Enter any stock ticker (1-5 letters)</li>
              <li>System checks for recent earnings beat + price drop (last 7 days)</li>
              <li>Results shown instantly without saving to database</li>
              <li>Click &quot;Add to Scanner&quot; on qualifying opportunities to track them</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
