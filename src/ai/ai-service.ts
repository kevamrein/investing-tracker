export const reasoningModel = 'grok-4-fast-reasoning'
export const nonReasoningModel = 'grok-4-fast'
export const defaultModel = process.env.CHEAP_MODE === 'true' ? nonReasoningModel : reasoningModel

export const searchParameters = {
  mode: 'auto',
  sources: ['web', 'x', 'news'],
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
      ]

export interface ResponsesAPIResponse {
  output?: string
  responseId?: string
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
  console.log(JSON.stringify({ body: JSON.parse(body), response: data }))
  let output = null
  for (const item of data.output) {
    if (item.content) {
      output = item.content[0]?.text
      break
    }
  }

  if (!output) {
    throw new Error('Invalid response format from XAI API')
  }

  return { output, responseId: data.id }
}
