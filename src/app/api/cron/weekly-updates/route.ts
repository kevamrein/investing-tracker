import { NextResponse } from 'next/server'
import { authenticateCronRequest } from '@/lib/cron/auth'
import { updateStockDataJob } from '@/lib/cron/jobs/update-stock-data'
import { updateInvestmentRecommendationsJob } from '@/lib/cron/jobs/update-investment-recommendations'
import type { CronJobResult } from '@/lib/cron/types'

export async function GET(request: Request) {
  const startTime = new Date()

  console.log('[CRON] Weekly updates started', {
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

    // 2. Execute jobs sequentially

    // Job 1: Update stock data
    console.log('[CRON] Starting stock data update...')
    const stockDataResult = await updateStockDataJob(context)
    results.push(stockDataResult)
    console.log(`[CRON] Stock data update completed: ${stockDataResult.message}`)

    // Job 2: Update investment recommendations
    // Note: This depends on stock data being fresh
    console.log('[CRON] Starting investment recommendations update...')
    const recommendationsResult = await updateInvestmentRecommendationsJob(context)
    results.push(recommendationsResult)
    console.log(
      `[CRON] Investment recommendations update completed: ${recommendationsResult.message}`,
    )

    // 3. Aggregate results
    const endTime = new Date()
    const totalDuration = endTime.getTime() - startTime.getTime()

    const allSuccessful = results.every((r) => r.success)
    const summary = {
      success: allSuccessful,
      timestamp: endTime.toISOString(),
      duration: totalDuration,
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

    console.log('[CRON] Weekly updates completed', {
      success: allSuccessful,
      duration: totalDuration,
      timestamp: endTime.toISOString(),
    })

    // 4. Return comprehensive response
    // 200 = All successful
    // 207 = Multi-Status (some succeeded, some failed)
    return NextResponse.json(summary, {
      status: allSuccessful ? 200 : 207,
    })
  } catch (error: any) {
    console.error('[CRON] Critical error in weekly updates cron:', error)
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
