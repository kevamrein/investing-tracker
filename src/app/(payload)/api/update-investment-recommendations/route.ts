import { getPayload } from 'payload'
import config from '@payload-config'
import { generateInvestmentRecommendation, PreviousInvestment } from '@/ai/ai-service'
import { Company } from '@/payload-types'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    })
  }

  if (!process.env.PROCESSING_USER_ID) {
    return new Response('Processing user ID not set', {
      status: 500,
    })
  }

  const payload = await getPayload({ config })

  const processingUser = await payload.findByID({
    collection: 'users',
    id: process.env.PROCESSING_USER_ID as string,
  })

  const users = await payload.find({
    collection: 'users',
    where: {
      isInvestor: {
        equals: true,
      },
    },
    pagination: false,
  })

  if (!users) {
    return new Response('No users found', {
      status: 200,
    })
  }

  const companies = await payload.find({
    collection: 'company',
    pagination: false,
  })

  if (!companies) {
    return new Response('No companies found', {
      status: 200,
    })
  }

  const companyMap = companies.docs.reduce(
    (map, company) => {
      map[company.id] = company
      return map
    },
    {} as Record<number, Company>,
  )

  for (const user of users.docs) {
    const investments = await payload.find({
      collection: 'investment',
      where: {
        investor: {
          equals: user.id,
        },
      },
      pagination: false,
      depth: 2,
    })

    Object.keys(companyMap).forEach(async (key) => {
      const companyId = Number(key)
      const company = companyMap[companyId]
      const investmentsInCompany: PreviousInvestment[] = investments.docs
        .filter((investment) => {
          return (
            investment.company &&
            typeof investment.company === 'number' &&
            investment.company === companyId
          )
        })
        .map((investment) => {
          return {
            transactionType: investment.transactionType,
            shares: investment.shares,
            pricePerShare: investment.pricePerShare,
            date: new Date(investment.investmentDate),
          }
        })

      const investmentRecommendationResponse = await generateInvestmentRecommendation({
        ticker: company.ticker,
        investments: investmentsInCompany,
      })

      payload.create({
        collection: 'investmentRecommendation',
        data: {
          investor: user.id,
          company: companyId,
          recommendationDate: new Date().toISOString(),
          buySellHoldRecommendation: investmentRecommendationResponse.buySellHoldRecommendation as
            | 'buy'
            | 'sell'
            | 'hold',
          recommendationReasoning: investmentRecommendationResponse.recommendationReasoning,
        },
        user: processingUser,
        overrideAccess: true,
      })
    })
  }

  return new Response('Recommendations updated', {
    status: 200,
  })
}
