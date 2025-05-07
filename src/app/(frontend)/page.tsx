import { CompanyInfoBox } from './company-info-box'
import { getPayload } from 'payload'
import config from '@payload-config'

export default async function HomePage() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'company',
  })

  const companies = result.docs.map((doc) => {
    return {
      name: doc.name,
      ticker: doc.ticker,
      recommendationDate: doc.recommendationDate,
      priceTarget: doc.priceTarget,
      timeframe: doc.timeframe,
      currentPrice: doc.currentPrice,
      bullCase: doc.bullCase.map((point) => ({
        date: point.opinionDate,
        point: point.opinionText,
      })),
      bearCase: doc.bearCase.map((point) => ({
        date: point.opinionDate,
        point: point.opinionText,
      })),
      performance: {
        pastYear: doc.oneYearReturn,
        pastWeek: doc.weekToDateReturn,
        yearToDate: doc.ytdReturn,
      },
    }
  })

  return (
    <div>
      {companies.map((company, index) => (
        <CompanyInfoBox key={index} {...company} />
      ))}
    </div>
  )
}
