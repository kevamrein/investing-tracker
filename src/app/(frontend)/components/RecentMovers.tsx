'use client'

import Link from 'next/link'

interface RecommendationChange {
  company: string
  ticker: string
  currentRec: 'buy' | 'sell' | 'hold'
  reasoning: string
  date: Date
}

interface RecentMoversProps {
  changes: RecommendationChange[]
}

function getRecommendationStyle(rec: 'buy' | 'sell' | 'hold') {
  switch (rec) {
    case 'buy':
      return 'bg-accent text-accent-foreground'
    case 'sell':
      return 'bg-destructive text-destructive-foreground'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

export function RecentMovers({ changes }: RecentMoversProps) {
  return (
    <div className="bg-card shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border border-border/50 overflow-hidden">
      <div className="px-6 py-5 sm:p-6">
        <h2 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
          Recent Market Movers
        </h2>
        <div className="space-y-4">
          {changes.map((change) => (
            <div
              key={`${change.ticker}-${change.date.toISOString()}`}
              className="flex items-start p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/30"
            >
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/stock/${change.ticker}`}
                    className="text-sm font-medium text-card-foreground hover:text-primary transition-colors"
                  >
                    {change.company} ({change.ticker})
                  </Link>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getRecommendationStyle(change.currentRec)}`}
                  >
                    {change.currentRec.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{change.reasoning}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
