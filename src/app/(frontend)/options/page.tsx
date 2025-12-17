import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getOpportunities } from '@/app/actions/get-opportunities'
import { getOptionTrades } from '@/app/actions/get-option-trades'
import { calculatePerformance } from '@/app/actions/calculate-performance'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { TrendingUp, Target, BarChart3, DollarSign, Calendar, AlertCircle } from 'lucide-react'
import { StrategyGuideModal } from '@/components/StrategyGuideModal'

export default async function OptionsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Options Paper Trading</h1>
          <p className="text-gray-600 mt-1">
            Beat + Drop Recovery Strategy - Backtest Validated
          </p>
        </div>
        <div className="flex gap-3">
          <StrategyGuideModal />
          <Link href="/options/scanner">
            <Button size="lg">
              <TrendingUp className="mr-2 h-5 w-5" />
              Scan Opportunities
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Suspense fallback={<StatCardSkeleton />}>
          <StatsCards />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<CardSkeleton />}>
          <RecentOpportunitiesCard />
        </Suspense>

        <Suspense fallback={<CardSkeleton />}>
          <OpenPositionsCard />
        </Suspense>
      </div>

      <Suspense fallback={<CardSkeleton />}>
        <PerformanceOverviewCard />
      </Suspense>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          📚 Quick Guide: How This Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
          <div>
            <strong>1. Scanner Finds Opportunities</strong>
            <p className="mt-1">
              Stocks that beat earnings but dropped &gt;5%. Scored 0-100 based on drop size, EPS
              beat, market cap, and sector.
            </p>
          </div>
          <div>
            <strong>2. Paper Trade the Best Ones</strong>
            <p className="mt-1">
              Enter ATM call options (30-45 DTE) on high scores (85+). Practice without real money.
            </p>
          </div>
          <div>
            <strong>3. Track Performance</strong>
            <p className="mt-1">
              Monitor win rate, P&L, and validate the strategy before using real money.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

async function StatsCards() {
  const [opportunities, trades, performance] = await Promise.all([
    getOpportunities({ status: 'pending', minScore: 85 }),
    getOptionTrades({ status: 'open' }),
    calculatePerformance(),
  ])

  const highScoreCount = opportunities.success ? (opportunities.docs?.length || 0) : 0
  const openCount = trades.success ? (trades.docs?.length || 0) : 0
  const winRate =
    performance.success && performance.metrics && performance.metrics.totalTrades > 0 && 'winRate' in performance.metrics
      ? performance.metrics.winRate
      : null
  const totalPnl =
    performance.success && performance.metrics && performance.metrics.totalTrades > 0 && 'totalPnl' in performance.metrics
      ? performance.metrics.totalPnl
      : 0

  const stats = [
    {
      title: 'High-Score Opportunities',
      value: highScoreCount,
      subtitle: 'Score ≥85',
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Open Positions',
      value: openCount,
      subtitle: openCount === 0 ? 'Ready to trade' : 'Active trades',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Win Rate',
      value: winRate !== null ? `${winRate.toFixed(1)}%` : 'N/A',
      subtitle: performance.success && performance.metrics && performance.metrics.totalTrades > 0 && 'winRate' in performance.metrics
        ? `${performance.metrics.totalTrades} trades`
        : 'No trades yet',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total P&L',
      value: `$${totalPnl.toFixed(2)}`,
      subtitle: totalPnl >= 0 ? 'Paper profit' : 'Paper loss',
      icon: DollarSign,
      color: totalPnl >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: totalPnl >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
  ]

  return (
    <>
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
            <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </>
  )
}

async function RecentOpportunitiesCard() {
  const result = await getOpportunities({ minScore: 85, limit: 5 })

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Recent High-Score Opportunities</CardTitle>
          <Link href="/options/scanner">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {result.success && result.docs && result.docs.length > 0 ? (
          <div className="space-y-3">
            {result.docs.map((opp: any) => (
              <div
                key={opp.id}
                className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="font-semibold text-lg">{opp.ticker}</div>
                  <div className="text-sm text-gray-600">
                    Drop: {opp.dropPct.toFixed(1)}% | Beat: +{opp.epsBeatPct.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    <Calendar className="inline h-3 w-3 mr-1" />
                    {new Date(opp.earningsDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-2xl text-green-600">{opp.score}</div>
                  <div className="text-xs text-gray-500">Score</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No opportunities found</p>
            <p className="text-sm mt-1">Run the scanner to find trading opportunities</p>
            <Link href="/options/scanner">
              <Button className="mt-4">
                <TrendingUp className="mr-2 h-4 w-4" />
                Scan Now
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

async function OpenPositionsCard() {
  const result = await getOptionTrades({ status: 'open', limit: 5 })

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Open Positions</CardTitle>
          <Link href="/options/trades">
            <Button variant="outline" size="sm">
              Manage All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {result.success && result.docs && result.docs.length > 0 ? (
          <div className="space-y-3">
            {result.docs.map((trade: any) => {
              const daysOpen = Math.floor(
                (Date.now() - new Date(trade.entryDate).getTime()) / (1000 * 60 * 60 * 24)
              )
              const totalCost = trade.entryPremium * trade.contracts * 100

              return (
                <div
                  key={trade.id}
                  className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-lg">{trade.ticker}</div>
                    <div className="text-sm text-gray-600">
                      {trade.contracts} contract{trade.contracts > 1 ? 's' : ''} @ $
                      {trade.entryPremium.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Strike: ${trade.strikePrice.toFixed(2)} | {daysOpen}d open
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">${totalCost.toFixed(0)}</div>
                    <div className="text-xs text-gray-500">Total cost</div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No open positions</p>
            <p className="text-sm mt-1">Enter your first paper trade to get started</p>
            <Link href="/options/scanner">
              <Button className="mt-4">Find Opportunities</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

async function PerformanceOverviewCard() {
  const result = await calculatePerformance()

  if (!result.success || !result.metrics || result.metrics.totalTrades === 0 || !('winRate' in result.metrics)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No closed trades yet</p>
            <p className="text-sm mt-1">
              Start paper trading to build your track record and validate the strategy
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { metrics } = result

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Performance Overview</CardTitle>
          <Link href="/options/performance">
            <Button variant="outline" size="sm">
              Detailed Analytics
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-600">Total Trades</div>
            <div className="text-3xl font-bold mt-1">{metrics.totalTrades}</div>
            <div className="text-xs text-gray-500 mt-1">
              {metrics.winners}W / {metrics.losers}L
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Win Rate</div>
            <div className="text-3xl font-bold mt-1 text-green-600">
              {metrics.winRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Target: &gt;70%
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Profit Factor</div>
            <div className="text-3xl font-bold mt-1 text-purple-600">
              {metrics.profitFactor.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Target: &gt;1.5
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Avg Holding</div>
            <div className="text-3xl font-bold mt-1 text-blue-600">
              {metrics.avgHoldingDays.toFixed(1)}d
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Typical: 10-20d
            </div>
          </div>
        </div>

        {metrics.recommendations && metrics.recommendations.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Recommendations:</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              {metrics.recommendations.map((rec: string, i: number) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="h-32 animate-pulse bg-gray-100" />
    </Card>
  )
}

function CardSkeleton() {
  return (
    <Card>
      <CardContent className="h-80 animate-pulse bg-gray-100" />
    </Card>
  )
}
