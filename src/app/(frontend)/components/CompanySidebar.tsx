'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Company } from '@/payload-types'
import { AddCompanyModal } from '@/components/AddCompanyModal'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getCompaniesWithRecommendations } from '@/app/actions/get-companies-with-recommendations'

function RecommendationBadge({ type }: { type: 'buy' | 'sell' | 'hold' }) {
  const styles = {
    buy: 'bg-accent text-accent-foreground',
    sell: 'bg-destructive text-destructive-foreground',
    hold: 'bg-muted text-muted-foreground',
  }

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[type]}`}>
      {type.toUpperCase()}
    </span>
  )
}

export function CompanySidebar({ initialCompanies }: { initialCompanies: Company[] }) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Debounce search term to avoid too many requests
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Reset when search changes
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true)
      try {
        const { docs, hasNextPage } = await getCompaniesWithRecommendations({
          page: 1,
          limit: 20,
          query: debouncedSearchTerm,
        })
        setCompanies(docs)
        setHasMore(hasNextPage)
        setPage(1)
      } catch (error) {
        console.error('Error fetching companies:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanies()
  }, [debouncedSearchTerm])

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const nextPage = page + 1
      const { docs, hasNextPage } = await getCompaniesWithRecommendations({
        page: nextPage,
        limit: 20,
        query: debouncedSearchTerm,
      })

      setCompanies((prev) => [...prev, ...docs])
      setHasMore(hasNextPage)
      setPage(nextPage)
    } catch (error) {
      console.error('Error loading more companies:', error)
    } finally {
      setIsLoading(false)
    }
  }, [page, hasMore, debouncedSearchTerm, isLoading])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore()
        }
      },
      { threshold: 0.1 },
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [loadMore, hasMore])

  return (
    <div className="w-64 bg-card/95 backdrop-blur-sm shadow-xl h-screen sticky top-0 flex flex-col border-r border-border/50">
      <div className="p-4 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            Companies
          </h2>
          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <div className="flex items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter companies..."
              className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-10 text-foreground ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary transition-all bg-background/50"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
      <nav className="p-2 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {companies.map((company) => (
            <li key={company.id}>
              <Link
                href={`/stock/${company.ticker}`}
                className="group flex items-center px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-all duration-200 border border-transparent hover:border-border/30"
              >
                <svg
                  className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-primary transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium">{company.name}</div>
                    {(company as any).latestRecommendation && (
                      <RecommendationBadge type={(company as any).latestRecommendation.type} />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground/70">{company.ticker}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {hasMore && (
          <div ref={observerTarget} className="p-4 flex justify-center">
            {isLoading && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
          </div>
        )}
      </nav>
      <AddCompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCompanyAdded={() => {
          router.refresh()
          // Reset list
          setPage(1)
          setSearchTerm('')
        }}
      />
    </div>
  )
}
