import { getCompaniesWithRecommendations } from '@/app/actions/get-companies-with-recommendations'
import { CompanySidebar } from './CompanySidebar'

export async function CompanySidebarWrapper() {
  const { docs: companies } = await getCompaniesWithRecommendations({ page: 1, limit: 20 })
  return <CompanySidebar initialCompanies={companies} />
}
