'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import { sql } from '@payloadcms/db-postgres/drizzle'
import getSession from './auth-utils'

export async function getCurrentPositions() {
  const payload = await getPayload({ config })
  const session = await getSession()
  const investorId = session?.user?.id

  if (!investorId) {
    return {
      positions: [],
      totals: { overall: { costBasis: 0, currentValue: 0, unrealizedGainLoss: 0 } },
    }
  }

  // Step 1: Query net shares per company/account using SQL
  const netSharesResult = await payload.db.drizzle.execute(sql`
    SELECT
      company_id as company,
      account_type,
      SUM(CASE WHEN transaction_type = 'buy' THEN shares ELSE -shares END) as net_shares
    FROM investment
    WHERE investor_mapping_id = ${investorId}
    GROUP BY company_id, account_type
    HAVING SUM(CASE WHEN transaction_type = 'buy' THEN shares ELSE -shares END) > 0
  `)

  // Step 2: Process each position
  const positions = await Promise.all(
    (netSharesResult.rows as any[]).map(async (row) => {
      const companyId = row.company
      const accountType = row.account_type
      const netShares = parseFloat(row.net_shares)

      // Fetch all transactions for FIFO calculation
      const investments = await payload.find({
        collection: 'investment',
        where: {
          company: { equals: companyId },
          investorMapping: { equals: investorId },
          accountType: { equals: accountType },
        },
        sort: 'investmentDate',
      })

      // FIFO cost basis calculation (from investable-assets-util.ts lines 46-69)
      const buyQueue: { shares: number; price: number }[] = []

      for (const inv of investments.docs) {
        if (inv.transactionType === 'buy') {
          buyQueue.push({ shares: inv.shares, price: inv.pricePerShare })
        } else if (inv.transactionType === 'sell') {
          let remainingSell = inv.shares
          while (remainingSell > 0 && buyQueue.length > 0) {
            const lot = buyQueue[0]
            if (lot.shares <= remainingSell) {
              remainingSell -= lot.shares
              buyQueue.shift()
            } else {
              lot.shares -= remainingSell
              remainingSell = 0
            }
          }
        }
      }

      const costBasis = buyQueue.reduce((sum, lot) => sum + lot.shares * lot.price, 0)
      const avgCostPerShare = costBasis / netShares

      // Fetch company details
      const company = await payload.findByID({
        collection: 'company',
        id: companyId,
      })

      // Fetch latest recommendation
      const recommendations = await payload.find({
        collection: 'investmentRecommendation',
        where: {
          company: { equals: companyId },
          investor: { equals: investorId },
        },
        sort: '-recommendationDate',
        limit: 1,
        depth: 0,
      })

      const latestRec = recommendations.docs[0]
      const currentPrice = company.currentPrice || null
      const currentValue = currentPrice ? netShares * currentPrice : null
      const unrealizedGainLoss = currentValue !== null ? currentValue - costBasis : null
      const unrealizedGainLossPct =
        unrealizedGainLoss !== null ? (unrealizedGainLoss / costBasis) * 100 : null

      return {
        companyId: company.id,
        companyName: company.name,
        ticker: company.ticker,
        accountType,
        shares: netShares,
        costBasis,
        avgCostPerShare,
        currentPrice,
        currentValue,
        unrealizedGainLoss,
        unrealizedGainLossPct,
        recommendation: latestRec
          ? {
              type: latestRec.buySellHoldRecommendation,
              reasoning: latestRec.recommendationReasoning,
              date: latestRec.recommendationDate,
            }
          : null,
      }
    }),
  )

  // Calculate totals
  const totalCostBasis = positions.reduce((sum, p) => sum + p.costBasis, 0)
  const totalCurrentValue = positions.reduce((sum, p) => sum + (p.currentValue || 0), 0)
  const totalUnrealizedGainLoss = totalCurrentValue - totalCostBasis

  return {
    positions,
    totals: {
      overall: {
        costBasis: totalCostBasis,
        currentValue: totalCurrentValue,
        unrealizedGainLoss: totalUnrealizedGainLoss,
      },
    },
  }
}
