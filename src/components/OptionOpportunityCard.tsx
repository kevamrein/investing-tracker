'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingDown, TrendingUp, Calendar, Building2 } from 'lucide-react'
import { useState } from 'react'
import { OptionTradeFormModal } from './OptionTradeFormModal'

interface OptionOpportunityCardProps {
  opportunity: any
  onTradeCreated?: () => void
}

export function OptionOpportunityCard({ opportunity, onTradeCreated }: OptionOpportunityCardProps) {
  const [showTradeModal, setShowTradeModal] = useState(false)

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const getSignal = (score: number) => {
    if (score >= 85) return { emoji: '🟢', text: 'STRONG BUY', color: 'text-green-700' }
    if (score >= 70) return { emoji: '🟡', text: 'CONSIDER', color: 'text-yellow-700' }
    return { emoji: '🔴', text: 'AVOID', color: 'text-gray-600' }
  }

  const signal = getSignal(opportunity.score)

  return (
    <>
      <Card className="hover:shadow-xl transition-all duration-300 border-2">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold">{opportunity.ticker}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{opportunity.companyName}</p>
              {opportunity.sector && (
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                  <Building2 className="h-3 w-3" />
                  <span className="capitalize">{opportunity.sector}</span>
                </div>
              )}
            </div>
            <div className={`px-4 py-2 rounded-lg font-bold text-lg border-2 ${getScoreColor(opportunity.score)}`}>
              {opportunity.score}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="flex items-center text-sm text-red-600 font-medium mb-1">
                <TrendingDown className="h-4 w-4 mr-1" />
                Price Drop
              </div>
              <div className="text-2xl font-bold text-red-700">
                {opportunity.dropPct.toFixed(1)}%
              </div>
              <div className="text-xs text-red-600 mt-1">
                ${opportunity.preEarningsPrice?.toFixed(2)} → ${opportunity.postEarningsPrice?.toFixed(2)}
              </div>
            </div>

            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center text-sm text-green-600 font-medium mb-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                EPS Beat
              </div>
              <div className="text-2xl font-bold text-green-700">
                +{opportunity.epsBeatPct.toFixed(1)}%
              </div>
              <div className="text-xs text-green-600 mt-1">
                Beat estimates
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Earnings Date
              </span>
              <span className="font-semibold">
                {new Date(opportunity.earningsDate).toLocaleDateString()}
              </span>
            </div>

            {opportunity.currentPrice && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Current Price</span>
                <span className="font-semibold text-lg">
                  ${opportunity.currentPrice.toFixed(2)}
                </span>
              </div>
            )}

            {opportunity.marketCap && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Market Cap</span>
                <span className="font-semibold">
                  ${(opportunity.marketCap / 1_000_000_000).toFixed(1)}B
                </span>
              </div>
            )}
          </div>

          {/* Signal */}
          <div className={`text-center py-3 rounded-lg font-bold text-lg ${signal.color} bg-gradient-to-r ${opportunity.score >= 85 ? 'from-green-50 to-green-100' : opportunity.score >= 70 ? 'from-yellow-50 to-yellow-100' : 'from-gray-50 to-gray-100'}`}>
            {signal.emoji} {signal.text}
          </div>

          {/* Entry Timing and Day 1 Status */}
          {opportunity.status === 'pending' && opportunity.score >= 70 && (
            <>
              {/* Entry Window Status */}
              {opportunity.entryWindow === 'wait_day1' && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3 text-xs">
                  <div className="font-semibold text-yellow-900 mb-1">⏳ WAIT FOR DAY 1 CLOSE</div>
                  <div className="text-yellow-800">
                    Earnings just reported. Monitor stock price today and check again after market close to see if it stabilized or continued dropping.
                  </div>
                </div>
              )}

              {opportunity.entryStatus === 'ready' && opportunity.entryWindow === 'optimal' && (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3 text-xs">
                  <div className="font-semibold text-green-900 mb-1">✅ READY TO TRADE (Day {opportunity.daysSinceEarnings})</div>
                  <div className="text-green-800 space-y-1">
                    <div>Day 1 Change: <strong>{opportunity.day1Change?.toFixed(2)}%</strong> (stable ✅)</div>
                    <div>Stock passed Day 1 stability check. Optimal entry window is NOW (Day 1-3).</div>
                  </div>
                </div>
              )}

              {opportunity.entryStatus === 'skip' && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-3 text-xs">
                  <div className="font-semibold text-red-900 mb-1">❌ SKIP THIS TRADE</div>
                  <div className="text-red-800 space-y-1">
                    <div>Day 1 Change: <strong>{opportunity.day1Change?.toFixed(2)}%</strong> (dropped &gt;5% ❌)</div>
                    <div>Stock continued dropping on Day 1. Historical data shows 0% win rate for these setups. Skip and wait for next opportunity.</div>
                  </div>
                </div>
              )}

              {opportunity.entryWindow === 'late' && opportunity.entryStatus === 'ready' && (
                <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-3 text-xs">
                  <div className="font-semibold text-orange-900 mb-1">⚠️ LATE ENTRY (Day {opportunity.daysSinceEarnings})</div>
                  <div className="text-orange-800">
                    Day 1 was stable but you&apos;re entering late. Theta decay is already working against you. Consider skipping and waiting for fresher opportunities.
                  </div>
                </div>
              )}

              {/* General Best Practice (for upcoming or pending Day 1) */}
              {!opportunity.entryWindow && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
                  <div className="font-semibold text-blue-900 mb-1">⭐ Best Practice:</div>
                  <div className="text-blue-800">
                    Wait until Day 1 close to confirm stock stability. Only enter if stock is flat or up from post-earnings price. Skip if stock drops &gt;5% on Day 1.
                  </div>
                </div>
              )}
            </>
          )}

          {/* Action Button */}
          {opportunity.status === 'pending' && opportunity.score >= 70 && (
            <>
              {/* Only show trade button if ready to trade */}
              {(opportunity.entryStatus === 'ready' || !opportunity.entryStatus) && opportunity.entryStatus !== 'skip' && (
                <Button
                  onClick={() => setShowTradeModal(true)}
                  className="w-full h-12 text-lg"
                  size="lg"
                  variant={opportunity.entryWindow === 'late' ? 'outline' : 'default'}
                >
                  {opportunity.entryWindow === 'late' ? 'Enter Trade (Late Entry)' : 'Enter Paper Trade'}
                </Button>
              )}

              {/* Disabled button for skip status */}
              {opportunity.entryStatus === 'skip' && (
                <Button
                  disabled
                  className="w-full h-12 text-lg"
                  size="lg"
                  variant="outline"
                >
                  Skip This Trade (Day 1 Failed)
                </Button>
              )}

              {/* Waiting for Day 1 button */}
              {opportunity.entryWindow === 'wait_day1' && (
                <Button
                  disabled
                  className="w-full h-12 text-lg"
                  size="lg"
                  variant="outline"
                >
                  ⏳ Waiting for Day 1 Close
                </Button>
              )}
            </>
          )}

          {opportunity.status === 'traded' && (
            <div className="text-center text-sm text-green-600 font-medium py-3 bg-green-50 rounded-lg">
              ✓ Trade Entered
            </div>
          )}

          {opportunity.status === 'dismissed' && (
            <div className="text-center text-sm text-gray-500 font-medium py-3 bg-gray-50 rounded-lg">
              Dismissed
            </div>
          )}
        </CardContent>
      </Card>

      <OptionTradeFormModal
        isOpen={showTradeModal}
        onClose={() => setShowTradeModal(false)}
        opportunity={opportunity}
        onTradeCreated={() => {
          setShowTradeModal(false)
          onTradeCreated?.()
        }}
      />
    </>
  )
}
