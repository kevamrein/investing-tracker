'use client'

import { Suspense } from 'react'
import { RecentMovers } from './RecentMovers'

interface RecentMoversClientProps {
  changes: Array<{
    company: string
    ticker: string
    currentRec: 'buy' | 'sell' | 'hold'
    reasoning: string
    date: Date
  }>
}

export function RecentMoversClient({ changes }: RecentMoversClientProps) {
  return (
    <Suspense
      fallback={<div className="bg-white shadow rounded-lg p-6">Loading recent movers...</div>}
    >
      <RecentMovers changes={changes} />
    </Suspense>
  )
}
