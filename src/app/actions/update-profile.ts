'use server'

import { getPayload } from 'payload'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../lib/auth'
import config from '../../payload.config'

export async function updateInvestableAssets(amount: number) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const payload = await getPayload({ config })

  await payload.update({
    collection: 'investors',
    id: session.user.id,
    data: {
      investableAssets: amount,
    },
  })
}

export async function getInvestableAssets() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const payload = await getPayload({ config })

  const result = await payload.findByID({
    collection: 'investors',
    id: session.user.id,
  })

  return result.investableAssets
}
