import { getPayload } from 'payload'
import config from '@payload-config'
import type { CronContext } from './types'

interface AuthResult {
  success: boolean
  context?: CronContext
  response?: Response
}

export async function authenticateCronRequest(request: Request): Promise<AuthResult> {
  // Verify CRON_SECRET
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return {
      success: false,
      response: new Response('Unauthorized', { status: 401 }),
    }
  }

  // Verify PROCESSING_USER_ID is set
  if (!process.env.PROCESSING_USER_ID) {
    console.error('[CRON:AUTH] Processing user ID not set')
    return {
      success: false,
      response: new Response('Processing user ID not set', { status: 500 }),
    }
  }

  // Initialize Payload
  const payload = await getPayload({ config })

  // Fetch processing user
  const processingUser = await payload.findByID({
    collection: 'users',
    id: process.env.PROCESSING_USER_ID as string,
  })

  if (!processingUser) {
    console.error('[CRON:AUTH] Processing user not found')
    return {
      success: false,
      response: new Response('Processing user not found', { status: 500 }),
    }
  }

  console.log('[CRON:AUTH] Authentication successful')

  return {
    success: true,
    context: {
      payload,
      processingUser,
    },
  }
}
