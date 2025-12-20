'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
import getSession from './auth-utils'

export async function getCompaniesWithRecommendations({
  page = 1,
  limit = 20,
  query = '',
}: {
  page?: number
  limit?: number
  query?: string
}) {
  const payload = await getPayload({ config })
  const session = await getSession()
  const investorId = session?.user?.id

  // 1. Get companies with same query logic as get-companies.ts
  const where: {
    or?: Array<{
      name?: { contains: string }
      ticker?: { contains: string }
    }>
  } = {}

  if (query) {
    where.or = [
      {
        name: {
          contains: query,
        },
      },
      {
        ticker: {
          contains: query.toUpperCase(),
        },
      },
    ]
  }

  const companies = await payload.find({
    collection: 'company',
    sort: 'name',
    page,
    limit,
    where,
  })

  // 2. For each company, fetch latest recommendation
  const companiesWithRecs = await Promise.all(
    companies.docs.map(async (company) => {
      if (!investorId) {
        return { ...company, latestRecommendation: null }
      }

      const recommendations = await payload.find({
        collection: 'investmentRecommendation',
        where: {
          company: { equals: company.id },
          investor: { equals: investorId },
        },
        sort: '-recommendationDate',
        limit: 1,
        depth: 0,
      })

      const latestRec = recommendations.docs[0]

      return {
        ...company,
        latestRecommendation: latestRec
          ? {
              type: latestRec.buySellHoldRecommendation,
              reasoning: latestRec.recommendationReasoning,
              date: latestRec.recommendationDate,
            }
          : null,
      }
    }),
  )

  return {
    docs: companiesWithRecs,
    hasNextPage: companies.hasNextPage,
    nextPage: companies.nextPage,
    totalPages: companies.totalPages,
  }
}
