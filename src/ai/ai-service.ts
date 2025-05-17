import { createXai } from '@ai-sdk/xai'
import { generateObject } from 'ai'
import { z } from 'zod'

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

export async function generateStockInformation(
  stockData: StockInformationRequest,
): Promise<StockInformationResponse> {
  const xAi = createXai({
    apiKey: process.env.X_AI_API_KEY,
  })
  const model = xAi('grok-3-beta')
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
  const model = xAi('grok-3-beta')
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
