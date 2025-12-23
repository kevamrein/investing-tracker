import { Company } from '@/payload-types'
import {
  PreviousInvestment,
  generateInvestmentRecommendationWithLiveSearch,
} from '@/ai/generate-investment-recommendation'
import type { CronContext, CronJobResult } from '../types'

export async function updateInvestmentRecommendationsJob(
  context: CronContext,
  companyIds?: number[],
): Promise<CronJobResult> {
  const startTime = new Date()
  const jobName = 'update-investment-recommendations'
  let processedCount = 0
  let errorCount = 0
  const errors: Array<{ message: string; context?: any }> = []

  console.log(`[JOB:${jobName}] Starting...`, {
    timestamp: startTime.toISOString(),
    companyIds: companyIds || 'all',
  })

  try {
    const { payload, processingUser } = context

    // Fetch all investors
    const investors = await payload.find({
      collection: 'investors',
      pagination: false,
    })

    if (investors.docs.length === 0) {
      const endTime = new Date()
      console.log(`[JOB:${jobName}] No investors found`)
      return {
        success: true,
        jobName,
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
        processedCount: 0,
        errorCount: 0,
        message: 'No investors found',
      }
    }

    // Fetch companies (filtered by IDs if provided)
    const queryOptions: any = {
      collection: 'company',
      pagination: false,
    }

    if (companyIds && companyIds.length > 0) {
      queryOptions.where = {
        id: {
          in: companyIds,
        },
      }
    }

    const companies = await payload.find(queryOptions)
    const companyDocs = companies.docs as Company[]

    if (!companyDocs || companyDocs.length === 0) {
      const endTime = new Date()
      console.log(`[JOB:${jobName}] No companies found`)
      return {
        success: true,
        jobName,
        startTime,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
        processedCount: 0,
        errorCount: 0,
        message: 'No companies found',
      }
    }

    // Create company map
    const companyMap = companyDocs.reduce(
      (map, company) => {
        map[company.id] = company
        return map
      },
      {} as Record<number, Company>,
    )

    const totalInvestors = investors.docs.length
    const totalCompanies = companyDocs.length
    const totalCombinations = totalInvestors * totalCompanies

    console.log(
      `[JOB:${jobName}] Processing ${totalInvestors} investors × ${totalCompanies} companies = ${totalCombinations} combinations`,
    )

    // Process each investor
    for (const investor of investors.docs) {
      try {
        console.log(`[JOB:${jobName}] Processing investor ${investor.id}`)

        // Fetch investments for this investor
        const investments = await payload.find({
          collection: 'investment',
          where: {
            investorMapping: {
              equals: investor.id,
            },
          },
          pagination: false,
          depth: 0,
        })

        // Process each company for this investor
        const companyPromises = Object.keys(companyMap).map(async (key) => {
          const companyId = Number(key)
          const company = companyMap[companyId]

          try {
            // Filter investments for this company
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
                  accountType: investment.accountType,
                }
              })

            // Generate recommendation
            const investmentRecommendationResponse =
              await generateInvestmentRecommendationWithLiveSearch({
                ticker: company.ticker,
                investments: investmentsInCompany,
              })

            // Create recommendation record
            await payload.create({
              collection: 'investmentRecommendation',
              data: {
                investor: investor.id,
                company: companyId,
                recommendationDate: new Date().toISOString(),
                buySellHoldRecommendation:
                  investmentRecommendationResponse.buySellHoldRecommendation as
                    | 'buy'
                    | 'sell'
                    | 'hold',
                recommendationReasoning:
                  investmentRecommendationResponse.recommendationReasoning,
              },
              user: processingUser,
              overrideAccess: true,
            })

            processedCount++
            if (processedCount % 10 === 0) {
              console.log(
                `[JOB:${jobName}] Progress: ${processedCount}/${totalCombinations} recommendations created`,
              )
            }
          } catch (error: any) {
            errorCount++
            const errorMessage = `Failed to create recommendation for investor ${investor.id}, company ${company.ticker}: ${error.message}`
            console.error(`[JOB:${jobName}] ${errorMessage}`)
            errors.push({
              message: errorMessage,
              context: {
                investorId: investor.id,
                companyId,
                ticker: company.ticker,
              },
            })
          }
        })

        // Wait for all companies to be processed for this investor
        await Promise.all(companyPromises)
      } catch (error: any) {
        errorCount++
        const errorMessage = `Failed to process investor ${investor.id}: ${error.message}`
        console.error(`[JOB:${jobName}] ${errorMessage}`, error)
        errors.push({
          message: errorMessage,
          context: { investorId: investor.id },
        })
      }
    }

    const endTime = new Date()
    const duration = endTime.getTime() - startTime.getTime()
    const success = errorCount === 0

    const message =
      errorCount > 0
        ? `Created ${processedCount} of ${totalCombinations} recommendations (${errorCount} errors)`
        : `Created ${processedCount} recommendations successfully`

    console.log(`[JOB:${jobName}] Completed`, {
      success,
      duration,
      processedCount,
      errorCount,
      timestamp: endTime.toISOString(),
    })

    return {
      success,
      jobName,
      startTime,
      endTime,
      duration,
      processedCount,
      errorCount,
      errors: errorCount > 0 ? errors : undefined,
      message,
    }
  } catch (error: any) {
    const endTime = new Date()
    console.error(`[JOB:${jobName}] Critical error:`, error)
    return {
      success: false,
      jobName,
      startTime,
      endTime,
      duration: endTime.getTime() - startTime.getTime(),
      processedCount,
      errorCount: errorCount + 1,
      errors: [{ message: `Critical error: ${error.message}` }],
      message: `Critical failure: ${error.message}`,
    }
  }
}
