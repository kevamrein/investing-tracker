import z from 'zod'
import { defaultModel, reasoningModel, searchParameters, xAIChatRequest } from './ai-service'

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

export async function generateInvestmentRecommendationWithLiveSearch(
  stockData: InvestmentRecommendationRequest,
): Promise<InvestmentRecommendationResponse> {
  try {
    const body = JSON.stringify({
      model: defaultModel,
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
      searchParameters: searchParameters,
      response_format: {
        type: 'json_object',
        json_schema: {
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

    const response = await xAIChatRequest(body)

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
