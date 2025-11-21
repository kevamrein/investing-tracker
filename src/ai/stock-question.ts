import config from '@payload-config'
import { getPayload } from 'payload'
import { reasoningModel, tools, xAIResponsesRequest } from './ai-service'

export interface AskStockQuestionRequest {
  ticker: string
  question: string
  investorId: string
  previousResponseId?: string
}

export interface AskStockQuestionResponse {
  answer: string
  responseId?: string
}

export async function askStockQuestion(
  request: AskStockQuestionRequest,
): Promise<AskStockQuestionResponse> {
  const { ticker, question, investorId, previousResponseId } = request

  let context = null
  if (previousResponseId) {
    context = question
  } else {
    context = await buildFullPortfolioContext(investorId, ticker, question)
  }

  console.log(`Ask question context: ${previousResponseId}`)

  try {
    const body = JSON.stringify({
      model: reasoningModel,
      input: [
        {
          role: 'system',
          content:
            'You are an expert financial analyst providing personalized insights for a stock trading app. Provide a concise, helpful answer based on the given context and your financial expertise. Keep the response under 300 words but do not return the word count.',
        },
        {
          role: 'user',
          content: context,
        },
      ],
      tools: tools,
      previous_response_id: previousResponseId,
    })

    const response = await xAIResponsesRequest(body)

    return { answer: response.output!, responseId: response.responseId }
  } catch (error) {
    console.error('Error in askStockQuestion:', error)
    throw error
  }
}

async function buildFullPortfolioContext(
  investorId: string,
  ticker: string,
  question: string,
): Promise<string> {
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

  return `Context:
- User's transaction history for ${ticker}: ${JSON.stringify(transactionContext)}
- Most recent market mover: ${moverContext ? JSON.stringify(moverContext) : 'None available'}

User's question: ${question}`
}
