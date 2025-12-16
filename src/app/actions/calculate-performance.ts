'use server'

import config from '@/payload.config'
import { getPayload } from 'payload'
import getSession from './auth-utils'

export async function calculatePerformance() {
  const session = await getSession()
  if (!session?.user?.id) {
    return { success: false, message: 'User not authenticated' }
  }

  try {
    const payload = await getPayload({ config })

    // Get all closed trades
    const { docs: closedTrades } = await payload.find({
      collection: 'option-paper-trades',
      where: {
        and: [
          { investor: { equals: parseInt(session.user.id) } },
          { status: { equals: 'closed' } },
        ],
      },
      limit: 1000, // Assume investor won't have more than 1000 closed trades
      sort: '-exitDate',
    })

    if (closedTrades.length === 0) {
      return {
        success: true,
        metrics: {
          totalTrades: 0,
          message: 'No closed trades yet. Start paper trading to see performance!',
        },
      }
    }

    // Calculate metrics (from Python performance_metrics.py)
    const winners = closedTrades.filter(t => (t.pnlPercent || 0) > 0)
    const losers = closedTrades.filter(t => (t.pnlPercent || 0) <= 0)

    const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnlDollars || 0), 0)
    const avgPnl = totalPnl / closedTrades.length

    const winRate = (winners.length / closedTrades.length) * 100

    const avgWin =
      winners.length > 0 ? winners.reduce((sum, t) => sum + (t.pnlDollars || 0), 0) / winners.length : 0

    const avgLoss =
      losers.length > 0 ? losers.reduce((sum, t) => sum + (t.pnlDollars || 0), 0) / losers.length : 0

    const grossProfits = winners.reduce((sum, t) => sum + (t.pnlDollars || 0), 0)
    const grossLosses = Math.abs(losers.reduce((sum, t) => sum + (t.pnlDollars || 0), 0))
    const profitFactor = grossLosses > 0 ? grossProfits / grossLosses : grossProfits > 0 ? Infinity : 0

    const avgHoldingDays = closedTrades.reduce((sum, t) => sum + (t.holdingDays || 0), 0) / closedTrades.length

    // Exit reasons breakdown
    const exitReasons = {
      profitTarget: closedTrades.filter(t => t.exitReason === 'profit_target').length,
      stopLoss: closedTrades.filter(t => t.exitReason === 'stop_loss').length,
      circuitBreaker: closedTrades.filter(t => t.exitReason === 'day1_circuit_breaker').length,
      timeStop: closedTrades.filter(t => t.exitReason === 'time_stop').length,
      manual: closedTrades.filter(t => t.exitReason === 'manual').length,
    }

    // Calculate percentage returns for histogram
    const returns = closedTrades.map(t => t.pnlPercent || 0)
    const avgReturnPct = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const maxWin = Math.max(...returns)
    const maxLoss = Math.min(...returns)

    // Recent trades for equity curve
    const recentTrades = closedTrades.slice(0, 20).reverse().map(t => ({
      ticker: t.ticker,
      entryDate: t.entryDate,
      exitDate: t.exitDate,
      pnlDollars: t.pnlDollars,
      pnlPercent: t.pnlPercent,
    }))

    // Calculate ROI (cumulative P&L)
    let cumulativePnl = 0
    const equityCurve = closedTrades.map(t => {
      cumulativePnl += t.pnlDollars || 0
      return {
        date: t.exitDate,
        pnl: cumulativePnl,
      }
    })

    const metrics = {
      // Overall stats
      totalTrades: closedTrades.length,
      winners: winners.length,
      losers: losers.length,
      winRate,

      // P&L metrics
      totalPnl,
      avgPnl,
      avgReturnPct,
      avgWin,
      avgLoss,
      maxWin,
      maxLoss,

      // Risk metrics
      profitFactor,
      avgHoldingDays,

      // Breakdown
      exitReasons,

      // Charts data
      recentTrades,
      equityCurve: equityCurve.reverse(),

      // Recommendations
      recommendations: generateRecommendations({
        winRate,
        profitFactor,
        totalTrades: closedTrades.length,
        avgReturnPct,
      }),
    }

    return { success: true, metrics }
  } catch (error: any) {
    console.error('Error calculating performance:', error)
    return { success: false, message: error.message }
  }
}

function generateRecommendations(stats: {
  winRate: number
  profitFactor: number
  totalTrades: number
  avgReturnPct: number
}): string[] {
  const recommendations: string[] = []

  if (stats.totalTrades < 10) {
    recommendations.push('📊 Need more data: Trade at least 10 events before drawing conclusions.')
  }

  if (stats.winRate >= 70 && stats.profitFactor >= 1.5 && stats.totalTrades >= 10) {
    recommendations.push(
      '✅ Strong performance! Consider starting real money with 1-2% position sizes.'
    )
  } else if (stats.winRate < 50) {
    recommendations.push('⚠️ Win rate below 50%. Review your entry/exit criteria.')
  }

  if (stats.profitFactor < 1.0) {
    recommendations.push('⚠️ Losing more than winning. Check stop losses and profit targets.')
  } else if (stats.profitFactor < 1.5 && stats.totalTrades >= 10) {
    recommendations.push('💡 Profit factor below 1.5. Consider tighter stops or wider targets.')
  }

  if (stats.avgReturnPct < 10 && stats.totalTrades >= 10) {
    recommendations.push('💡 Average return low. Consider higher-scoring opportunities (≥85).')
  }

  if (stats.winRate >= 80 && stats.totalTrades >= 10) {
    recommendations.push('🎯 Excellent win rate! Your strategy is working well.')
  }

  return recommendations
}
