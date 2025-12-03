export const reasoningModel = 'grok-4-fast-reasoning'
export const nonReasoningModel = 'grok-4-fast'
export const defaultModel = process.env.CHEAP_MODE === 'true' ? nonReasoningModel : reasoningModel

export const searchParameters = {
  mode: 'auto',
  sources: ['web', 'x', 'news'],
}

const getCurrentStockPriceTool = {
  type: 'function',
  name: 'get_current_stock_price',
  description: 'Get the current price of a stock given its ticker symbol.',
  parameters: {
    type: 'object',
    properties: {
      ticker: {
        type: 'string',
        description: 'The stock ticker symbol, e.g., AAPL for Apple Inc.',
      },
    },
    required: ['ticker'],
  },
}

export const tools =
  process.env.CHEAP_MODE === 'true'
    ? []
    : [
        {
          type: 'web_search',
        },
        {
          type: 'x_search',
        },
        getCurrentStockPriceTool,
      ]

export async function getCurrentStockPrice(ticker: string) {
  console.log('Fetching current stock price for ticker:', ticker)
  const apiKey = process.env.FINNHUB_API_KEY
  if (!apiKey) throw new Error('Finnhub API key not set')
  const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}`, {
    headers: {
      'X-Finnhub-Token': apiKey,
    },
  })
  if (!response.ok) {
    if (response.status === 429) {
      console.error('Finnhub API rate limit exceeded for ticker:', ticker)
    }
    throw new Error('Failed to fetch stock price')
  }
  const data = await response.json()
  return {
    ticker,
    currentPrice: data.c,
    high: data.h,
    low: data.l,
    open: data.o,
    previousClose: data.pc,
    timestamp: data.t,
  }
}

export function extractAnswerFromResponse(output: any): string {
  if (Array.isArray(output)) {
    // Look for text content in the output array
    for (const item of output) {
      if (item.content && Array.isArray(item.content)) {
        for (const contentItem of item.content) {
          if (contentItem.type === 'output_text' && contentItem.text) {
            return contentItem.text
          }
        }
      }
    }
    // Fallback for other text types
    const textItem = output.find((item: any) => item.type === 'text')
    return textItem?.content || output[0]?.content || ''
  }
  return output
}

export async function handleResponsesWithTools(
  inputMessages: any[],
  previousResponseId?: string,
): Promise<{ answer: string; responseId: string }> {
  let currentPreviousResponseId = previousResponseId

  while (true) {
    const body = JSON.stringify({
      model: defaultModel,
      input: inputMessages,
      tools: tools,
      previous_response_id: currentPreviousResponseId,
    })

    const response = await xAIResponsesRequest(body)

    // Check if there are function calls in the output
    const functionCalls = response.output.filter((item: any) => item.type === 'function_call')

    if (functionCalls.length > 0) {
      // Execute the function calls and append results
      for (const call of functionCalls) {
        if (call.name === 'get_current_stock_price') {
          const args = JSON.parse(call.arguments)
          const result = await getCurrentStockPrice(args.ticker)
          inputMessages.push({
            role: 'tool',
            content: JSON.stringify(result),
            tool_call_id: call.id,
          } as any)
        }
      }
      // Set previous_response_id for the next request
      currentPreviousResponseId = response.id
    } else {
      // No more function calls, return the final answer
      const answer = extractAnswerFromResponse(response.output)
      return { answer, responseId: response.id }
    }
  }
}

export interface ResponsesAPIResponse {
  output: any[]
  id: string
}

export async function xAIChatRequest(body: string): Promise<any> {
  return await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.X_AI_API_KEY}`,
    },
    body: body,
  })
}

export async function xAIResponsesRequest(body: string): Promise<ResponsesAPIResponse> {
  const response = await fetch('https://api.x.ai/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.X_AI_API_KEY}`,
    },
    body: body,
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
  return { output: data.output, id: data.id }
}
