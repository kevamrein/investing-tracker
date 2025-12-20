import { Header } from './components/Header'
import { YourPositionsWrapper } from './components/YourPositionsWrapper'
import { CompanySidebarWrapper } from './components/CompanySidebarWrapper'
import { AskPortfolioQuestionModal } from '@/components/AskPortfolioQuestionModal'
import { AskSystemQuestionModal } from '@/components/AskSystemQuestionModal'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <Header />
      <div className="flex">
        <CompanySidebarWrapper />
        <main className="flex-1 py-12 px-8">
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="mb-6">
                <svg
                  className="w-16 h-16 text-primary mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-5xl font-extrabold text-foreground mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Investment Tracker
              </h1>
              <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                Stay ahead of the market with real-time insights, personalized recommendations, and
                comprehensive portfolio tracking
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mr-3">
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
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground">Market Overview</h3>
                </div>
                <p className="text-muted-foreground font-light">
                  Track market trends and get instant updates on stock performance
                </p>
              </div>

              <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mr-3">
                    <svg
                      className="w-5 h-5 text-accent"
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
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground">
                    Portfolio Analytics
                  </h3>
                </div>
                <p className="text-muted-foreground font-light">
                  Analyze your investments with detailed performance metrics
                </p>
              </div>

              <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center mr-3">
                    <svg
                      className="w-5 h-5 text-secondary-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground">AI Insights</h3>
                </div>
                <p className="text-muted-foreground font-light">
                  Get AI-powered recommendations and market predictions
                </p>
              </div>
            </div>

            {/* Options Trading Feature */}
            <div className="max-w-4xl mx-auto mb-12">
              <a
                href="/options"
                className="block bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl p-8 border-2 border-green-200 dark:border-green-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mr-4">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-green-900 dark:text-green-100">
                          Options Paper Trading
                        </h2>
                      </div>
                    </div>
                    <p className="text-green-800 dark:text-green-200 font-medium text-lg mb-2">
                      Beat + Drop Recovery Strategy
                    </p>
                    <p className="text-green-700 dark:text-green-300">
                      Practice options trading with our validated strategy: scan for earnings beats that
                      dropped &gt;5%, paper trade ATM calls, and track performance analytics
                    </p>
                  </div>
                  <div className="ml-6">
                    <svg
                      className="w-8 h-8 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </a>
            </div>

            {/* AI Portfolio Assistant Feature */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8 border border-primary/10 shadow-lg">
                <div className="text-center">
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-6 h-6 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    AI Portfolio Assistant
                  </h2>
                  <p className="text-muted-foreground font-medium mb-6 max-w-md mx-auto">
                    Get personalized insights about your portfolio performance, market trends, and
                    investment strategies
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <AskPortfolioQuestionModal />
                    <AskSystemQuestionModal />
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              <YourPositionsWrapper />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
