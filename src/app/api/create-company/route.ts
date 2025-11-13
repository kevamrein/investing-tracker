import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, ticker, recommendationDate, priceTarget, timeframe } = body

    // Basic validation
    if (!name || !ticker || !recommendationDate) {
      return NextResponse.json(
        { message: 'Name, ticker, and recommendation date are required' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Create the company
    const company = await payload.create({
      collection: 'company',
      data: {
        name,
        ticker: ticker.toUpperCase(),
        recommendationDate,
        ...(priceTarget !== null && priceTarget !== undefined && { priceTarget }),
        ...(timeframe && { timeframe }),
      },
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error: any) {
    console.error('Error creating company:', error)

    // Handle duplicate ticker error from the hook
    if (error.message && error.message.includes('already exists')) {
      return NextResponse.json({ message: error.message }, { status: 409 })
    }

    return NextResponse.json(
      { message: 'Failed to create company. Please try again.' },
      { status: 500 },
    )
  }
}
