'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '../components/Header'
import { updateInvestableAssets, getInvestableAssets } from '@/app/actions/update-profile'

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [investableAssets, setInvestableAssets] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const assets = await getInvestableAssets()
        setInvestableAssets(assets?.toString() || '')
      } catch (error) {
        console.error('Failed to fetch investable assets')
      }
    }
    if (session) {
      fetchAssets()
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateInvestableAssets(parseFloat(investableAssets))
      await update() // Refresh session
      alert('Investable assets updated successfully!')
    } catch (error) {
      alert('Failed to update investable assets.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <Header />
      <main className="py-12 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-foreground mb-4">Profile Settings</h1>
              <p className="text-xl text-muted-foreground font-medium">
                Manage your account and investment preferences
              </p>
            </div>

            <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-lg">
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-card-foreground mb-6">
                    Investment Information
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label
                        htmlFor="investableAssets"
                        className="block text-sm font-semibold text-card-foreground mb-2"
                      >
                        Investable Assets ($)
                      </label>
                      <input
                        type="number"
                        id="investableAssets"
                        value={investableAssets}
                        onChange={(e) => setInvestableAssets(e.target.value)}
                        className="block w-full px-4 py-3 border border-input rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-background/50 placeholder:text-muted-foreground"
                        placeholder="Enter your total investable assets"
                        required
                      />
                      <p className="mt-2 text-sm text-muted-foreground">
                        The total amount of money you have available for investments
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full sm:w-auto flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-primary-foreground transition-all ${
                        loading
                          ? 'bg-primary/70 cursor-not-allowed'
                          : 'bg-primary hover:bg-primary/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary`}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
