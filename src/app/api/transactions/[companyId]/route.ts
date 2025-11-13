import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> },
) {
  try {
    console.log('API: Fetching transactions')
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('API: No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { companyId } = await params
    console.log('API: companyId:', companyId, 'userId:', session.user.id)

    const payload = await getPayload({ config })

    const transactions = await payload.find({
      collection: 'investment',
      where: {
        company: {
          equals: parseInt(companyId),
        },
        investorMapping: {
          equals: parseInt(session.user.id),
        },
      },
      sort: '-investmentDate',
    })

    console.log('API: Found transactions:', transactions.docs.length)

    const transactionHistory = transactions.docs.map((txn) => ({
      type: txn.transactionType,
      shares: txn.shares,
      date: new Date(txn.investmentDate).toLocaleDateString(),
      amount: (txn.shares * txn.pricePerShare).toFixed(2),
      price: txn.pricePerShare.toFixed(2),
      accountType: txn.accountType || 'taxable',
    }))

    console.log('API: Returning transactions:', transactionHistory.length)
    return NextResponse.json({ transactions: transactionHistory })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}
