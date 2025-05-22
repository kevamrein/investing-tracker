import { getPayload } from 'payload'
import config from '@payload-config'
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/solid'

interface RecommendationChange {
  company: string
  ticker: string
  currentRec: 'buy' | 'sell' | 'hold'
  reasoning: string
  date: Date
}

function getStatusColor(rec: string) {
  switch (rec.toLowerCase()) {
    case 'buy':
      return 'text-green-600'
    case 'sell':
      return 'text-red-600'
    default:
      return 'text-yellow-600'
  }
}

function getChangeIcon(previous: string, current: string) {
  if (previous === current) {
    return <MinusIcon className="h-5 w-5 text-gray-400" />
  }
  return current === 'buy' ? (
    <ArrowUpIcon className="h-5 w-5 text-green-600" />
  ) : (
    <ArrowDownIcon className="h-5 w-5 text-red-600" />
  )
}

export async function RecentMovers() {
  const payload = await getPayload({ config })

  // Get the latest recommendations
  const recommendations = await payload.find({
    collection: 'investmentRecommendation',
    sort: '-recommendationDate',
    limit: 5,
    depth: 1, // This will populate the company relationship
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

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Recommendations</h3>
      </div>
      <div className="border-t border-gray-200">
        <ul role="list" className="divide-y divide-gray-200">
          {changes.map((change, index) => (
            <li key={index} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{change.company}</p>
                    <p className="text-sm text-gray-500">{change.ticker}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`text-sm ${getStatusColor(change.currentRec)}`}>
                    {change.currentRec.toUpperCase()}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">{change.reasoning}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
