import { createXai } from '@ai-sdk/xai'
import { generateObject } from 'ai'
import { z } from 'zod'

export interface StockInformationRequest {
  ticker: string
}

export interface StockInformationResponse {
  bullCase: string
  bearCase: string
}

export async function generateStockInformation(
  stockData: StockInformationRequest,
): Promise<StockInformationResponse> {
  const xAi = createXai({
    apiKey: process.env.X_AI_API_KEY,
  })
  const model = xAi('grok-beta')
  const { object } = await generateObject({
    model: model,
    schema: z.object({
      bullCase: z.string(),
      bearCase: z.string(),
    }),
    prompt: `You are providing up-to-date information for a personal stock trading app. Accuracy is key. Provide the bull case and bear case for the company with the ticker symbol ${stockData.ticker}. Please be concise and only provide at most 3 sentences. Focus on up to date new information that is unique and could give a unique investing advantage.`,
  })

  return object as StockInformationResponse
}
