import { getPayload } from 'payload'
import config from '@payload-config'
import { sql } from '@payloadcms/db-postgres/drizzle'

export async function calculateRemainingInvestableAssets(investorId: string): Promise<number> {
  const payload = await getPayload({ config })

  const investor = await payload.findByID({
    collection: 'investors',
    id: investorId,
  })

  // Get net shares per company and account type using SQL
  const netSharesResult = await payload.db.drizzle.execute(sql`
    SELECT company_id as company, account_type, SUM(CASE WHEN transaction_type = 'buy' THEN shares ELSE -shares END) as net_shares
    FROM investment
    WHERE investor_mapping_id = ${investorId}
    GROUP BY company_id, account_type
    HAVING SUM(CASE WHEN transaction_type = 'buy' THEN shares ELSE -shares END) > 0
  `)

  let totalInvested = 0

  for (const row of netSharesResult.rows as any[]) {
    const companyId = row.company as string
    const accountType = row.account_type as string
    const netShares = row.net_shares as number

    // Fetch investments for this company and account type, sorted by date
    const investments = await payload.find({
      collection: 'investment',
      where: {
        company: {
          equals: companyId,
        },
        investorMapping: {
          equals: investorId,
        },
        accountType: {
          equals: accountType,
        },
      },
      sort: 'investmentDate',
    })

    // FIFO calculation for cost basis
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

    // Cost basis from remaining lots
    const costBasis = buyQueue.reduce((sum, lot) => sum + lot.shares * lot.price, 0)
    totalInvested += costBasis
  }

  if (!investor || typeof investor.investableAssets !== 'number') {
    return totalInvested
  }

  const investableAssets = investor.investableAssets

  return investableAssets - totalInvested
}
