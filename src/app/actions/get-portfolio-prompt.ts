'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import config from '@payload-config'
import { sql } from '@payloadcms/db-postgres/drizzle'
import { getPayload } from 'payload'

export async function getPortfolioPrompt(): Promise<string> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const investorId = session.user.id
  const payload = await getPayload({ config })

  // Get the investor's investable assets
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

  // Build holdings and transactions context
  const holdings = []

  for (const row of netSharesResult.rows as any[]) {
    const companyId = row.company as string
    const accountType = row.account_type as string
    const netShares = row.net_shares as number

    // Get company details
    const company = await payload.findByID({
      collection: 'company',
      id: companyId,
    })

    // Get all transactions for this holding
    const transactions = await payload.find({
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

    const transactionList = transactions.docs.map((txn) => ({
      type: txn.transactionType,
      shares: txn.shares,
      price: txn.pricePerShare,
      date: txn.investmentDate,
      total: txn.shares * txn.pricePerShare,
    }))

    if (company) {
      holdings.push({
        companyName: company.name,
        ticker: company.ticker,
        accountType: accountType,
        shares: netShares,
        transactions: transactionList,
      })
    }
  }

  // Calculate total investable assets
  const totalInvestableAssets =
    investor && typeof investor.investableAssets === 'number' ? investor.investableAssets : 0

  // Build the prompt
  let prompt = `I am an investor with the following portfolio holdings and transaction history. I want you to analyze my portfolio and provide personalized investment advice.

**Overall Goal:** You are an expert financial analyst providing personalized insights for a stock trading app. The primary goal is to achieve outsized returns through active stock picking and trading. Assume that basic ETFs and diversified index funds are owned in a separate fund/account and are not part of this portfolio. Provide a concise, helpful answer based on the given portfolio context and your financial expertise. Use live search to get current stock prices and any other market data you need. Calculate the exact cost basis for each holding using the provided transaction data (FIFO method). Determine the remaining investable assets by subtracting the total cost basis from the total investable assets. When considering investment opportunities, remember that the investor can sell existing shares to raise additional cash beyond their current investable assets, and factor in tax implications of selling based on cost basis and holding periods.

**Current Holdings:**
`

  holdings.forEach((holding) => {
    prompt += `\n- **${holding.companyName} (${holding.ticker})**: ${holding.shares} shares in ${holding.accountType} account`
  })

  prompt += `\n\n**Transaction History:**
`

  holdings.forEach((holding) => {
    prompt += `\n**${holding.companyName} (${holding.ticker}) - ${holding.accountType} Account:**
`
    holding.transactions.forEach((txn) => {
      prompt += `- ${txn.type.toUpperCase()}: ${txn.shares} shares at $${txn.price.toFixed(2)} each on ${new Date(txn.date).toLocaleDateString()} (Total: $${txn.total.toFixed(2)})
`
    })
  })

  prompt += `\n**Investable Assets:** $${totalInvestableAssets.toFixed(2)}

Please analyze my portfolio and provide insights on performance, diversification, risk, and potential improvements.`

  return prompt
}
