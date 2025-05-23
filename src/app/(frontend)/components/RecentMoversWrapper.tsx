import { getPayload } from 'payload'
import config from '@payload-config'
import { RecentMoversClient } from './RecentMoversClient'
import getSession from '@/app/actions/auth-utils'

export async function RecentMoversWrapper() {
  const payload = await getPayload({ config })

  const session = await getSession()
  const investorId = session?.user?.id
  // Get the latest recommendations
  const recommendations = await payload.find({
    collection: 'investmentRecommendation',
    sort: '-recommendationDate',
    limit: 5,
    depth: 1, // This will populate the company relationship
    where: {
      investor: {
        equals: investorId,
      },
    },
  })

  const changes = await Promise.all(
    recommendations.docs.map(async (doc) => {
      const company =
        typeof doc.company === 'object'
          ? doc.company
          : await payload.findByID({
              collection: 'company',
              id: doc.company,
            })

      return {
        company: company.name,
        ticker: company.ticker,
        currentRec: doc.buySellHoldRecommendation,
        reasoning: doc.recommendationReasoning,
        date: new Date(doc.recommendationDate),
      }
    }),
  )

  return <RecentMoversClient changes={changes} />
}
