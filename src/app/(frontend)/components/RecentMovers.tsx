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
      return 'bg-green-100 text-green-800'
    case 'sell':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function RecentMovers({ changes }: RecentMoversProps) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Market Movers</h2>
        <div className="space-y-4">
          {changes.map((change) => (
            <div key={`${change.ticker}-${change.date.toISOString()}`} className="flex items-start">
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/stock/${change.ticker}`}
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {change.company} ({change.ticker})
                  </Link>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getRecommendationStyle(change.currentRec)}`}
                  >
                    {change.currentRec.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{change.reasoning}</p>
                <p className="text-xs text-gray-400 mt-1">{change.date.toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
