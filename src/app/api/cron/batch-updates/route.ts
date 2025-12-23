import { NextResponse } from 'next/server'
import { authenticateCronRequest } from '@/lib/cron/auth'
import { updateStockDataJob } from '@/lib/cron/jobs/update-stock-data'
import { updateInvestmentRecommendationsJob } from '@/lib/cron/jobs/update-investment-recommendations'
import { selectCompaniesForBatch } from '@/lib/cron/helpers/batch-selector'
import type { CronJobResult } from '@/lib/cron/types'

export async function GET(request: Request) {
  const startTime = new Date()

  console.log('[CRON] Batch updates started', {
    timestamp: startTime.toISOString(),
  })

  try {
    // 1. Authenticate and initialize
    const authResult = await authenticateCronRequest(request)
    if (!authResult.success) {
      console.error('[CRON] Authentication failed')
      return authResult.response!
    }

    const context = authResult.context!
    const results: CronJobResult[] = []

    // 2. Select companies for this batch (max 10)
    console.log('[CRON] Selecting companies for batch processing...')
    const selectedCompanies = await selectCompaniesForBatch(context.payload, 10)

    // 3. Early exit if no companies need processing
    if (selectedCompanies.length === 0) {
      const endTime = new Date()
      const totalDuration = endTime.getTime() - startTime.getTime()

      console.log('[CRON] No companies need processing at this time', {
        timestamp: endTime.toISOString(),
        duration: totalDuration,
      })

      return NextResponse.json(
        {
          success: true,
          timestamp: endTime.toISOString(),
          duration: totalDuration,
          message: 'No companies need processing at this time',
          processedCount: 0,
          batchSize: 0,
        },
        { status: 200 },
      )
    }

    // 4. Extract company IDs and log details
    const companyIds = selectedCompanies.map((c) => c.id)
    console.log('[CRON] Processing batch:', {
      batchSize: selectedCompanies.length,
      companies: selectedCompanies.map((c) => ({
        id: c.id,
        ticker: c.ticker,
        name: c.name,
      })),
    })

    // 5. Execute jobs sequentially with company filter

    // Job 1: Update stock data for selected companies
    console.log('[CRON] Starting stock data update for batch...')
    const stockDataResult = await updateStockDataJob(context, companyIds)
    results.push(stockDataResult)
    console.log(`[CRON] Stock data update completed: ${stockDataResult.message}`)

    // Job 2: Update investment recommendations for selected companies
    // Note: This depends on stock data being fresh
    console.log('[CRON] Starting investment recommendations update for batch...')
    const recommendationsResult = await updateInvestmentRecommendationsJob(context, companyIds)
    results.push(recommendationsResult)
    console.log(
      `[CRON] Investment recommendations update completed: ${recommendationsResult.message}`,
    )

    // 6. Aggregate results
    const endTime = new Date()
    const totalDuration = endTime.getTime() - startTime.getTime()

    const allSuccessful = results.every((r) => r.success)
    const totalProcessed = results.reduce((sum, r) => sum + (r.processedCount || 0), 0)
    const totalErrors = results.reduce((sum, r) => sum + (r.errorCount || 0), 0)

    const summary = {
      success: allSuccessful,
      timestamp: endTime.toISOString(),
      duration: totalDuration,
      batchSize: selectedCompanies.length,
      selectedCompanyIds: companyIds,
      processedCount: totalProcessed,
      errorCount: totalErrors,
      jobs: results.map((r) => ({
        name: r.jobName,
        success: r.success,
        duration: r.duration,
        message: r.message,
        processedCount: r.processedCount,
        errorCount: r.errorCount,
        errors: r.errors,
      })),
    }

    console.log('[CRON] Batch updates completed', {
      success: allSuccessful,
      duration: totalDuration,
      batchSize: selectedCompanies.length,
      processedCount: totalProcessed,
      errorCount: totalErrors,
      timestamp: endTime.toISOString(),
    })

    // 7. Return comprehensive response
    // 200 = All successful
    // 207 = Multi-Status (some succeeded, some failed)
    return NextResponse.json(summary, {
      status: allSuccessful ? 200 : 207,
    })
  } catch (error: any) {
    console.error('[CRON] Critical error in batch updates cron:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Critical failure in cron execution',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// Support POST for manual testing
export async function POST(request: Request) {
  return GET(request)
}
