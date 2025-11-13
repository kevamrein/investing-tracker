'use server'

import config from '@/payload.config'
import { getPayload } from 'payload'

export async function createCompany(formData: FormData) {
  const name = formData.get('name') as string
  const ticker = formData.get('ticker') as string
  const recommendationDate = formData.get('recommendationDate') as string
  const priceTarget = formData.get('priceTarget') as string
  const timeframe = formData.get('timeframe') as string

  // Basic validation
  if (!name || !ticker || !recommendationDate) {
    return { success: false, message: 'Name, ticker, and recommendation date are required' }
  }

  try {
    const payload = await getPayload({ config })

    // Create the company
    const company = await payload.create({
      collection: 'company',
      data: {
        name: name.trim(),
        ticker: ticker.trim().toUpperCase(),
        recommendationDate,
        ...(priceTarget && { priceTarget: parseFloat(priceTarget) }),
        ...(timeframe && { timeframe: timeframe.trim() }),
      },
    })

    return { success: true, company }
  } catch (error: any) {
    console.error('Error creating company:', error)

    // Handle duplicate ticker error from the hook
    if (error.message && error.message.includes('already exists')) {
      return { success: false, message: error.message }
    }

    return { success: false, message: 'Failed to create company. Please try again.' }
  }
}
