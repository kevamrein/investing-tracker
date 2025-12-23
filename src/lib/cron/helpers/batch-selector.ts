import type { Payload } from 'payload'
import type { Company } from '@/payload-types'
import { getTodayStartUTC } from './date-utils'

/**
 * Select companies for batch processing based on update status
 * Returns companies that need either stock data updates OR investment recommendations
 *
 * @param payload - Payload CMS instance
 * @param batchSize - Maximum number of companies to return (default: 10)
 * @returns Array of companies that need processing
 */
export async function selectCompaniesForBatch(
  payload: Payload,
  batchSize: number = 10,
): Promise<Company[]> {
  const todayStart = getTodayStartUTC()
  const todayStartISO = todayStart.toISOString()

  console.log(`[BATCH_SELECTOR] Selecting up to ${batchSize} companies for processing`)
  console.log(`[BATCH_SELECTOR] Today start: ${todayStartISO}`)

  try {
    // Step 1: Find companies with stale stock data (updatedAt < today)
    const staleStockDataQuery = await payload.find({
      collection: 'company',
      where: {
        updatedAt: {
          less_than: todayStartISO,
        },
      },
      limit: batchSize * 2, // Get more than needed to ensure we have enough
      pagination: false,
    })

    console.log(
      `[BATCH_SELECTOR] Found ${staleStockDataQuery.docs.length} companies with stale stock data`,
    )

    // Step 2: Find all recommendations created today
    const todayRecommendations = await payload.find({
      collection: 'investmentRecommendation',
      where: {
        createdAt: {
          greater_than_equal: todayStartISO,
        },
      },
      pagination: false,
    })

    console.log(
      `[BATCH_SELECTOR] Found ${todayRecommendations.docs.length} recommendations created today`,
    )

    // Step 3: Extract company IDs that already have recommendations today
    const processedCompanyIds = new Set<number>()
    todayRecommendations.docs.forEach((rec) => {
      if (typeof rec.company === 'number') {
        processedCompanyIds.add(rec.company)
      }
    })

    console.log(
      `[BATCH_SELECTOR] ${processedCompanyIds.size} unique companies have recommendations today`,
    )

    // Step 4: Find companies without recommendations today
    let companiesMissingRecommendations: Company[] = []
    if (processedCompanyIds.size > 0) {
      const missingRecsQuery = await payload.find({
        collection: 'company',
        where: {
          id: {
            not_in: Array.from(processedCompanyIds),
          },
        },
        limit: batchSize * 2,
        pagination: false,
      })
      companiesMissingRecommendations = missingRecsQuery.docs
    } else {
      // If no recommendations today, all companies need them
      const allCompanies = await payload.find({
        collection: 'company',
        limit: batchSize * 2,
        pagination: false,
      })
      companiesMissingRecommendations = allCompanies.docs
    }

    console.log(
      `[BATCH_SELECTOR] Found ${companiesMissingRecommendations.length} companies missing recommendations`,
    )

    // Step 5: Merge and deduplicate company lists
    const companyMap = new Map<number, Company>()

    // Add companies with stale stock data
    staleStockDataQuery.docs.forEach((company) => {
      companyMap.set(company.id, company)
    })

    // Add companies missing recommendations
    companiesMissingRecommendations.forEach((company) => {
      if (!companyMap.has(company.id)) {
        companyMap.set(company.id, company)
      }
    })

    // Step 6: Convert to array and limit to batch size
    const selectedCompanies = Array.from(companyMap.values()).slice(0, batchSize)

    console.log(
      `[BATCH_SELECTOR] Selected ${selectedCompanies.length} companies for processing:`,
      selectedCompanies.map((c) => `${c.ticker} (ID: ${c.id})`).join(', '),
    )

    return selectedCompanies
  } catch (error: any) {
    console.error('[BATCH_SELECTOR] Error selecting companies for batch:', error)
    throw new Error(`Failed to select companies for batch processing: ${error.message}`)
  }
}
