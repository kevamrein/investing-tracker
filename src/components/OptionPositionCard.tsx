'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react'
import { useState } from 'react'
import { ClosePositionModal } from './ClosePositionModal'

interface OptionPositionCardProps {
  trade: any
  onPositionClosed?: () => void
}

export function OptionPositionCard({ trade, onPositionClosed }: OptionPositionCardProps) {
  const [showCloseModal, setShowCloseModal] = useState(false)

  const isOpen = trade.status === 'open'
  const isClosed = trade.status === 'closed'
  const isWinner = trade.pnlPercent && trade.pnlPercent > 0

  const daysHeld = trade.holdingDays ||
    (trade.entryDate && Math.floor((Date.now() - new Date(trade.entryDate).getTime()) / (1000 * 60 * 60 * 24)))

  const totalCost = trade.entryPremium * trade.contracts * 100
  const totalValue = trade.exitPremium ? trade.exitPremium * trade.contracts * 100 : null

  return (
    <>
      <Card className={`hover:shadow-lg transition-shadow border-l-4 ${isOpen ? 'border-l-blue-500' : isWinner ? 'border-l-green-500' : 'border-l-red-500'}`}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">{trade.ticker}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-semibold px-2 py-1 rounded ${isOpen ? 'bg-blue-100 text-blue-700' : isClosed ? (isWinner ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') : 'bg-gray-100 text-gray-700'}`}>
                  {trade.status.toUpperCase()}
                </span>
                <span className="text-sm text-gray-600">
                  Score: {trade.score}
                </span>
              </div>
            </div>

            {isClosed && trade.pnlPercent && (
              <div className={`text-right ${isWinner ? 'text-green-600' : 'text-red-600'}`}>
                <div className="text-3xl font-bold">
                  {trade.pnlPercent > 0 ? '+' : ''}{trade.pnlPercent.toFixed(1)}%
                </div>
                <div className="text-sm font-medium">
                  ${trade.pnlDollars?.toFixed(2)}
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Entry Details */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs font-semibold text-gray-600 mb-2">ENTRY DETAILS</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <span className="text-gray-600">Date:</span>
                <span className="ml-2 font-semibold">
                  {new Date(trade.entryDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Stock Price:</span>
                <span className="ml-2 font-semibold">
                  ${trade.stockPriceAtEntry?.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Strike:</span>
                <span className="ml-2 font-semibold">
                  ${trade.strikePrice?.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Premium:</span>
                <span className="ml-2 font-semibold">
                  ${trade.entryPremium?.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Contracts:</span>
                <span className="ml-2 font-semibold">
                  {trade.contracts}
                </span>
              </div>
              <div>
                <span className="text-gray-600">DTE:</span>
                <span className="ml-2 font-semibold">
                  {trade.dteAtEntry}d
                </span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <span className="text-gray-600 text-sm">Total Cost:</span>
              <span className="ml-2 font-bold text-lg">
                ${totalCost.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Exit Details (if closed) */}
          {isClosed && trade.exitDate && (
            <div className={`p-3 rounded-lg ${isWinner ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="text-xs font-semibold text-gray-600 mb-2">EXIT DETAILS</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Date:</span>
                  <span className="ml-2 font-semibold">
                    {new Date(trade.exitDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Stock Price:</span>
                  <span className="ml-2 font-semibold">
                    ${trade.stockPriceAtExit?.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Exit Premium:</span>
                  <span className="ml-2 font-semibold">
                    ${trade.exitPremium?.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Reason:</span>
                  <span className="ml-2 font-semibold text-xs capitalize">
                    {trade.exitReason?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
              {totalValue && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <span className="text-gray-600 text-sm">Total Value:</span>
                  <span className="ml-2 font-bold text-lg">
                    ${totalValue.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Trade Metrics */}
          <div className="flex items-center justify-between text-sm border-t pt-3">
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Holding Period:</span>
            </div>
            <span className="font-semibold">{daysHeld}d</span>
          </div>

          {/* Earnings Context */}
          <div className="bg-blue-50 p-2 rounded text-xs space-y-1">
            <div className="font-semibold text-blue-900">Original Opportunity:</div>
            <div className="text-blue-800">
              Drop: {trade.dropPct?.toFixed(1)}% | EPS Beat: +{trade.epsBeatPct?.toFixed(1)}%
            </div>
            <div className="text-blue-700">
              Earnings: {new Date(trade.earningsDate).toLocaleDateString()}
            </div>
          </div>

          {/* Notes */}
          {trade.notes && (
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <strong>Notes:</strong> {trade.notes}
            </div>
          )}

          {/* Action Button */}
          {isOpen && (
            <Button
              onClick={() => setShowCloseModal(true)}
              variant="default"
              className="w-full h-11"
              size="lg"
            >
              <DollarSign className="mr-2 h-5 w-5" />
              Close Position
            </Button>
          )}

          {isClosed && (
            <div className={`text-center py-2 rounded font-semibold ${isWinner ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
              {isWinner ? '✅ Winner!' : '❌ Loss'}
            </div>
          )}
        </CardContent>
      </Card>

      {isOpen && (
        <ClosePositionModal
          isOpen={showCloseModal}
          onClose={() => setShowCloseModal(false)}
          trade={trade}
          onPositionClosed={() => {
            setShowCloseModal(false)
            onPositionClosed?.()
          }}
        />
      )}
    </>
  )
}
