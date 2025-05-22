'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

export async function searchCompanies(query: string) {
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
    recommendationDate: new Date(doc.recommendationDate),
    priceTarget: doc.priceTarget,
    timeframe: doc.timeframe,
    currentPrice: doc.currentPrice,
    bullCase:
      doc.bullCase?.map((point) => ({
        date: point.opinionDate,
        point: point.opinionText,
      })) ?? [],
    bearCase:
      doc.bearCase?.map((point) => ({
        date: point.opinionDate,
        point: point.opinionText,
      })) ?? [],
    performance: {
      pastYear: doc.oneYearReturn,
      pastWeek: doc.weekToDateReturn,
      yearToDate: doc.ytdReturn,
    },
  }))
}
