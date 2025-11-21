import { getPayload } from 'payload'
import config from '@payload-config'
import z from 'zod'
import { reasoningModel, searchParameters, xAIChatRequest } from './ai-service'

export interface StockInformationResponse {
  bullCase: string
  bearCase: string
}

export interface StockInformationRequest {
  ticker: string
}

export async function generateStockInformation(
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
      searchParameters: searchParameters,
      response_format: {
        type: 'json_object',
        json_schema: {
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
