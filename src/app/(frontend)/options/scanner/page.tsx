'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OptionOpportunityCard } from '@/components/OptionOpportunityCard'
import { StrategyGuideModal } from '@/components/StrategyGuideModal'
import { Loader2, TrendingUp, Filter, RefreshCw } from 'lucide-react'

export default function ScannerPage() {
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    minScore: 0,
  })
  const [scanResult, setScanResult] = useState<string>('')

  const fetchOpportunities = useCallback(async () => {
    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (filters.status !== 'all') {
        queryParams.append('status', filters.status)
      }
      if (filters.minScore > 0) {
        queryParams.append('minScore', filters.minScore.toString())
      }

      const response = await fetch(`/api/options/opportunities?${queryParams.toString()}`)
      const data = await response.json()

      if (data.success) {
        setOpportunities(data.docs || [])
      } else {
        console.error('Failed to fetch opportunities:', data.message)
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchOpportunities()
  }, [fetchOpportunities])

  const handleScan = async () => {
    setIsScanning(true)
    setScanResult('')

    try {
      const response = await fetch('/api/options/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'recent',
          daysBack: 7,
          minScore: 70,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setScanResult(
          `Scan complete! Found ${data.opportunities.length} opportunities (${data.opportunities.filter((o: any) => o.score >= 85).length} high-score)`
        )
        fetchOpportunities()
      } else {
        setScanResult(`Scan failed: ${data.message}`)
      }
    } catch (error: any) {
      console.error('Error scanning:', error)
      setScanResult('Scan failed. Please try again.')
    } finally {
      setIsScanning(false)
    }
  }

  const filteredOpportunities = opportunities.filter((opp) => {
    if (filters.status !== 'all' && opp.status !== filters.status) {
      return false
    }
    if (filters.minScore > 0 && opp.score < filters.minScore) {
      return false
    }
    return true
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Opportunities Scanner</h1>
          <p className="text-gray-600 mt-1">
            Find earnings beat + drop recovery opportunities
          </p>
        </div>
        <div className="flex gap-3">
          <StrategyGuideModal />
          <Button onClick={handleScan} disabled={isScanning} size="lg">
            {isScanning ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-5 w-5" />
                Run Scanner
              </>
            )}
          </Button>
        </div>
      </div>

      {scanResult && (
        <div
          className={`p-4 rounded-lg border ${
            scanResult.includes('failed')
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-green-50 border-green-200 text-green-800'
          }`}
        >
          {scanResult}
        </div>
      )}

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
              onClick={() => setFilters({ status: 'all', minScore: 0 })}
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
                <option value="pending">Pending</option>
                <option value="traded">Traded</option>
                <option value="dismissed">Dismissed</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Minimum Score
              </label>
              <select
                value={filters.minScore}
                onChange={(e) => setFilters({ ...filters, minScore: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="0">All Scores</option>
                <option value="70">70+ (Consider)</option>
                <option value="85">85+ (Strong Buy)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : filteredOpportunities.length > 0 ? (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {filteredOpportunities.length} Opportunit
              {filteredOpportunities.length === 1 ? 'y' : 'ies'} Found
            </h2>
            <div className="text-sm text-gray-600">
              {filteredOpportunities.filter((o) => o.score >= 85).length} high-score (85+)
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOpportunities.map((opportunity) => (
              <OptionOpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onTradeCreated={fetchOpportunities}
              />
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Opportunities Found
            </h3>
            <p className="text-gray-600 mb-6">
              Run the scanner to find new earnings beat + drop opportunities
            </p>
            <Button onClick={handleScan} disabled={isScanning}>
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Run Scanner
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
