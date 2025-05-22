import { Header } from './components/Header'
import { SearchBar } from './components/SearchBar'
import { RecentMovers } from './components/RecentMovers'
import { searchCompanies } from '../actions/search'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Investment Tracker</h1>
            <p className="text-lg text-gray-600">
              Search for stocks or check out the recent market movers
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-12">
            <SearchBar onSearch={searchCompanies} />
          </div>

          <div className="max-w-4xl mx-auto">
            <RecentMovers />
          </div>
        </div>
      </main>
    </div>
  )
}
