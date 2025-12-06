import z from 'zod'
import { handleResponsesWithTools } from './ai-service'

export interface InvestmentRecommendationRequest {
  ticker: string
  investments?: PreviousInvestment[]
}

export interface InvestmentRecommendationResponse {
  buySellHoldRecommendation: 'buy' | 'sell' | 'hold'
  recommendationReasoning: string
}

export interface PreviousInvestment {
  transactionType: 'buy' | 'sell'
  shares: number
  pricePerShare: number
  date: Date
  accountType?: 'taxable' | 'ira' | string
}

function buildSystemPrompt(): string {
  const isCheapMode = process.env.CHEAP_MODE === 'true'

  return `You are an expert financial analyst providing accurate, up-to-date insights for a personal stock trading app.

${
  isCheapMode
    ? 'NOTE: Real-time data access is limited. Use your training data knowledge for analysis.'
    : 'IMPORTANT: You have access to web search and the get_current_stock_price tool. You MUST use these tools to fetch current stock prices and recent market data before making recommendations.'
}

For U.S. tax calculations, use these specific rates:
- Short-term capital gains (held < 1 year): Taxed as ordinary income. Use 24% as default assumption.
- Long-term capital gains (held ≥ 1 year): Use 15% as default assumption.
- IRA accounts: Tax-deferred, so ignore tax implications for IRA holdings.

You must respond with a JSON object containing:
- buySellHoldRecommendation: Must be exactly one of: "buy", "sell", or "hold"
- recommendationReasoning: A clear 3-4 sentence explanation with data-driven reasoning`
}

function buildUserPrompt(stockData: InvestmentRecommendationRequest): string {
  const hasInvestments = stockData.investments && stockData.investments.length > 0
  const isCheapMode = process.env.CHEAP_MODE === 'true'

  if (hasInvestments) {
    // Determine account types
    const accountTypes = new Set(stockData.investments!.map((inv) => inv.accountType || 'taxable'))
    const isSingleAccountType = accountTypes.size === 1
    const accountType = isSingleAccountType ? Array.from(accountTypes)[0] : 'mixed'

    return `Ticker: ${stockData.ticker}

Investment History:
${JSON.stringify(stockData.investments, null, 2)}

Tasks:
1. ${isCheapMode ? 'Estimate' : 'Get'} the current market price for ${stockData.ticker}${isCheapMode ? ' based on your training data' : ' using the get_current_stock_price tool'}
2. Calculate the total shares currently held (sum of buy transactions minus sell transactions)
3. Calculate the average cost basis (weighted average price of buy transactions only)
4. Calculate the current position value (total shares × current price)
5. Determine the holding period for tax purposes:
   - If most recent buy was < 1 year ago: short-term (24% tax rate)
   - If most recent buy was ≥ 1 year ago: long-term (15% tax rate)
6. Calculate unrealized gains/losses and estimate tax impact

Account Type Analysis:
${
  isSingleAccountType
    ? `All investments are in a ${accountType} account.
${
  accountType === 'ira'
    ? '- Focus on total returns (ignore tax implications)'
    : '- Prioritize tax-efficient strategies and maximize after-tax returns'
}`
    : `Investments span multiple account types (${Array.from(accountTypes).join(', ')}).
- Provide a holistic view considering both tax-advantaged and taxable accounts
- Note any strategic differences between account types`
}

Recommendation Criteria:
Provide a buy, sell, or hold recommendation for a slightly risk-tolerant investor aiming to beat the market with extra funds.
- Prioritize non-consensus insights and emerging trends
- Consider underappreciated risks or opportunities
- ${accountType === 'taxable' ? 'Factor in tax implications to maximize after-tax returns' : accountType === 'ira' ? 'Focus on maximizing total returns' : 'Balance tax efficiency with growth potential'}
- Base your reasoning on verifiable, data-driven analysis

Provide 3-4 sentences of clear reasoning supporting your recommendation.`
  } else {
    return `Ticker: ${stockData.ticker}

No existing position. This is a new potential investment.

Tasks:
1. ${isCheapMode ? 'Estimate' : 'Get'} the current market price for ${stockData.ticker}${isCheapMode ? ' based on your training data' : ' using the get_current_stock_price tool'}
2. ${isCheapMode ? 'Recall recent performance' : 'Search for recent performance and news'} for ${stockData.ticker}
3. Analyze current market conditions and sentiment

Recommendation Criteria:
Provide a buy, sell, or hold recommendation for a slightly risk-tolerant investor considering a new position.
- Focus on non-consensus insights and emerging trends
- Consider both upside potential and downside risks
- Evaluate if this is a good entry point at current valuations
- Base your reasoning on verifiable, data-driven analysis

Provide 3-4 sentences of clear reasoning supporting your recommendation.`
  }
}

export async function generateInvestmentRecommendationWithLiveSearch(
  stockData: InvestmentRecommendationRequest,
): Promise<InvestmentRecommendationResponse> {
  try {
    const systemPrompt = buildSystemPrompt()
    const userPrompt = buildUserPrompt(stockData)

    const inputMessages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ]

    // Use the Responses API which supports tools (web search, x search, get_current_stock_price)
    const { answer } = await handleResponsesWithTools(inputMessages)

    // Parse and validate the response using Zod
    const responseSchema = z.object({
      buySellHoldRecommendation: z.enum(['buy', 'sell', 'hold']),
      recommendationReasoning: z.string(),
    })

    try {
      const parsedContent = JSON.parse(answer)
      const validatedResponse = responseSchema.parse(parsedContent)
      return validatedResponse
    } catch (parseError: unknown) {
      console.error('Error parsing response:', parseError)
      console.error('Raw response:', answer)
      throw new Error(
        `Failed to parse API response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
      )
    }
  } catch (error) {
    console.error('Error in generateInvestmentRecommendationWithLiveSearch:', error)
    throw error
  }
}
