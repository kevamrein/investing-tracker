'use server'

import config from '@/payload.config'
import { getPayload } from 'payload'
import getSession from './auth-utils'

export async function createInvestment(formData: FormData) {
  const accountType = formData.get('accountType') as string
  const companyId = formData.get('companyId') as string
  const transactionType = formData.get('transactionType') as string
  const investmentDate = formData.get('investmentDate') as string
  const shares = formData.get('shares') as string
  const pricePerShare = formData.get('pricePerShare') as string
  const notes = formData.get('notes') as string

  // Basic validation
  if (
    !accountType ||
    !companyId ||
    !transactionType ||
    !investmentDate ||
    !shares ||
    !pricePerShare
  ) {
    return { success: false, message: 'All required fields must be filled' }
  }

  const session = await getSession()
  if (!session?.user?.id) {
    return { success: false, message: 'User not authenticated' }
  }

  try {
    const payload = await getPayload({ config })

    console.log('Creating investment:', {
      accountType,
      investorMapping: parseInt(session.user.id),
      company: parseInt(companyId),
      transactionType,
      investmentDate,
      shares: parseFloat(shares),
      pricePerShare: parseFloat(pricePerShare),
      notes: notes?.trim(),
    })

    // Create the investment
    const investment = await payload.create({
      collection: 'investment',
      data: {
        accountType: accountType as 'taxable' | 'ira',
        investorMapping: parseInt(session.user.id),
        company: parseInt(companyId),
        transactionType: transactionType as 'buy' | 'sell',
        investmentDate,
        shares: parseFloat(shares),
        pricePerShare: parseFloat(pricePerShare),
        ...(notes && { notes: notes.trim() }),
      },
    })

    console.log('Investment created:', investment.id)
    return { success: true, investment }
  } catch (error: any) {
    console.error('Error creating investment:', error)
    return { success: false, message: 'Failed to create investment. Please try again.' }
  }
}
