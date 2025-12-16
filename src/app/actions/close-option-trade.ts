'use server'

import config from '@/payload.config'
import { getPayload } from 'payload'
import getSession from './auth-utils'

interface CloseTradeParams {
  tradeId: string
  stockPrice: number
  exitPremium: number
  exitReason: 'profit_target' | 'stop_loss' | 'time_stop' | 'day1_circuit_breaker' | 'manual'
  notes?: string
}

export async function closeOptionTrade(params: CloseTradeParams) {
  const session = await getSession()
  if (!session?.user?.id) {
    return { success: false, message: 'User not authenticated' }
  }

  try {
    const payload = await getPayload({ config })

    // Get the trade
    const trade = await payload.findByID({
      collection: 'option-paper-trades',
      id: params.tradeId,
    })

    if (!trade) {
      return { success: false, message: 'Trade not found' }
    }

    // Verify ownership
    if (trade.investor !== parseInt(session.user.id)) {
      return { success: false, message: 'Not authorized to close this trade' }
    }

    if (trade.status !== 'open') {
      return { success: false, message: `Can only close open positions. Current status: ${trade.status}` }
    }

    // Validate inputs
    if (params.stockPrice <= 0 || params.exitPremium < 0) {
      return { success: false, message: 'Stock price and premium must be positive' }
    }

    // Update trade (hooks will auto-calculate P&L)
    const updatedTrade = await payload.update({
      collection: 'option-paper-trades',
      id: trade.id,
      data: {
        exitDate: new Date().toISOString(),
        stockPriceAtExit: params.stockPrice,
        exitPremium: params.exitPremium,
        exitReason: params.exitReason,
        status: 'closed',
        notes: trade.notes + (params.notes ? `\n[Exit] ${params.notes}` : ''),
      },
    })

    // Calculate P&L for response (redundant but shows user immediately)
    const pnlDollars = (params.exitPremium - trade.entryPremium) * trade.contracts * 100
    const pnlPercent = ((params.exitPremium - trade.entryPremium) / trade.entryPremium) * 100
    const isWinner = pnlDollars > 0

    const exitReasonLabel = {
      profit_target: 'Profit Target',
      stop_loss: 'Stop Loss',
      time_stop: 'Time Stop',
      day1_circuit_breaker: 'Circuit Breaker',
      manual: 'Manual Exit',
    }[params.exitReason]

    console.log(
      `${isWinner ? '✅' : '❌'} Trade closed: ${trade.ticker} - ${exitReasonLabel} - P&L: $${pnlDollars.toFixed(
        2
      )} (${pnlPercent > 0 ? '+' : ''}${pnlPercent.toFixed(1)}%)`
    )

    return {
      success: true,
      trade: updatedTrade,
      pnlDollars,
      pnlPercent,
      isWinner,
      exitReason: exitReasonLabel,
      message: `Position closed: ${isWinner ? 'Winner! 🎉' : 'Loss 📉'} ${pnlPercent > 0 ? '+' : ''}${pnlPercent.toFixed(1)}%`,
    }
  } catch (error: any) {
    console.error('Error closing trade:', error)
    return { success: false, message: error.message }
  }
}
