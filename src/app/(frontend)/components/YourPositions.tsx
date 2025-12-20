'use client'

import Link from 'next/link'

interface Position {
  companyId: number
  companyName: string
  ticker: string
  accountType: string
  shares: number
  costBasis: number
  avgCostPerShare: number
  currentPrice: number | null
  currentValue: number | null
  unrealizedGainLoss: number | null
  unrealizedGainLossPct: number | null
  recommendation: {
    type: 'buy' | 'sell' | 'hold'
    reasoning: string
    date: string
  } | null
}

interface YourPositionsProps {
  positionsData: {
    positions: Position[]
    totals: {
      overall: {
        costBasis: number
        currentValue: number
        unrealizedGainLoss: number
      }
    }
  }
}

function RecommendationBadge({ type }: { type: 'buy' | 'sell' | 'hold' }) {
  const styles = {
    buy: 'bg-accent text-accent-foreground',
    sell: 'bg-destructive text-destructive-foreground',
    hold: 'bg-muted text-muted-foreground',
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[type]}`}>
      {type.toUpperCase()}
    </span>
  )
}

function formatCurrency(amount: number | null) {
  if (amount === null) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

function formatPercent(percent: number | null) {
  if (percent === null) return ''
  return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`
}

export function YourPositions({ positionsData }: YourPositionsProps) {
  const { positions, totals } = positionsData

  if (positions.length === 0) {
    return (
      <div className="bg-card shadow-lg rounded-xl p-6 border border-border/50">
        <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
          💼 Your Positions
        </h2>
        <p className="text-muted-foreground">You don&apos;t have any open positions yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-card shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-border/50 overflow-hidden">
      <div className="px-6 py-5 sm:p-6">
        <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
          💼 Your Positions
        </h2>

        <div className="space-y-4">
          {positions.map((position) => {
            const gainLossColor =
              position.unrealizedGainLoss !== null
                ? position.unrealizedGainLoss >= 0
                  ? 'text-green-500'
                  : 'text-red-500'
                : 'text-muted-foreground'

            return (
              <div
                key={`${position.companyId}-${position.accountType}`}
                className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/30"
              >
                {/* Header: Company name and recommendation */}
                <div className="flex items-center justify-between mb-3">
                  <Link
                    href={`/stock/${position.ticker}`}
                    className="text-base font-semibold text-card-foreground hover:text-primary transition-colors"
                  >
                    {position.companyName} ({position.ticker})
                  </Link>
                  {position.recommendation && (
                    <RecommendationBadge type={position.recommendation.type} />
                  )}
                </div>

                {/* Account type */}
                <div className="text-xs text-muted-foreground mb-3">
                  {position.accountType === 'taxable' ? 'Taxable Account' : 'IRA Account'}
                </div>

                {/* Position details grid */}
                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Shares:</span>
                    <span className="ml-2 font-medium">{position.shares.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg Cost:</span>
                    <span className="ml-2 font-medium">
                      {formatCurrency(position.avgCostPerShare)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cost Basis:</span>
                    <span className="ml-2 font-medium">{formatCurrency(position.costBasis)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current Price:</span>
                    <span className="ml-2 font-medium">
                      {formatCurrency(position.currentPrice)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current Value:</span>
                    <span className="ml-2 font-medium">
                      {formatCurrency(position.currentValue)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gain/Loss:</span>
                    <span className={`ml-2 font-semibold ${gainLossColor}`}>
                      {formatCurrency(position.unrealizedGainLoss)}
                      {position.unrealizedGainLossPct !== null && (
                        <span className="ml-1 text-xs">
                          ({formatPercent(position.unrealizedGainLossPct)})
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Recommendation reasoning */}
                {position.recommendation && (
                  <div className="mt-3 pt-3 border-t border-border/30">
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      Recommendation:
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {position.recommendation.reasoning}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Summary totals */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Total Cost Basis</p>
              <p className="font-semibold text-base">
                {formatCurrency(totals.overall.costBasis)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Current Value</p>
              <p className="font-semibold text-base">
                {formatCurrency(totals.overall.currentValue)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Total Gain/Loss</p>
              <p
                className={`font-semibold text-base ${
                  totals.overall.unrealizedGainLoss >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {formatCurrency(totals.overall.unrealizedGainLoss)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
