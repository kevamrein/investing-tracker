'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function Header() {
  const { data: session } = useSession()
  const user = session?.user
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-gradient-to-r from-primary/5 to-secondary/5 shadow-sm border-b border-border/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-2xl font-extrabold text-card-foreground hover:text-primary transition-colors"
            >
              Investment Tracker
            </Link>
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>{`${user.firstName} ${user.lastName}`}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card/95 backdrop-blur-sm rounded-xl shadow-2xl border border-border/50 py-2 z-50">
                    <Link
                      href="/signout"
                      className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign out
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
