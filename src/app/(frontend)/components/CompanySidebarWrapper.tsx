import { getCompanies } from '@/app/actions/get-companies'
import { CompanySidebar } from './CompanySidebar'

export async function CompanySidebarWrapper() {
  const { docs: companies } = await getCompanies({ page: 1, limit: 20 })
  return <CompanySidebar initialCompanies={companies} />
}
