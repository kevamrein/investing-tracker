'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { BookOpen } from 'lucide-react'

export function StrategyGuideModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          <BookOpen className="mr-2 h-4 w-4" />
          Strategy Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Beat + Drop Recovery Strategy</DialogTitle>
          <DialogDescription>Quick reference guide for trading decisions</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Entry Criteria */}
          <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
              <span className="mr-2">📊</span> WHEN TO BUY
            </h3>
            <div className="space-y-2 text-sm text-blue-900">
              <div className="flex items-start">
                <span className="font-semibold min-w-[140px]">Scanner Score:</span>
                <span>≥85 (🟢 Strong Buy) or 70-84 (🟡 Consider)</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold min-w-[140px]">Opportunity:</span>
                <span>Stock beat earnings but dropped ≥5%</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold min-w-[140px]">Timing:</span>
                <span>Enter within 1-3 days after earnings</span>
              </div>
            </div>
          </div>

          {/* What to Buy */}
          <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center">
              <span className="mr-2">🎯</span> WHAT TO BUY
            </h3>
            <div className="space-y-3">
              <div className="bg-white rounded p-3 border border-green-200">
                <div className="font-semibold text-green-900 mb-2">Option Type:</div>
                <div className="text-green-800">CALL options (always calls)</div>
              </div>
              <div className="bg-white rounded p-3 border border-green-200">
                <div className="font-semibold text-green-900 mb-2">Strike Price:</div>
                <div className="text-green-800">
                  <strong>ATM (At-The-Money)</strong> - Strike closest to current stock price
                </div>
                <div className="text-xs text-green-700 mt-1">
                  Example: Stock at $152 → Buy $150 or $155 strike
                </div>
              </div>
              <div className="bg-white rounded p-3 border border-green-200">
                <div className="font-semibold text-green-900 mb-2">Expiration:</div>
                <div className="text-green-800">
                  <strong>30-45 DTE</strong> (Days To Expiration) - Default: 35 days
                </div>
                <div className="text-xs text-green-700 mt-1">
                  Gives stock time to recover without excessive theta decay
                </div>
              </div>
              <div className="bg-white rounded p-3 border border-green-200">
                <div className="font-semibold text-green-900 mb-2">Premium:</div>
                <div className="text-green-800">
                  Pay the <strong>market ASK price</strong> (check your broker&apos;s option chain)
                </div>
              </div>
              <div className="bg-white rounded p-3 border border-green-200">
                <div className="font-semibold text-green-900 mb-2">Position Size:</div>
                <div className="text-green-800">
                  Start with <strong>1 contract</strong> ($1,000-$1,500 typical cost)
                </div>
                <div className="text-xs text-green-700 mt-1">
                  Real money: Risk 1-2% of portfolio per trade
                </div>
              </div>
            </div>
          </div>

          {/* Exit Rules */}
          <div className="border-2 border-red-200 bg-red-50 rounded-lg p-4">
            <h3 className="text-lg font-bold text-red-900 mb-3 flex items-center">
              <span className="mr-2">🚪</span> WHEN TO SELL
            </h3>
            <div className="space-y-3">
              <div className="bg-white rounded p-3 border border-green-300 border-l-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-green-900">✅ Profit Target</span>
                  <span className="text-2xl font-bold text-green-700">+50%</span>
                </div>
                <div className="text-sm text-gray-700">
                  Option premium increases 50% from entry → SELL
                </div>
                <div className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                  Example: Bought at $10.00 → Sell at $15.00
                </div>
              </div>

              <div className="bg-white rounded p-3 border border-red-300 border-l-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-red-900">🛑 Stop Loss</span>
                  <span className="text-2xl font-bold text-red-700">-30%</span>
                </div>
                <div className="text-sm text-gray-700">
                  Option premium drops 30% from entry → SELL (cut losses)
                </div>
                <div className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                  Example: Bought at $10.00 → Sell at $7.00
                </div>
              </div>

              <div className="bg-white rounded p-3 border border-orange-300 border-l-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-orange-900">⚠️ Day 1 Circuit Breaker</span>
                  <span className="text-2xl font-bold text-orange-700">-10%</span>
                </div>
                <div className="text-sm text-gray-700">
                  Down 10% on DAY 1 of holding → SELL (avoid deeper losses)
                </div>
                <div className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                  Example: Bought at $10.00 → If drops to $9.00 on day 1, exit immediately
                </div>
              </div>

              <div className="bg-white rounded p-3 border border-purple-300 border-l-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-purple-900">⏰ Time Stop</span>
                  <span className="text-2xl font-bold text-purple-700">21 DTE</span>
                </div>
                <div className="text-sm text-gray-700">
                  When 21 days left to expiration → SELL (regardless of P&L)
                </div>
                <div className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                  Avoid accelerating theta decay in final 3 weeks
                </div>
              </div>
            </div>
          </div>

          {/* Quick Reference */}
          <div className="border-2 border-gray-300 bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">📋 Quick Checklist</h3>
            <ol className="space-y-2 text-sm text-gray-800">
              <li className="flex items-start">
                <span className="font-bold mr-2 min-w-[24px]">1.</span>
                <span>Scanner finds opportunity (score ≥85)</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2 min-w-[24px]">2.</span>
                <span>Open broker → Look up stock option chain</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2 min-w-[24px]">3.</span>
                <span>Find expiration ~35 days out</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2 min-w-[24px]">4.</span>
                <span>Find ATM strike (closest to current price)</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2 min-w-[24px]">5.</span>
                <span>Note the ASK premium price</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2 min-w-[24px]">6.</span>
                <span>Calculate profit target (+50%) and stop loss (-30%)</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2 min-w-[24px]">7.</span>
                <span>Set alerts or monitor daily</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2 min-w-[24px]">8.</span>
                <span>Exit when ANY exit condition is met</span>
              </li>
            </ol>
          </div>

          {/* Example */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-300 rounded-lg p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-3">💡 Example Trade</h3>
            <div className="space-y-2 text-sm">
              <div className="bg-white rounded p-2 border">
                <strong>Opportunity:</strong> SNOW dropped 8%, beat EPS by 12%, Score: 92
              </div>
              <div className="bg-white rounded p-2 border">
                <strong>Entry:</strong> Stock at $152, bought $150 call, 35 DTE, $12.80 premium
              </div>
              <div className="bg-white rounded p-2 border">
                <strong>Cost:</strong> $12.80 × 100 = $1,280 per contract
              </div>
              <div className="bg-white rounded p-2 border">
                <strong>Profit Target:</strong> $12.80 × 1.5 = $19.20 → Exit at $1,920 (+$640)
              </div>
              <div className="bg-white rounded p-2 border">
                <strong>Stop Loss:</strong> $12.80 × 0.7 = $8.96 → Exit at $896 (-$384)
              </div>
              <div className="bg-white rounded p-2 border">
                <strong>Time Stop:</strong> Close at 21 DTE (14 days from now)
              </div>
            </div>
          </div>

          {/* Risk Warning */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
            <h3 className="text-sm font-bold text-yellow-900 mb-2">⚠️ Important Reminders</h3>
            <ul className="space-y-1 text-xs text-yellow-900">
              <li>• Paper trade first to validate strategy with real opportunities</li>
              <li>• Never risk more than 1-2% of portfolio on a single trade</li>
              <li>• Options can expire worthless - only trade with risk capital</li>
              <li>• Exit rules are mandatory - stick to them religiously</li>
              <li>• Track all trades to calculate actual win rate and profit factor</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
