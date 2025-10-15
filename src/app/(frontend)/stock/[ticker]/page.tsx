import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Header } from '@/app/(frontend)/components/Header'
import Link from 'next/link'
import { AskQuestionModal } from '@/components/AskQuestionModal'

interface StockPageProps {
  params: Promise<{
    ticker: string
  }>
}

export default async function StockPage({ params }: StockPageProps) {
  const { ticker } = await params

  const payload = await getPayload({ config })
  const session = await getServerSession(authOptions)

  const investorId = session?.user?.id
  if (!investorId) {
    redirect('/login')
  }

  const companies = await payload.find({
    collection: 'company',
    where: {
      ticker: {
        equals: ticker.toUpperCase(),
      },
    },
    limit: 1,
  })

  if (!companies.docs.length) {
    notFound()
  }

  const company = companies.docs[0]
  const latestBullCase = company.bullCase?.[company.bullCase.length - 1]
  const latestBearCase = company.bearCase?.[company.bearCase.length - 1]

  // Get investment recommendations for this company
  const recommendations = await payload.find({
    collection: 'investmentRecommendation',
    where: {
      company: {
        equals: company.id,
      },
      investor: {
        equals: investorId,
      },
    },
    sort: '-recommendationDate',
    limit: 5,
  })

  // Get transaction history for this company
  const transactions = await payload.find({
    collection: 'investment',
    where: {
      company: {
        equals: company.id,
      },
      investorMapping: {
        equals: investorId,
      },
    },
    sort: '-investmentDate',
  })

  const marketSentiment = {
    bull: latestBullCase ? [latestBullCase.opinionText] : [],
    bear: latestBearCase ? [latestBearCase.opinionText] : [],
  }

  const recommendationHistory = recommendations.docs.map((rec) => ({
    date: new Date(rec.recommendationDate).toLocaleDateString(),
    recommendation: rec.buySellHoldRecommendation,
    details: rec.recommendationReasoning,
  }))

  const transactionHistory = transactions.docs.map((txn) => ({
    type: txn.transactionType,
    shares: txn.shares,
    date: new Date(txn.investmentDate).toLocaleDateString(),
    amount: (txn.shares * txn.pricePerShare).toFixed(2),
    price: txn.pricePerShare.toFixed(2),
    accountType: txn.accountType || 'taxable',
  }))

  const latestAnalysis = {
    recommendation:
      recommendations.docs[0]?.recommendationReasoning || 'No recent analysis available',
    bullPoints: marketSentiment.bull,
    bearPoints: marketSentiment.bear,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-card/60 backdrop-blur-sm rounded-2xl px-6 py-3 border border-border/50 shadow-lg mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-foreground">{company.name}</h1>
              <p className="text-sm text-muted-foreground font-medium">{company.ticker}</p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
            {company.description || 'Investment opportunity analysis and insights'}
          </p>
        </div>

        {/* Metrics Cards */}
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">Price Target</h3>
            </div>
            <p className="text-2xl font-bold text-primary">
              ${company.priceTarget?.toFixed(2) || 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground font-light mt-1">Analyst target price</p>
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">Recommendation Date</h3>
            </div>
            <p className="text-lg font-semibold text-card-foreground">
              {new Date(company.recommendationDate).toLocaleDateString()}
            </p>
            <p className="text-sm text-muted-foreground font-light mt-1">Latest analysis date</p>
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">Timeframe</h3>
            </div>
            <p className="text-lg font-semibold text-card-foreground">
              {company.timeframe || 'Not specified'}
            </p>
            <p className="text-sm text-muted-foreground font-light mt-1">Investment horizon</p>
          </div>
        </div>

        {/* Investment Insights Card */}
        <div className="bg-card/60 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-border/50 mb-8">
          {/* Latest Analysis */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-card-foreground mb-4">Latest Analysis</h3>
            <p className="text-card-foreground p-6 bg-secondary/50 rounded-xl border border-border/30 font-medium leading-relaxed">
              {latestAnalysis.recommendation}
            </p>
          </div>

          {/* Key Points Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Bull Case Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-accent rounded-full"></div>
                <h3 className="text-lg font-semibold text-card-foreground">Bullish Factors</h3>
              </div>
              <div className="p-6 rounded-xl bg-accent/5 border border-accent/20">
                <ul className="space-y-3">
                  {marketSentiment.bull.map((point, index) => (
                    <li key={index} className="text-card-foreground font-medium">
                      <div className="flex items-start">
                        <span className="text-accent mr-3 mt-1 text-lg">▲</span>
                        <p className="leading-relaxed">{point}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bear Case Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-destructive rounded-full"></div>
                <h3 className="text-lg font-semibold text-card-foreground">Bearish Factors</h3>
              </div>
              <div className="p-6 rounded-xl bg-destructive/5 border border-destructive/20">
                <ul className="space-y-3">
                  {marketSentiment.bear.map((point, index) => (
                    <li key={index} className="text-card-foreground font-medium">
                      <div className="flex items-start">
                        <span className="text-destructive mr-3 mt-1 text-lg">▼</span>
                        <p className="leading-relaxed">{point}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* AI Company Assistant Feature */}
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
              <h2 className="text-2xl font-bold text-foreground mb-2">AI Company Assistant</h2>
              <p className="text-muted-foreground font-medium mb-6 max-w-md mx-auto">
                Ask questions about {company.name} and get personalized insights that take into
                account your current transactions and portfolio position
              </p>
              <AskQuestionModal ticker={ticker} companyName={company.name} />
            </div>
          </div>
        </div>

        {/* Recommendation History Card */}
        <div className="bg-card/60 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-border/50 mb-8">
          <h2 className="text-xl font-bold mb-6 text-card-foreground">Recommendation History</h2>
          <div className="space-y-4">
            {recommendationHistory.map((rec, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-muted/50 border border-border/30 hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">{rec.date}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      rec.recommendation === 'buy'
                        ? 'bg-accent text-accent-foreground'
                        : rec.recommendation === 'sell'
                          ? 'bg-destructive text-destructive-foreground'
                          : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {rec.recommendation.toUpperCase()}
                  </span>
                </div>
                <p className="text-card-foreground font-medium leading-relaxed">{rec.details}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction History Card */}
        <div className="bg-card/60 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-border/50">
          <h2 className="text-xl font-bold mb-6 text-card-foreground">Transaction History</h2>
          <div className="space-y-4">
            {transactionHistory.map((txn, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-muted/50 border border-border/30 hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">{txn.date}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      txn.type === 'buy'
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-destructive text-destructive-foreground'
                    }`}
                  >
                    {txn.type.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span className="font-medium">{txn.shares} shares</span>
                  <span className="font-medium">
                    ${txn.amount} @ ${txn.price}/share
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Account Type: <span className="font-semibold capitalize">{txn.accountType}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
