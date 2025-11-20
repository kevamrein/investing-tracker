'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'

export async function getCompanies({
  page = 1,
  limit = 20,
  query = '',
}: {
  page?: number
  limit?: number
  query?: string
}) {
  const payload = await getPayload({ config })

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

  const result = await payload.find({
    collection: 'company',
    sort: 'name',
    page,
    limit,
    where,
  })

  return {
    docs: result.docs,
    hasNextPage: result.hasNextPage,
    nextPage: result.nextPage,
    totalPages: result.totalPages,
  }
}
