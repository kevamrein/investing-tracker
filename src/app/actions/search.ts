'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

export async function searchCompanies(query: string) {
  if (!query.trim()) return []

  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'company',
    where: {
      or: [
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
      ],
    },
  })

  return result.docs.map((doc) => ({
    name: doc.name,
    ticker: doc.ticker,
  }))
}
