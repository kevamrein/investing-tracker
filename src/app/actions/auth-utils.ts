import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function getSession() {
  return getServerSession(authOptions)
}
