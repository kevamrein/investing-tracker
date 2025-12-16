'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, TrendingUp, TrendingDown, BarChart3, Target, Clock } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

export default function PerformancePage() {
  const [performance, setPerformance] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPerformance()
  }, [])

  const fetchPerformance = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/options/performance')
      const data = await response.json()

      if (data.success) {
        setPerformance(data)
      } else {
        console.error('Failed to fetch performance:', data.message)
      }
    } catch (error) {
      console.error('Error fetching performance:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  if (!performance || !performance.metrics || performance.metrics.totalTrades === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-6">Performance Analytics</h1>
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Closed Trades Yet
            </h3>
            <p className="text-gray-600">
              Start paper trading to build your track record and validate the strategy
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { metrics } = performance

  // Prepare data for charts
  const pnlDistributionData = metrics.recentTrades?.map((trade: any, index: number) => ({
    name: trade.ticker,
    pnl: trade.pnlPercent || 0,
  })) || []

  const exitReasonsData = Object.entries(metrics.exitReasons || {}).map(([reason, count]) => ({
    name: reason.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    value: count,
  }))

  const equityCurveData = metrics.equityCurve?.map((point: any, index: number) => ({
    trade: index + 1,
    value: point.cumulativePnl,
  })) || []

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6']

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Performance Analytics</h1>
        <p className="text-gray-600 mt-1">
          Comprehensive analysis of your paper trading results
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Trades
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-50">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalTrades}</div>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.winners}W / {metrics.losers}L
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Win Rate</CardTitle>
            <div className="p-2 rounded-lg bg-green-50">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {metrics.winRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Target: &gt;70%</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Profit Factor
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-50">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {metrics.profitFactor.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Target: &gt;1.5</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Holding
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-50">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {metrics.avgHoldingDays.toFixed(1)}d
            </div>
            <p className="text-xs text-gray-500 mt-1">Typical: 10-20d</p>
          </CardContent>
        </Card>
      </div>

      {/* P&L Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${metrics.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {metrics.totalPnl >= 0 ? '+' : ''}${metrics.totalPnl.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Paper profit/loss</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Win</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              +${metrics.avgWin.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Per winning trade</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              -${Math.abs(metrics.avgLoss).toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Per losing trade</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* P&L Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>P&L Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pnlDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => `${value.toFixed(1)}%`}
                  contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
                />
                <Legend />
                <Bar dataKey="pnl" fill="#3b82f6" name="P&L %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Exit Reasons */}
        <Card>
          <CardHeader>
            <CardTitle>Exit Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={exitReasonsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {exitReasonsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Equity Curve */}
      <Card>
        <CardHeader>
          <CardTitle>Equity Curve</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={equityCurveData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="trade" label={{ value: 'Trade Number', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Cumulative P&L ($)', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                formatter={(value: any) => `$${value.toFixed(2)}`}
                contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                name="Cumulative P&L"
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {metrics.recommendations && metrics.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.recommendations.map((rec: string, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-blue-900"
                >
                  {rec}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
