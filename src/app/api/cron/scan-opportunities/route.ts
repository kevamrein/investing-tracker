import { NextRequest, NextResponse } from 'next/server'
import { scanEarningsOpportunities } from '@/app/actions/scan-earnings-opportunities'

/**
 * Cron job endpoint for automated opportunity scanning
 * Runs daily to scan for new earnings opportunities
 *
 * Security: Requires CRON_SECRET in Authorization header
 * Schedule: Configured in vercel.json (recommended: daily at 7 AM)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error('CRON_SECRET not configured')
      return NextResponse.json(
        { error: 'Cron job not configured' },
        { status: 500 }
      )
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Invalid cron secret')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Starting automated opportunity scan...')

    // Run the scanner for recent opportunities
    // Scan last 7 days for any earnings events that match criteria
    const result = await scanEarningsOpportunities({
      mode: 'recent',
      daysBack: 7,
      minScore: 70, // Include all viable opportunities
    })

    if (!result.success) {
      console.error('Scan failed:', result.message)
      return NextResponse.json(
        {
          success: false,
          error: result.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }

    const highScoreOpportunities = result.opportunities?.filter(
      (opp: any) => opp.score >= 85
    ) || []

    console.log('Scan completed successfully:', {
      totalOpportunities: result.opportunities?.length || 0,
      highScoreOpportunities: highScoreOpportunities.length,
      timestamp: new Date().toISOString(),
    })

    // TODO: In the future, this is where you would:
    // 1. Fetch users with enabled alerts
    // 2. Check their minScore preferences
    // 3. Send notifications for matching opportunities

    return NextResponse.json({
      success: true,
      scan: {
        totalOpportunities: result.opportunities?.length || 0,
        highScoreOpportunities: highScoreOpportunities.length,
        opportunities: result.opportunities || [],
      },
      message: `Found ${result.opportunities?.length || 0} opportunities (${highScoreOpportunities.length} high-score)`,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error in cron scan job:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// Also support POST for manual testing
export async function POST(request: NextRequest) {
  return GET(request)
}
