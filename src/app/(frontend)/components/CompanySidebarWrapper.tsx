import { getPayload } from 'payload'
import config from '@payload-config'
import { CompanySidebar } from './CompanySidebar'

async function getCompanies() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'company',
    sort: 'name',
  })
  return result.docs
}

export async function CompanySidebarWrapper() {
  const companies = await getCompanies()
  return <CompanySidebar companies={companies} />
}
