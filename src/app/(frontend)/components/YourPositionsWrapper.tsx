import { getPayload } from 'payload'
import config from '@payload-config'
import { YourPositions } from './YourPositions'
import getSession from '@/app/actions/auth-utils'
import { getCurrentPositions } from '@/app/actions/get-current-positions'

export async function YourPositionsWrapper() {
  const session = await getSession()
  const investorId = session?.user?.id

  if (!investorId) {
    return (
      <div className="bg-card shadow-lg rounded-xl p-6 border border-border/50">
        <p className="text-muted-foreground">Please log in to view your positions.</p>
      </div>
    )
  }

  const positionsData = await getCurrentPositions()

  return <YourPositions positionsData={positionsData} />
}
