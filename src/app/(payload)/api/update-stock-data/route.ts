import { getPayload } from 'payload'
import config from '@payload-config'
import { generateStockInformation } from '@/ai/generate-stock-information'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    })
  }

  if (!process.env.PROCESSING_USER_ID) {
    console.error('Processing user ID not set')
    return new Response('Processing user ID not set', {
      status: 500,
    })
  }

  const payload = await getPayload({ config })

  const processingUser = await payload.findByID({
    collection: 'users',
    id: process.env.PROCESSING_USER_ID as string,
  })

  if (!processingUser) {
    console.error('Processing user not found')
    return new Response('Processing user not found', {
      status: 500,
    })
  }

  console.log('Found processing user')

  const companies = await payload.find({
    collection: 'company',
    pagination: false,
  })

  if (!companies) {
    console.error('No companies found')
    return new Response('No companies found', {
      status: 200,
    })
  }

  companies.docs.forEach(async (company) => {
    console.log('Updating company', company.ticker)
    const { ticker } = company
    const response = await generateStockInformation({ ticker })
    const date = new Date().toISOString()
    let bullCase = company.bullCase || []
    let bearCase = company.bearCase || []

    console.log(`Current bull case: ${JSON.stringify(bullCase)}`)
    console.log(`Current bear case: ${JSON.stringify(bearCase)}`)

    bullCase.push({
      opinionText: response.bullCase,
      opinionDate: date,
    })
    bearCase.push({
      opinionText: response.bearCase,
      opinionDate: date,
    })

    console.log(`Bull case: ${JSON.stringify(bullCase)}`)
    console.log(`Bear case: ${JSON.stringify(bearCase)}`)

    const result = await payload.update({
      collection: 'company',
      id: company.id,
      data: {
        bullCase,
        bearCase,
      },
      user: processingUser,
      overrideAccess: true,
    })

    console.log(`Result: ${JSON.stringify(result)}`)
  })

  console.log('Recommendations updated')
  return new Response('Recommendations updated', {
    status: 200,
  })
}
