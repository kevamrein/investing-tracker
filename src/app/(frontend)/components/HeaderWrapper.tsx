'use client'

import { Suspense } from 'react'
import { Header } from './Header'

export function HeaderWrapper() {
  return (
    <Suspense
      fallback={
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold text-gray-900">Investment Tracker</span>
              </div>
            </div>
          </div>
        </header>
      }
    >
      <Header />
    </Suspense>
  )
}
