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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl">Beat + Drop Recovery Strategy</DialogTitle>
          <DialogDescription>Quick reference guide for trading decisions</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-6">
          {/* Entry Criteria */}
          <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
              <span className="mr-2">📊</span> WHEN TO BUY
            </h3>
            <div className="space-y-3 text-sm text-blue-900">
              <div className="flex items-start">
                <span className="font-semibold min-w-[140px]">Scanner Score:</span>
                <span>≥70 (🟡 Consider) or ≥85 (🟢 Strong Buy)</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold min-w-[140px]">Opportunity:</span>
                <span>Stock beat earnings but dropped ≥10%</span>
              </div>
              <div className="bg-white rounded p-3 border border-blue-200 col-span-2">
                <div className="font-semibold text-blue-900 mb-2">⭐ BEST TIMING (Recommended):</div>
                <div className="space-y-1 text-xs">
                  <div>1. <strong>Wait for Day 1 close</strong> after earnings (don&apos;t enter immediately)</div>
                  <div>2. Check if stock is <strong>stable or bouncing</strong> (flat to +5% from post-earnings)</div>
                  <div>3. If Day 1 is <strong>green or flat → ENTER</strong> ✅</div>
                  <div>4. If Day 1 dropped <strong>&gt;5% → SKIP</strong> ❌</div>
                </div>
                <div className="text-xs text-blue-700 mt-2 bg-blue-100 p-2 rounded">
                  <strong>Why?</strong> Stocks that continue dropping Day 1 have 0% win rate. Waiting 1 day filters bad setups BEFORE risking capital.
                </div>
              </div>
              <div className="bg-white rounded p-3 border border-blue-200 col-span-2">
                <div className="font-semibold text-blue-900 mb-2">🎯 Drop Size Sweet Spot:</div>
                <div className="space-y-1 text-xs">
                  <div>• <strong>10-15% drops:</strong> 60% win rate (BEST) ⭐</div>
                  <div>• <strong>&lt;10% drops:</strong> Strong performance (limited data)</div>
                  <div>• <strong>15-25% drops:</strong> 38% win rate (risky)</div>
                  <div>• <strong>&gt;25% drops:</strong> 25% win rate (avoid)</div>
                </div>
                <div className="text-xs text-blue-700 mt-2 bg-blue-100 p-2 rounded">
                  <strong>Insight:</strong> Bigger drops don&apos;t mean better opportunities. Focus on 10-15% drops for best results.
                </div>
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
                  <span className="font-semibold text-orange-900">⚠️ Day 1 Circuit Breaker (CRITICAL)</span>
                  <span className="text-2xl font-bold text-orange-700">-5% Stock</span>
                </div>
                <div className="text-sm text-gray-700">
                  If <strong>STOCK</strong> drops &gt;5% on Day 1 from your entry → EXIT immediately
                </div>
                <div className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded">
                  Example: Entered when stock at $150 → If stock drops to $142.50 (-5%) by end of Day 1, sell the option
                </div>
                <div className="text-xs text-orange-700 mt-2 bg-orange-50 p-2 rounded font-semibold">
                  ⭐ This rule avoids 23% of losers while sacrificing 0% of winners. Historical data shows stocks that continue dropping Day 1 never recover fast enough for option profits.
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
            <h3 className="text-lg font-bold text-gray-900 mb-3">💡 Example Trade (Following New Rules)</h3>
            <div className="space-y-2 text-sm">
              <div className="bg-white rounded p-2 border">
                <strong>Day 0 - Earnings:</strong> PSTG beat EPS, dropped 12% to $69.91
              </div>
              <div className="bg-white rounded p-2 border">
                <strong>Day 1 - Wait &amp; Observe:</strong> Stock at $70.50 (+0.8%) ✅ Stability confirmed → ENTER
              </div>
              <div className="bg-white rounded p-2 border">
                <strong>Entry:</strong> Stock at $70.50, bought $70 call, 35 DTE, $11.50 premium
              </div>
              <div className="bg-white rounded p-2 border">
                <strong>Cost:</strong> $11.50 × 100 = $1,150 per contract
              </div>
              <div className="bg-white rounded p-2 border">
                <strong>Profit Target:</strong> $11.50 × 1.5 = $17.25 → Exit at $1,725 (+$575, 50%)
              </div>
              <div className="bg-white rounded p-2 border">
                <strong>Stop Loss:</strong> $11.50 × 0.7 = $8.05 → Exit at $805 (-$345, -30%)
              </div>
              <div className="bg-white rounded p-2 border">
                <strong>Circuit Breaker:</strong> If stock drops below $66.98 (-5%) on Day 2, exit immediately
              </div>
              <div className="bg-white rounded p-2 border">
                <strong>Result:</strong> Day 7 - Stock at $73.66 (+4.5%), option at $17.50 → HIT PROFIT TARGET (+52%) ✅
              </div>
            </div>
          </div>

          {/* Performance Expectations */}
          <div className="border-2 border-purple-200 bg-purple-50 rounded-lg p-4">
            <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center">
              <span className="mr-2">📈</span> Expected Performance (Backtest Data)
            </h3>
            <div className="space-y-3 text-sm">
              <div className="bg-white rounded p-3 border border-purple-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-purple-900">Current Strategy (Immediate Entry):</span>
                </div>
                <div className="space-y-1 text-xs text-purple-800">
                  <div>• Win Rate: 48% (12 winners, 13 losers from 25 historical trades)</div>
                  <div>• Average Winner: +105% return</div>
                  <div>• Average Loser: -70% return</div>
                  <div>• Expected Return: +13.5% per trade</div>
                </div>
              </div>
              <div className="bg-white rounded p-3 border border-green-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-green-900">Enhanced Strategy (Day 1 Circuit Breaker):</span>
                </div>
                <div className="space-y-1 text-xs text-green-800">
                  <div>• Win Rate: 55% (12 winners, 10 losers, filtered out 3 bad trades)</div>
                  <div>• Average Winner: +105% return</div>
                  <div>• Average Loser: -70% return</div>
                  <div>• Expected Return: +24.1% per trade</div>
                  <div className="text-green-700 font-semibold mt-1">✅ +7% win rate improvement, +11% higher returns</div>
                </div>
              </div>
              <div className="bg-white rounded p-3 border border-blue-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-blue-900">Optimal Strategy (Wait for Day 1):</span>
                </div>
                <div className="space-y-1 text-xs text-blue-800">
                  <div>• Estimated Win Rate: 60%+ (by filtering before entry)</div>
                  <div>• Only enter on confirmed stability/bounce</div>
                  <div>• Avoid 3+ losers entirely by not entering</div>
                  <div className="text-blue-700 font-semibold mt-1">⭐ BEST approach for capital preservation</div>
                </div>
              </div>
              <div className="text-xs text-purple-700 bg-purple-100 p-3 rounded mt-2">
                <strong>Key Insight:</strong> All 25 historical stocks eventually recovered 50%+ within 30 days. However, only 48% of immediate-entry option trades captured this profitably. Winners recovered fast (1-7 days), losers recovered too slowly (option theta killed gains). The enhanced rules improve timing to capture fast recoveries.
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
              <li>• <strong>NEW: Day 1 monitoring is CRITICAL</strong> - check stock price at end of first trading day</li>
              <li>• Track all trades to calculate actual win rate and profit factor</li>
            </ul>
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
