'use client'

import { useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import passwordSecurity from '../../../lib/passwordSecurity'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (status === 'authenticated' && session) {
      router.push('/')
    }

    try {
      // Securely encode the password before transmitting
      const securePassword = passwordSecurity.preparePasswordForTransmission(password)

      const result = await signIn('credentials', {
        redirect: false,
        email,
        password: securePassword,
        isEncoded: 'true',
        callbackUrl: '/',
      })

      if (!result) {
        setError('Connection error. Please try again.')
        setIsLoading(false)
        return
      }

      if (result.error) {
        setError('Invalid credentials. Please try again.')
        setIsLoading(false)
        return
      }

      // Login successful
      router.push('/')
      setIsLoading(false)

      // The useEffect will handle the redirect once the session is updated
      // No need for manual redirect here
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred during login. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-md w-full space-y-8 p-8 bg-card/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-border/50">
        <div className="text-center">
          <div className="mb-6">
            <svg
              className="w-12 h-12 text-primary mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-card-foreground">Welcome Back</h1>
          <p className="mt-2 text-muted-foreground font-medium">Sign in to Investment Tracker</p>
        </div>

        {error && (
          <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-lg">
            <p className="text-destructive font-medium">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-card-foreground mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 border border-input rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background/50 placeholder:text-muted-foreground"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-card-foreground mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 border border-input rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background/50 placeholder:text-muted-foreground"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-primary-foreground transition-all ${
                isLoading
                  ? 'bg-primary/70 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
