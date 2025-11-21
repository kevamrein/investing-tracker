import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { askPortfolioQuestion } from '@/ai/portfolio-question'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { question } = await request.json()

    if (!question) {
      return NextResponse.json({ error: 'Missing question' }, { status: 400 })
    }

    const result = await askPortfolioQuestion({
      question,
      investorId: session.user.id,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in ask-portfolio-question API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
