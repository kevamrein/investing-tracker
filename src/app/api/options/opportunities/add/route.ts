import { NextRequest, NextResponse } from 'next/server'
import config from '@/payload.config'
import { getPayload } from 'payload'
import getSession from '@/app/actions/auth-utils'

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Parse request body
    const opportunity = await request.json()

    // Validate required fields
    if (!opportunity.ticker || !opportunity.earningsDate) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: ticker and earningsDate' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config })

    // Check if opportunity already exists for this user
    const existing = await payload.find({
      collection: 'option-opportunities',
      where: {
        and: [
          { ticker: { equals: opportunity.ticker } },
          { earningsDate: { equals: opportunity.earningsDate } },
          { investor: { equals: parseInt(userId) } },
        ],
      },
    })

    if (existing.docs.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `${opportunity.ticker} opportunity already exists in your scanner`,
          opportunityId: existing.docs[0].id
        },
        { status: 409 }
      )
    }

    // Create new opportunity
    const created = await payload.create({
      collection: 'option-opportunities',
      draft: false,
      data: {
        ticker: opportunity.ticker,
        companyName: opportunity.companyName,
        opportunityId: `${opportunity.ticker}_${new Date(opportunity.earningsDate).getTime()}`,
        earningsDate: opportunity.earningsDate,
        dropPct: opportunity.dropPct,
        epsBeatPct: opportunity.epsBeatPct,
        score: opportunity.score,
        preEarningsPrice: opportunity.preEarningsPrice,
        postEarningsPrice: opportunity.postEarningsPrice,
        currentPrice: opportunity.currentPrice,
        marketCap: opportunity.marketCap,
        sector: opportunity.sector,
        daysSinceEarnings: opportunity.daysSinceEarnings,
        day1Change: opportunity.day1Change,
        entryStatus: opportunity.entryStatus,
        entryWindow: opportunity.entryWindow,
        investor: parseInt(userId),
        identifiedDate: new Date().toISOString(),
        status: 'pending',
      },
    })

    return NextResponse.json({
      success: true,
      message: `${opportunity.ticker} added to scanner successfully`,
      opportunityId: created.id,
    })
  } catch (error: any) {
    console.error('Error adding opportunity:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to add opportunity' },
      { status: 500 }
    )
  }
}
