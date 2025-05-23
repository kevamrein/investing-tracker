import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function Header() {
  const session = await getServerSession(authOptions)
  const user = session?.user

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Investment Tracker
            </Link>
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">{`${user.firstName} ${user.lastName}`}</span>
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
