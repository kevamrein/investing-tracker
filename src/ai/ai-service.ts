import { z } from 'zod'
import { getPayload } from 'payload'
import { sql } from '@payloadcms/db-postgres/drizzle'
import config from '@payload-config'

export interface StockInformationRequest {
  ticker: string
}

export interface InvestmentRecommendationRequest {
  ticker: string
  investments?: PreviousInvestment[]
}

export interface PreviousInvestment {
  transactionType: 'buy' | 'sell'
  shares: number
  pricePerShare: number
  date: Date
  accountType?: 'taxable' | 'ira' | string
}

export interface StockInformationResponse {
  bullCase: string
  bearCase: string
}

export interface InvestmentRecommendationResponse {
  buySellHoldRecommendation: 'buy' | 'sell' | 'hold'
  recommendationReasoning: string
}

export interface AskStockQuestionRequest {
  ticker: string
  question: string
  investorId: string
}

export interface AskStockQuestionResponse {
  answer: string
}

export interface AskPortfolioQuestionRequest {
  question: string
  investorId: string
}

export interface AskPortfolioQuestionResponse {
  answer: string
}

const reasoningModel = 'grok-4-fast-reasoning'
const nonReasoningModel = 'grok-4-fast'

export async function generateStockInformationWithLiveSearch(
  stockData: StockInformationRequest,
): Promise<StockInformationResponse> {
  try {
    const body = JSON.stringify({
      model: reasoningModel,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert financial analyst providing accurate, up-to-date insights for a personal stock trading app. You must respond with a JSON object containing bullCase (a string with 3 sentences max) and bearCase (a string with 3 sentences max).',
        },
        {
          role: 'user',
          content: `For the company with ticker symbol ${stockData.ticker}, provide a concise bull case (3 sentences max) and bear case (3 sentences max) based on unique, recent, and verifiable information that highlights non-consensus opportunities or risks. Prioritize early signals, such as emerging trends, underreported metrics, or shifts in competitive dynamics, that could lead to outsized returns or significant losses. Avoid mainstream narratives and focus on precise, data-driven insights from reliable sources.`,
        },
      ],
      live_search: true,
      search_parameters: {
        mode: 'auto',
        sources: [{ type: 'web' }, { type: 'x' }, { type: 'news' }],
      },
      response_format: {
        type: 'json_object',
        schema: {
          type: 'object',
          properties: {
            bullCase: {
              type: 'string',
              description: 'A concise bull case for the stock (3 sentences max)',
            },
            bearCase: {
              type: 'string',
              description: 'A concise bear case for the stock (3 sentences max)',
            },
          },
          required: ['bullCase', 'bearCase'],
          additionalProperties: false,
        },
      },
    })

    const response = await xAIRequest(body)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('XAI API error details:', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText,
      })
      throw new Error(`XAI API error: ${response.statusText}. Details: ${errorText}`)
    }

    const data = await response.json()

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from XAI API')
    }

    const content = data.choices[0].message.content

    // Parse and validate the response using Zod
    const responseSchema = z.object({
      bullCase: z.string(),
      bearCase: z.string(),
    })

    try {
      const parsedContent = JSON.parse(content)
      const validatedResponse = responseSchema.parse(parsedContent)

      // Get the company record
      const payload = await getPayload({ config })
      const company = await payload.find({
        collection: 'company',
        where: {
          ticker: {
            equals: stockData.ticker,
          },
        },
      })

      if (!company.docs.length) {
        throw new Error(`Company with ticker ${stockData.ticker} not found`)
      }

      const companyDoc = company.docs[0]
      const date = new Date().toISOString()
      let bullCase = companyDoc.bullCase || []
      let bearCase = companyDoc.bearCase || []

      bullCase.push({
        opinionText: validatedResponse.bullCase,
        opinionDate: date,
      })
      bearCase.push({
        opinionText: validatedResponse.bearCase,
        opinionDate: date,
      })

      // Update the company record
      await payload.update({
        collection: 'company',
        id: companyDoc.id,
        data: {
          bullCase,
          bearCase,
        },
        user: process.env.PROCESSING_USER_ID,
        overrideAccess: true,
      })

      return validatedResponse
    } catch (parseError: unknown) {
      console.error('Error parsing response:', parseError)
      throw new Error(
        `Failed to parse XAI API response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
      )
    }
  } catch (error) {
    console.error('Error in generateStockInformationWithLiveSearch:', error)
    throw error
  }
}

export async function generateInvestmentRecommendationWithLiveSearch(
  stockData: InvestmentRecommendationRequest,
): Promise<InvestmentRecommendationResponse> {
  try {
    const body = JSON.stringify({
      model: reasoningModel,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert financial analyst providing accurate, up-to-date insights for a personal stock trading app. You must respond with a JSON object containing buySellHoldRecommendation (one of: "buy", "sell", "hold") and recommendationReasoning (a string with 2 sentences max).',
        },
        {
          role: 'user',
          content: `For the ticker symbol ${stockData.ticker}, if the JSON list of investments below is not empty, calculate the current position's total shares, average cost basis (for buy transactions only), total current value using the latest market price, and estimate capital gains tax implications (short-term vs. long-term, assuming U.S. tax rates). Each investment includes an accountType field (either 'taxable' or 'ira'). If all investments are in the same account type, tailor your recommendation and reasoning for that account type (e.g., consider tax implications for taxable, ignore for IRA). If there are investments in multiple account types, provide a holistic overview and call out any differences in strategy or implications. Provide a buy, sell, or hold recommendation tailored for a slightly risk-tolerant investor aiming to beat the market with extra funds, prioritizing non-consensus insights, emerging trends, or underappreciated risks, and factoring in tax implications to maximize after-tax returns; justify it in 4 sentences max with verifiable, data-driven reasoning. If the investment list is empty, base the recommendation on current market conditions and recent stock performance, assuming a new position with no tax history. Investments: ${JSON.stringify(stockData.investments)}`,
        },
      ],
      live_search: true,
      search_parameters: {
        mode: 'auto',
        sources: [{ type: 'web' }, { type: 'x' }, { type: 'news' }],
      },
      response_format: {
        type: 'json_object',
        schema: {
          type: 'object',
          properties: {
            buySellHoldRecommendation: {
              type: 'string',
              enum: ['buy', 'sell', 'hold'],
              description: 'The recommended action for the stock',
            },
            recommendationReasoning: {
              type: 'string',
              description: 'The reasoning behind the recommendation (2 sentences max)',
            },
          },
          required: ['buySellHoldRecommendation', 'recommendationReasoning'],
          additionalProperties: false,
        },
      },
    })

    const response = await xAIRequest(body)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('XAI API error details:', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText,
      })
      throw new Error(`XAI API error: ${response.statusText}. Details: ${errorText}`)
    }

    const data = await response.json()

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from XAI API')
    }

    const content = data.choices[0].message.content

    // Parse and validate the response using Zod
    const responseSchema = z.object({
      buySellHoldRecommendation: z.enum(['buy', 'sell', 'hold']),
      recommendationReasoning: z.string(),
    })

    try {
      const parsedContent = JSON.parse(content)
      const validatedResponse = responseSchema.parse(parsedContent)
      return validatedResponse
    } catch (parseError: unknown) {
      console.error('Error parsing response:', parseError)
      throw new Error(
        `Failed to parse XAI API response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
      )
    }
  } catch (error) {
    console.error('Error in generateInvestmentRecommendationWithLiveSearch:', error)
    throw error
  }
}

export async function askStockQuestion(
  request: AskStockQuestionRequest,
): Promise<AskStockQuestionResponse> {
  const { ticker, question, investorId } = request

  // Get user transaction history for this stock
  const payload = await getPayload({ config })
  const companyId = await payload
    .find({
      collection: 'company',
      where: { ticker: { equals: ticker.toUpperCase() } },
      limit: 1,
    })
    .then((res) => res.docs.map((doc) => doc.id))
  const transactions = await payload.find({
    collection: 'investment',
    where: {
      company: {
        in: companyId,
      },
      investorMapping: {
        equals: investorId,
      },
    },
    sort: '-investmentDate',
    limit: 10, // Last 10 transactions
  })

  // Get most recent mover (latest recommendation change)
  const recentRecommendations = await payload.find({
    collection: 'investmentRecommendation',
    sort: '-recommendationDate',
    where: {
      company: {
        in: companyId,
      },
      investor: {
        equals: investorId,
      },
    },
    limit: 1,
    depth: 1,
  })

  const recentMover = recentRecommendations.docs[0]

  // Build context
  const transactionContext = transactions.docs.map((txn) => ({
    type: txn.transactionType,
    shares: txn.shares,
    price: txn.pricePerShare,
    date: txn.investmentDate,
    accountType: txn.accountType,
  }))

  const moverContext = recentMover
    ? {
        company: (recentMover.company as any)?.name || 'Unknown',
        ticker: (recentMover.company as any)?.ticker || 'Unknown',
        recommendation: recentMover.buySellHoldRecommendation,
        reasoning: recentMover.recommendationReasoning,
        date: recentMover.recommendationDate,
      }
    : null

  try {
    const body = JSON.stringify({
      model: reasoningModel,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert financial analyst providing personalized insights for a stock trading app. Provide a concise, helpful answer based on the given context and your financial expertise. Keep the response under 300 words but do not return the word count.',
        },
        {
          role: 'user',
          content: `Context:
- User's transaction history for ${ticker}: ${JSON.stringify(transactionContext)}
- Most recent market mover: ${moverContext ? JSON.stringify(moverContext) : 'None available'}

User's question: ${question}`,
        },
      ],
      live_search: true,
      search_parameters: {
        mode: 'auto',
        sources: [{ type: 'web' }, { type: 'x' }, { type: 'news' }],
      },
    })

    const response = await xAIRequest(body)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('XAI API error details:', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText,
      })
      throw new Error(`XAI API error: ${response.statusText}. Details: ${errorText}`)
    }

    const data = await response.json()

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from XAI API')
    }

    const answer = data.choices[0].message.content

    return { answer }
  } catch (error) {
    console.error('Error in askStockQuestion:', error)
    throw error
  }
}

export async function askPortfolioQuestion(
  request: AskPortfolioQuestionRequest,
): Promise<AskPortfolioQuestionResponse> {
  const { question, investorId } = request

  const payload = await getPayload({ config })

  // Get net shares per company and account type using SQL
  const netSharesResult = await payload.db.drizzle.execute(sql`
    SELECT company_id as company, account_type, SUM(CASE WHEN transaction_type = 'buy' THEN shares ELSE -shares END) as net_shares
    FROM investment
    WHERE investor_mapping_id = ${investorId}
    GROUP BY company_id, account_type
    HAVING SUM(CASE WHEN transaction_type = 'buy' THEN shares ELSE -shares END) > 0
  `)

  // Calculate FIFO cost basis for each company and account type with holdings
  const activeHoldings = []

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

    // Get company details
    const company = await payload.findByID({
      collection: 'company',
      id: companyId,
    })

    if (company) {
      activeHoldings.push({
        companyName: company.name,
        ticker: company.ticker,
        accountType: accountType,
        shares: netShares,
        costBasis: costBasis,
      })
    }
  }

  // Build context
  const portfolioContext = activeHoldings
    .map(
      (h) =>
        `${h.companyName} (${h.ticker}): ${h.shares} shares in ${h.accountType} account, FIFO cost basis $${h.costBasis.toFixed(2)}`,
    )
    .join('; ')

  try {
    const body = JSON.stringify({
      model: reasoningModel,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert financial analyst providing personalized insights for a stock trading app. Provide a concise, helpful answer based on the given portfolio context and your financial expertise. Keep the response under 300 words but do not return the word count.',
        },
        {
          role: 'user',
          content: `Portfolio holdings: ${portfolioContext}

User's question: ${question}`,
        },
      ],
      live_search: true,
      search_parameters: {
        mode: 'auto',
        sources: [{ type: 'web' }, { type: 'x' }, { type: 'news' }],
      },
    })

    const response = await xAIRequest(body)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('XAI API error details:', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText,
      })
      throw new Error(`XAI API error: ${response.statusText}. Details: ${errorText}`)
    }

    const data = await response.json()

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from XAI API')
    }

    const answer = data.choices[0].message.content

    return { answer }
  } catch (error) {
    console.error('Error in askPortfolioQuestion:', error)
    throw error
  }
}

async function xAIRequest(body: string): Promise<any> {
  return await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.X_AI_API_KEY}`,
    },
    body: body,
  })
}
