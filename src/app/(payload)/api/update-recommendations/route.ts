import { getPayload } from 'payload'
import config from '@payload-config'
import { generateStockInformation } from '@/ai/ai-service'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    })
  }

  const payload = await getPayload({ config })

  const processingUser = await payload.findByID({
    collection: 'users',
    id: process.env.PROCESSING_USER_ID as string,
  })

  const companies = await payload.find({
    collection: 'company',
    pagination: false,
  })

  if (!companies) {
    return new Response('No companies found', {
      status: 200,
    })
  }

  companies.docs.forEach(async (company) => {
    const { ticker } = company
    const response = await generateStockInformation({ ticker })
    const date = new Date().toISOString()
    let bullCase = company.bullCase || []
    let bearCase = company.bearCase || []

    bullCase.push({
      opinionText: response.bullCase,
      opinionDate: date,
    })
    bearCase.push({
      opinionText: response.bearCase,
      opinionDate: date,
    })
    await payload.update({
      collection: 'company',
      id: company.id,
      data: {
        bullCase,
        bearCase,
      },
      user: processingUser,
      overrideAccess: true,
    })
  })

  return new Response('Recommendations updated', {
    status: 200,
  })
}
