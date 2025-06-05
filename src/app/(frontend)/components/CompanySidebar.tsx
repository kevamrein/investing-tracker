'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Company } from '@/payload-types'

export function CompanySidebar({ companies }: { companies: Company[] }) {
  const [filteredCompanies, setFilteredCompanies] = useState(companies)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const filtered = companies.filter(
      (company) =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.ticker.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredCompanies(filtered)
  }, [searchTerm, companies])

  return (
    <div className="w-64 bg-white shadow-lg h-screen overflow-y-auto">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Companies</h2>
        <div className="relative">
          <div className="flex items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter companies..."
              className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
      <nav className="p-2">
        <ul className="space-y-1">
          {filteredCompanies.map((company) => (
            <li key={company.id}>
              <Link
                href={`/stock/${company.ticker}`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                {company.name} ({company.ticker})
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
