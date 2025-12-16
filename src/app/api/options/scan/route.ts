import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { scanEarningsOpportunities } from '@/app/actions/scan-earnings-opportunities'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      mode = 'recent',
      daysBack = 7,
      daysAhead = 30,
      minScore = 70,
    } = body

    const result = await scanEarningsOpportunities({
      mode,
      daysBack: mode === 'recent' ? daysBack : undefined,
      daysAhead: mode === 'upcoming' ? daysAhead : undefined,
      minScore,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 500 }
      )
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error in scan API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
