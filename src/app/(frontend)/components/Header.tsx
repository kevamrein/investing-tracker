import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function Header() {
  const session = await getServerSession(authOptions)
  const user = session?.user

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
              <div className="flex items-center space-x-4">
                <span className="text-muted-foreground">{`${user.firstName} ${user.lastName}`}</span>
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sign out
                  </button>
                </form>
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
