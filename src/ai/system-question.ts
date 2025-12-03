import config from '@payload-config'
import { getPayload } from 'payload'
import { handleResponsesWithTools } from './ai-service'

export interface AskSystemQuestionRequest {
  question: string
  investorId: string
  responseId?: string
}

export interface AskSystemQuestionResponse {
  answer: string
  responseId?: string
}

export async function askSystemQuestion(
  request: AskSystemQuestionRequest,
): Promise<AskSystemQuestionResponse> {
  const { question, investorId, responseId } = request

  let context = null
  if (responseId) {
    context = question
  } else {
    const fullContext = await buildFullContext(investorId)
    context = `System context: ${fullContext} User's question: ${question}`
  }

  try {
    let inputMessages = [
      {
        role: 'system',
        content:
          "You are an expert financial analyst providing insights about an investor tracking system. You have access to all companies in the system and the user's complete transaction history. Provide helpful answers about the system, companies, and user's investment patterns. Calculate the exact cost basis for each holding using the provided transaction data (FIFO method). Determine the remaining investable assets by subtracting the total cost basis from the total investable assets. Use live search for current market data when needed. Keep responses under 300 words but do not return the word count.",
      },
      {
        role: 'user',
        content: context,
      },
    ]

    return await handleResponsesWithTools(inputMessages, responseId)
  } catch (error) {
    console.error('Error in askSystemQuestion:', error)
    throw error
  }
}

async function buildFullContext(investorId: string) {
  const payload = await getPayload({ config })

  // Get all companies with their tickers
  const companies = await payload.find({
    collection: 'company',
    sort: 'name',
  })

  // Get all user's transactions
  const transactions = await payload.find({
    collection: 'investment',
    where: {
      investorMapping: {
        equals: investorId,
      },
    },
    sort: '-investmentDate',
    depth: 1, // Include company relationship data
  })

  // Get investor for investable assets
  const investor = await payload.findByID({
    collection: 'investors',
    id: investorId,
  })

  const totalInvestableAssets =
    investor && typeof investor.investableAssets === 'number' ? investor.investableAssets : 0

  // Build context
  const companiesContext = companies.docs
    .map((company) => `${company.name} (${company.ticker})`)
    .join('; ')

  const transactionsContext = transactions.docs
    .map((txn) => {
      const company = txn.company as any
      return `${company?.name || 'Unknown'} (${company?.ticker || 'Unknown'}): ${txn.transactionType} ${txn.shares} shares at $${txn.pricePerShare} on ${txn.investmentDate} (${txn.accountType})`
    })
    .join('; ')

  return `All companies in system: ${companiesContext}; User's transaction history: ${transactionsContext}; Total investable assets: $${totalInvestableAssets.toFixed(2)}`
}
