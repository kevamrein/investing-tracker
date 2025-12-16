'use server'

import config from '@/payload.config'
import { getPayload } from 'payload'
import getSession from './auth-utils'

interface GetOpportunitiesParams {
  status?: string
  minScore?: number
  limit?: number
  page?: number
}

export async function getOpportunities(params: GetOpportunitiesParams = {}) {
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

    if (params.minScore) {
      where.score = { greater_than_equal: params.minScore }
    }

    const result = await payload.find({
      collection: 'option-opportunities',
      where,
      limit: params.limit || 50,
      page: params.page || 1,
      sort: '-score', // Highest scores first
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
    console.error('Error fetching opportunities:', error)
    return { success: false, message: error.message }
  }
}
