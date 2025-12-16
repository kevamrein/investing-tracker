import { generateStockInformation } from '@/ai/generate-stock-information'
import type { CronContext, CronJobResult } from '../types'

export async function updateStockDataJob(context: CronContext): Promise<CronJobResult> {
  const startTime = new Date()
  const jobName = 'update-stock-data'
  let processedCount = 0
  let errorCount = 0
  const errors: Array<{ message: string; context?: any }> = []

  console.log(`[JOB:${jobName}] Starting...`, { timestamp: startTime.toISOString() })

  try {
    const { payload, processingUser } = context

    // Fetch all companies
    const companies = await payload.find({
      collection: 'company',
      pagination: false,
    })

    if (!companies || companies.docs.length === 0) {
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
        message: 'No companies found to update',
      }
    }

    const totalCompanies = companies.docs.length
    console.log(`[JOB:${jobName}] Found ${totalCompanies} companies to process`)

    // CRITICAL FIX: Use for...of loop instead of forEach to properly await async operations
    for (const company of companies.docs) {
      try {
        console.log(`[JOB:${jobName}] Updating company ${company.ticker}`)

        const { ticker } = company
        const response = await generateStockInformation({ ticker })
        const date = new Date().toISOString()

        let bullCase = company.bullCase || []
        let bearCase = company.bearCase || []

        console.log(`[JOB:${jobName}] ${ticker}: Current bull case count: ${bullCase.length}`)
        console.log(`[JOB:${jobName}] ${ticker}: Current bear case count: ${bearCase.length}`)

        bullCase.push({
          opinionText: response.bullCase,
          opinionDate: date,
        })
        bearCase.push({
          opinionText: response.bearCase,
          opinionDate: date,
        })

        await payload.update({
          collection: 'company',
          id: company.id,
          data: {
            bullCase,
            bearCase,
          },
          user: processingUser,
          overrideAccess: true,
        })

        processedCount++
        console.log(`[JOB:${jobName}] ${ticker}: Successfully updated (${processedCount}/${totalCompanies})`)
      } catch (error: any) {
        errorCount++
        const errorMessage = `Failed to update company ${company.ticker}: ${error.message}`
        console.error(`[JOB:${jobName}] ${errorMessage}`, error)
        errors.push({
          message: errorMessage,
          context: { ticker: company.ticker, companyId: company.id },
        })
      }
    }

    const endTime = new Date()
    const duration = endTime.getTime() - startTime.getTime()
    const success = errorCount === 0

    const message = errorCount > 0
      ? `Updated ${processedCount} of ${totalCompanies} companies (${errorCount} errors)`
      : `Updated ${processedCount} companies successfully`

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
