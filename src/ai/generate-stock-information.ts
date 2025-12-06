import config from '@payload-config'
import { getPayload } from 'payload'
import z from 'zod'
import { handleResponsesWithTools } from './ai-service'

export interface StockInformationResponse {
  bullCase: string
  bearCase: string
}

export interface StockInformationRequest {
  ticker: string
}

function buildSystemPrompt(): string {
  const isCheapMode = process.env.CHEAP_MODE === 'true'

  return `You are an expert financial analyst providing accurate, up-to-date insights for a personal stock trading app.

${
  isCheapMode
    ? 'NOTE: Real-time data access is limited. Use your training data knowledge for analysis.'
    : 'IMPORTANT: You have access to web search and stock price tools. Use them to gather recent, verifiable information.'
}

You must respond with a JSON object containing:
- bullCase: A concise bull case for the stock (3 sentences max)
- bearCase: A concise bear case for the stock (3 sentences max)`
}

function buildUserPrompt(ticker: string): string {
  const isCheapMode = process.env.CHEAP_MODE === 'true'

  return `Ticker: ${ticker}

${isCheapMode ? 'Based on your training data' : 'Research and analyze current information'}, provide:

1. Bull Case (3 sentences max):
   - Focus on unique, non-consensus opportunities
   - Highlight emerging trends or underreported metrics
   - Identify early signals that could lead to outsized returns
   - Base analysis on precise, data-driven insights

2. Bear Case (3 sentences max):
   - Focus on underappreciated risks or vulnerabilities
   - Highlight shifts in competitive dynamics or market headwinds
   - Identify early warning signals that could lead to significant losses
   - Base analysis on precise, data-driven insights

Avoid mainstream narratives. Prioritize verifiable information from reliable sources.

Respond with a JSON object containing bullCase and bearCase fields.`
}

export async function generateStockInformation(
  stockData: StockInformationRequest,
): Promise<StockInformationResponse> {
  try {
    const systemPrompt = buildSystemPrompt()
    const userPrompt = buildUserPrompt(stockData.ticker)

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
      bullCase: z.string(),
      bearCase: z.string(),
    })

    try {
      const parsedContent = JSON.parse(answer)
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
      console.error('Raw response:', answer)
      throw new Error(
        `Failed to parse API response: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
      )
    }
  } catch (error) {
    console.error('Error in generateStockInformation:', error)
    throw error
  }
}
