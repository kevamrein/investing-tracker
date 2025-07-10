import { createXai } from '@ai-sdk/xai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { getPayload } from 'payload'
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
}

export interface StockInformationResponse {
  bullCase: string
  bearCase: string
}

export interface InvestmentRecommendationResponse {
  buySellHoldRecommendation: 'buy' | 'sell' | 'hold'
  recommendationReasoning: string
}

const modelName = 'grok-4-latest'

export async function generateStockInformation(
  stockData: StockInformationRequest,
): Promise<StockInformationResponse> {
  const xAi = createXai({
    apiKey: process.env.X_AI_API_KEY,
  })
  const model = xAi(modelName)
  const { object } = await generateObject({
    model: model,
    schema: z.object({
      bullCase: z.string(),
      bearCase: z.string(),
    }),
    prompt: `You are an expert financial analyst providing accurate, up-to-date insights for a personal stock trading app. For the company with the ticker symbol ${stockData.ticker}, provide a concise bull case (3 sentences max) and bear case (3 sentences max) based on unique, recent information that offers a potential investing edge. Ensure all information is verifiable and prioritize precision.`,
  })

  return object as StockInformationResponse
}

export async function generateInvestmentRecommendation(
  stockData: InvestmentRecommendationRequest,
): Promise<InvestmentRecommendationResponse> {
  const xAi = createXai({
    apiKey: process.env.X_AI_API_KEY,
  })
  const model = xAi(modelName)
  const { object } = await generateObject({
    model: model,
    schema: z.object({
      buySellHoldRecommendation: z.enum(['buy', 'sell', 'hold']),
      recommendationReasoning: z.string(),
    }),
    prompt: `You are an expert financial analyst providing accurate, up-to-date insights for a personal stock trading app. For the ticker symbol ${stockData.ticker}, if the JSON list of investments provided below is not empty, calculate the current position's total shares, average cost basis (for buy transactions only), and total current value based on the latest market price; if the list is empty, base the recommendation on current market conditions and recent stock performance. Recommend a buy, sell, or hold action tailored for a slightly risk-tolerant investor using extra funds to beat the market, justifying the recommendation in 2 sentences max, ensuring the recommendation is actionable and aligns with the goal of outperforming the market. Ensure all information is verifiable and prioritize precision. Investments: ${JSON.stringify(stockData.investments)}`,
  })

  return object as InvestmentRecommendationResponse
}

export async function generateStockInformationWithLiveSearch(
  stockData: StockInformationRequest,
): Promise<StockInformationResponse> {
  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.X_AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: modelName,
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
      }),
    })

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
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.X_AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert financial analyst providing accurate, up-to-date insights for a personal stock trading app. You must respond with a JSON object containing buySellHoldRecommendation (one of: "buy", "sell", "hold") and recommendationReasoning (a string with 2 sentences max).',
          },
          {
            role: 'user',
            content: `For the ticker symbol ${stockData.ticker}, if the JSON list of investments below is not empty, calculate the current position's total shares, average cost basis (for buy transactions only), total current value using the latest market price, and estimate capital gains tax implications (short-term vs. long-term, assuming U.S. tax rates). Provide a buy, sell, or hold recommendation tailored for a slightly risk-tolerant investor aiming to beat the market with extra funds, prioritizing non-consensus insights, emerging trends, or underappreciated risks, and factoring in tax implications to maximize after-tax returns; justify it in 4 sentences max with verifiable, data-driven reasoning. If the investment list is empty, base the recommendation on current market conditions and recent stock performance, assuming a new position with no tax history. Investments: ${JSON.stringify(stockData.investments)}`,
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
      }),
    })

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
