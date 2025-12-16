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

          {/* Action Button */}
          {opportunity.status === 'pending' && opportunity.score >= 70 && (
            <Button
              onClick={() => setShowTradeModal(true)}
              className="w-full h-12 text-lg"
              size="lg"
            >
              Enter Paper Trade
            </Button>
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
