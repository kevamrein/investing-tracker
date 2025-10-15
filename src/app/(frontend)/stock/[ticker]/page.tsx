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
    <div className="min-h-screen bg-background">
      <Header />
      <div className="p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </Link>

          {/* Header Card */}
          <div className="bg-card rounded-xl shadow-sm p-6 border">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <h1 className="text-2xl font-extrabold text-card-foreground">{company.name}</h1>
                  <AskQuestionModal ticker={ticker} companyName={company.name} />
                </div>
                <span className="text-sm font-medium px-3 py-1 rounded-full bg-muted text-muted-foreground">
                  {ticker.toUpperCase()}
                </span>
              </div>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground font-light">Current Price</div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-semibold">
                        ${company.currentPrice?.toFixed(2) || 'N/A'}
                      </span>
                      {/* Temporarily removed YTD return display until we have reliable data
                      <span
                        className={`px-2 py-1 rounded-lg text-sm font-medium ${
                          company.ytdReturn && company.ytdReturn > 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        ({company.ytdReturn?.toFixed(2) || 0}%)
                      </span>
                      */}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground font-light">Price Target</div>
                    <div className="text-lg font-medium">
                      ${company.priceTarget?.toFixed(2) || 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground font-light">
                      Initial Recommendation Date
                    </div>
                    <div className="text-base">
                      {new Date(company.recommendationDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground font-light">
                      Investment Timeframe
                    </div>
                    <div className="text-base">{company.timeframe || 'Not specified'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Investment Insights Card */}
          <div className="bg-card rounded-xl shadow-sm p-6 border">
            {/* Latest Analysis */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-muted-foreground mb-3">Latest Analysis</h3>
              <p className="text-sm text-card-foreground p-4 bg-secondary rounded-lg border">
                {latestAnalysis.recommendation}
              </p>
            </div>

            {/* Key Points Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Bull Case Column */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-accent rounded-full"></div>
                  <h3 className="font-medium text-card-foreground">Bullish Factors</h3>
                </div>
                <div className="p-4 rounded-lg bg-accent/10 border">
                  <ul className="space-y-3">
                    {marketSentiment.bull.map((point, index) => (
                      <li key={index} className="text-sm text-card-foreground">
                        <div className="flex items-start">
                          <span className="text-accent mr-2 mt-1">▲</span>
                          <p>{point}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bear Case Column */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-destructive rounded-full"></div>
                  <h3 className="font-medium text-card-foreground">Bearish Factors</h3>
                </div>
                <div className="p-4 rounded-lg bg-destructive/10 border">
                  <ul className="space-y-3">
                    {marketSentiment.bear.map((point, index) => (
                      <li key={index} className="text-sm text-card-foreground">
                        <div className="flex items-start">
                          <span className="text-destructive mr-2 mt-1">▼</span>
                          <p>{point}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation History Card */}
          <div className="bg-card rounded-xl shadow-sm p-6 border">
            <h2 className="text-lg font-semibold mb-4 text-card-foreground">
              Recommendation History
            </h2>
            <div className="space-y-3">
              {recommendationHistory.map((rec, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">{rec.date}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                  <p className="text-sm text-muted-foreground">{rec.details}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction History Card */}
          <div className="bg-card rounded-xl shadow-sm p-6 border">
            <h2 className="text-lg font-semibold mb-4 text-card-foreground">Transaction History</h2>
            <div className="space-y-3">
              {transactionHistory.map((txn, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">{txn.date}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        txn.type === 'buy'
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-destructive text-destructive-foreground'
                      }`}
                    >
                      {txn.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{txn.shares} shares</span>
                    <span>
                      ${txn.amount} @ ${txn.price}/share
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Account Type: <span className="font-medium capitalize">{txn.accountType}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
