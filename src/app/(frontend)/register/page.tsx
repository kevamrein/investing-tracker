'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import passwordSecurity from '../../../lib/passwordSecurity'
import { registerUser } from '@/app/actions/register'
import { useFormStatus } from 'react-dom'

// Submit button component that shows loading state
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-primary-foreground transition-all ${
        pending
          ? 'bg-primary/70 cursor-not-allowed'
          : 'bg-primary hover:bg-primary/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
    >
      {pending ? (
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
          Creating account...
        </div>
      ) : (
        'Create Account'
      )}
    </button>
  )
}

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  // Wrap the registerUser server action to handle client-side logic
  async function handleRegistration(formData: FormData) {
    setError('')
    // Prepare secure password for sign in
    const plainPassword = formData.get('password') as string
    const securePassword = passwordSecurity.preparePasswordForTransmission(plainPassword)

    // Replace the original password with the secure one
    formData.set('password', securePassword)

    // Call the server action
    const result = await registerUser(formData)

    if (!result.success) {
      setError(result.message || 'Registration failed. Please try again.')
      return
    }

    // If registration is successful, sign in the user with the secure password
    const signInResult = await signIn('credentials', {
      redirect: false,
      email: formData.get('email') as string,
      password: securePassword,
      isEncoded: 'true',
    })

    if (signInResult?.error) {
      setError('Registration successful, but automatic login failed. Please try logging in.')
      router.push('/login')
      return
    }

    router.push('/')
    router.refresh()
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-card-foreground">Join Investment Tracker</h1>
          <p className="mt-2 text-muted-foreground font-medium">
            Create your account to get started
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-lg">
            <p className="text-destructive font-medium">{error}</p>
          </div>
        )}

        <form action={handleRegistration} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-semibold text-card-foreground mb-2"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="block w-full px-4 py-3 border border-input rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background/50 placeholder:text-muted-foreground"
                  placeholder="Enter your first name"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-semibold text-card-foreground mb-2"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="block w-full px-4 py-3 border border-input rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background/50 placeholder:text-muted-foreground"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 border border-input rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background/50 placeholder:text-muted-foreground"
                placeholder="Create a password"
              />
            </div>
          </div>

          <div>
            <SubmitButton />
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
