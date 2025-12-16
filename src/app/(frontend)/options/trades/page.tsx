'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OptionPositionCard } from '@/components/OptionPositionCard'
import { Loader2, TrendingUp, Filter, RefreshCw } from 'lucide-react'

export default function TradesPage() {
  const [trades, setTrades] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: 'all',
    ticker: '',
  })

  const fetchTrades = useCallback(async () => {
    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (filters.status !== 'all') {
        queryParams.append('status', filters.status)
      }
      if (filters.ticker) {
        queryParams.append('ticker', filters.ticker.toUpperCase())
      }

      const response = await fetch(`/api/options/trades?${queryParams.toString()}`)
      const data = await response.json()

      if (data.success) {
        setTrades(data.docs || [])
      } else {
        console.error('Failed to fetch trades:', data.message)
      }
    } catch (error) {
      console.error('Error fetching trades:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchTrades()
  }, [fetchTrades])

  const openTrades = trades.filter((t) => t.status === 'open')
  const closedTrades = trades.filter((t) => t.status === 'closed')

  const totalOpenCost = openTrades.reduce(
    (sum, t) => sum + t.entryPremium * t.contracts * 100,
    0
  )

  const totalClosedPnL = closedTrades.reduce((sum, t) => sum + (t.pnlDollars || 0), 0)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Paper Trades</h1>
          <p className="text-gray-600 mt-1">Manage your option positions</p>
        </div>
        <Button onClick={fetchTrades} variant="outline" size="lg">
          <RefreshCw className="mr-2 h-5 w-5" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Open Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{openTrades.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              ${totalOpenCost.toFixed(2)} total cost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Closed Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{closedTrades.length}</div>
            <p className="text-xs text-gray-500 mt-1">Total trades executed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Closed P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${totalClosedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {totalClosedPnL >= 0 ? '+' : ''}${totalClosedPnL.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Paper profit/loss</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ status: 'all', ticker: '' })}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Ticker
              </label>
              <input
                type="text"
                value={filters.ticker}
                onChange={(e) => setFilters({ ...filters, ticker: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., AAPL"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : trades.length > 0 ? (
        <>
          {openTrades.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">
                Open Positions ({openTrades.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {openTrades.map((trade) => (
                  <OptionPositionCard
                    key={trade.id}
                    trade={trade}
                    onPositionClosed={fetchTrades}
                  />
                ))}
              </div>
            </div>
          )}

          {closedTrades.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">
                Closed Positions ({closedTrades.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {closedTrades.map((trade) => (
                  <OptionPositionCard key={trade.id} trade={trade} />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Trades Yet</h3>
            <p className="text-gray-600 mb-6">
              Start by scanning for opportunities and entering your first paper trade
            </p>
            <Button onClick={() => (window.location.href = '/options/scanner')}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Go to Scanner
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
