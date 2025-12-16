'use server'

import config from '@/payload.config'
import { getPayload } from 'payload'
import getSession from './auth-utils'

interface GetTradesParams {
  status?: string
  ticker?: string
  limit?: number
  page?: number
}

export async function getOptionTrades(params: GetTradesParams = {}) {
  const session = await getSession()
  if (!session?.user?.id) {
    return { success: false, message: 'User not authenticated' }
  }

  try {
    const payload = await getPayload({ config })

    const where: any = {
      investor: { equals: parseInt(session.user.id) },
    }

    if (params.status) {
      where.status = { equals: params.status }
    }

    if (params.ticker) {
      where.ticker = { equals: params.ticker.toUpperCase() }
    }

    const result = await payload.find({
      collection: 'option-paper-trades',
      where,
      limit: params.limit || 50,
      page: params.page || 1,
      sort: '-entryDate', // Most recent first
    })

    return {
      success: true,
      docs: result.docs,
      totalDocs: result.totalDocs,
      limit: result.limit,
      totalPages: result.totalPages,
      page: result.page,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    }
  } catch (error: any) {
    console.error('Error fetching trades:', error)
    return { success: false, message: error.message }
  }
}
