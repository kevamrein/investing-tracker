'use server'

import config from '@/payload.config'
import { getPayload } from 'payload'
import getSession from './auth-utils'

interface CreateTradeParams {
  opportunityId: string
  stockPrice: number
  strikePrice: number
  premium: number
  dte: number
  contracts: number
  notes?: string
}

export async function createOptionTrade(params: CreateTradeParams) {
  const session = await getSession()
  if (!session?.user?.id) {
    return { success: false, message: 'User not authenticated' }
  }

  try {
    const payload = await getPayload({ config })

    // Get the opportunity
    const opportunity = await payload.findByID({
      collection: 'option-opportunities',
      id: params.opportunityId,
    })

    if (!opportunity) {
      return { success: false, message: 'Opportunity not found' }
    }

    // Verify ownership
    if (opportunity.investor !== parseInt(session.user.id)) {
      return { success: false, message: 'Not authorized to trade this opportunity' }
    }

    if (opportunity.status !== 'pending') {
      return { success: false, message: `Opportunity is already ${opportunity.status}` }
    }

    // Validate inputs
    if (params.contracts < 1) {
      return { success: false, message: 'Must trade at least 1 contract' }
    }

    if (params.dte < 1) {
      return { success: false, message: 'DTE must be at least 1 day' }
    }

    if (params.premium <= 0 || params.stockPrice <= 0 || params.strikePrice <= 0) {
      return { success: false, message: 'Prices must be positive' }
    }

    // Create the trade
    const trade = await payload.create({
      collection: 'option-paper-trades',
      draft: false,
      data: {
        tradeId: `TRADE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ticker: opportunity.ticker,
        investor: parseInt(session.user.id),
        opportunity: opportunity.id,

        // Copy opportunity context
        earningsDate: opportunity.earningsDate,
        identifiedDate: opportunity.identifiedDate,
        dropPct: opportunity.dropPct,
        epsBeatPct: opportunity.epsBeatPct,
        score: opportunity.score,

        // Entry details
        entryDate: new Date().toISOString(),
        stockPriceAtEntry: params.stockPrice,
        strikePrice: params.strikePrice,
        entryPremium: params.premium,
        contracts: params.contracts,
        dteAtEntry: params.dte,

        // Status
        status: 'open',
        notes: params.notes || '',
        strategy: 'beat_drop_recovery',
      },
    })

    // Update opportunity status
    await payload.update({
      collection: 'option-opportunities',
      id: opportunity.id,
      data: {
        status: 'traded',
      },
    })

    const totalCost = params.premium * params.contracts * 100

    console.log(`✅ Trade created: ${opportunity.ticker} - ${params.contracts} contracts @ $${params.premium} (Total: $${totalCost})`)

    return {
      success: true,
      trade,
      totalCost,
      message: `Successfully entered ${params.contracts} contract(s) for ${opportunity.ticker}`,
    }
  } catch (error: any) {
    console.error('Error creating trade:', error)
    return { success: false, message: error.message }
  }
}
