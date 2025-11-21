import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { askStockQuestion } from '@/ai/stock-question'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ticker, question } = await request.json()

    if (!ticker || !question) {
      return NextResponse.json({ error: 'Missing ticker or question' }, { status: 400 })
    }

    const result = await askStockQuestion({
      ticker,
      question,
      investorId: session.user.id,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in ask-stock-question API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
