import config from '@payload-config'
import { sql } from '@payloadcms/db-postgres/drizzle'
import { getPayload } from 'payload'
import { handleResponsesWithTools } from './ai-service'

export interface AskPortfolioQuestionRequest {
  question: string
  investorId: string
  previousResponseId?: string
}

export interface AskPortfolioQuestionResponse {
  answer: string
  responseId?: string
}

export async function askPortfolioQuestion(
  request: AskPortfolioQuestionRequest,
): Promise<AskPortfolioQuestionResponse> {
  const { question, investorId, previousResponseId } = request

  let userContent = null
  if (previousResponseId) {
    userContent = question
  } else {
    const fullContext = await buildFullPortfiolioContext(investorId)
    userContent = `Portfolio holdings: ${fullContext} User's question: ${question}`
  }

  try {
    let inputMessages = [
      {
        role: 'system',
        content:
          'You are an expert financial analyst providing personalized insights for a stock trading app. Provide a concise, helpful answer based on the given portfolio context and your financial expertise. Use live search to get current stock prices and any other market data you need. Calculate the exact cost basis for each holding using the provided transaction data (FIFO method). Determine the remaining investable assets by subtracting the total cost basis from the total investable assets. When considering investment opportunities, remember that the investor can sell existing shares to raise additional cash beyond their current investable assets, and factor in tax implications of selling based on cost basis and holding periods. Keep the response under 300 words but do not return the word count.',
      },
      {
        role: 'user',
        content: userContent,
      },
    ]

    return await handleResponsesWithTools(inputMessages, previousResponseId)
  } catch (error) {
    console.error('Error in askPortfolioQuestion:', error)
    throw error
  }
}

async function buildFullPortfiolioContext(investorId: string): Promise<string> {
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

  // Build holdings context
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

    // Get transactions for cost basis calculation
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

    const transactionSummary = transactions.docs.map((txn) => ({
      type: txn.transactionType,
      shares: txn.shares,
      price: txn.pricePerShare,
      date: txn.investmentDate,
    }))

    if (company) {
      holdings.push({
        companyName: company.name,
        ticker: company.ticker,
        accountType: accountType,
        shares: netShares,
        transactions: transactionSummary,
      })
    }
  }

  // Calculate total investable assets (AI will calculate remaining after determining cost basis)
  const totalInvestableAssets =
    investor && typeof investor.investableAssets === 'number' ? investor.investableAssets : 0

  // Build context
  const portfolioContext = holdings
    .map(
      (h) =>
        `${h.companyName} (${h.ticker}): ${h.shares} shares in ${h.accountType} account. Transactions: ${JSON.stringify(h.transactions)}`,
    )
    .join('; ')

  return `${portfolioContext}; Total investable assets: $${totalInvestableAssets.toFixed(2)}`
}
