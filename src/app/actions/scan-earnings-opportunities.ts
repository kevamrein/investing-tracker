'use server'

import config from '@/payload.config'
import { getPayload } from 'payload'
import getSession from './auth-utils'
import yahooFinance from 'yahoo-finance2'

// Ticker universe - 106 stocks (103 tech + 3 consumer cyclical)
// Expanded based on sector backtest analysis (Dec 2024)
const TICKER_UNIVERSE = [
  // Mega Cap Tech
  "AAPL", "MSFT", "GOOGL", "GOOG", "AMZN", "META", "NVDA", "TSLA", "AMD", "INTC",

  // Cloud/SaaS (expanded - similar to SNOW, OKTA winners)
  "NOW", "SNOW", "DDOG", "CRWD", "ZS", "OKTA", "NET", "DOCN", "S", "ESTC",
  "BILL", "DOMO", "MNDY", "CFLT", "GTLB", "PATH", "AI", "HUBS",

  // Cybersecurity (expanded - similar to ZS, CRWD winners)
  "PANW", "FTNT", "TENB", "RPD", "CYBR", "QLYS",

  // Enterprise Software
  "TEAM", "ATLX", "PD", "CRM", "ORCL", "WDAY", "VEEV", "TWLO",

  // Semiconductors
  "AVGO", "QCOM", "NXPI", "AMAT", "LRCX", "KLAC", "MRVL", "ON",
  "MU", "QRVO", "SWKS", "STM", "TXN", "ADI",

  // E-commerce & Payments
  "SHOP", "PYPL", "SQ", "DASH", "UBER", "LYFT",

  // Fintech/Crypto
  "COIN", "HOOD",

  // International Tech
  "BABA", "SE", "MELI",

  // Gaming/Consumer
  "RBLX", "U", "ROKU", "SNAP", "PINS", "SPOT",

  // Enterprise Hardware/Infrastructure
  "DELL", "HPQ", "SMCI", "PSTG", "WDC", "STX", "BOX", "DBX",

  // Software - Design/Productivity
  "ADBE", "INTU", "ANSS", "CDNS", "SNPS", "FIVN", "ZI", "ZM",

  // AdTech/Media
  "TTD", "NFLX", "DIS", "RNG",

  // Cloud Infrastructure
  "FSLY", "ANET",

  // Networking/Telecom
  "CSCO", "TMUS",

  // Software - Data/Analytics
  "PLTR", "MDB",

  // Semiconductor Equipment
  "MPWR",

  // Consumer Cyclical (high-growth, tech-like volatility)
  "NKE", "BKNG", "ETSY",
]

interface ScanOptions {
  mode: 'upcoming' | 'recent'
  daysAhead?: number  // For upcoming: look forward (default: 14 days)
  daysBack?: number   // For recent: look backward (default: 3 days - optimal entry window)
  minScore?: number
}

export async function scanEarningsOpportunities(options: ScanOptions) {
  const session = await getSession()
  if (!session?.user?.id) {
    return { success: false, message: 'User not authenticated' }
  }

  try {
    const payload = await getPayload({ config })
    const opportunities: any[] = []

    if (options.mode === 'recent') {
      // Scan for post-earnings opportunities (beat + drop pattern)
      // Default 3 days: Day 0 (earnings) + Day 1 (wait) + Day 2 (enter) = 3 day window
      const daysBack = options.daysBack || 3

      console.log(`Scanning ${TICKER_UNIVERSE.length} tickers for recent opportunities (last ${daysBack} days)...`)

      for (const ticker of TICKER_UNIVERSE) {
        try {
          const opportunity = await checkPostEarningsOpportunity(ticker, daysBack)

          if (opportunity && opportunity.score >= (options.minScore || 70)) {
            // Skip if entry window expired (>5 days old)
            if (opportunity.entryWindow === 'expired') {
              console.log(`⏭️  Skipping ${ticker}: Entry window expired (${opportunity.daysSinceEarnings} days old)`)
              continue
            }

            // Check if already exists
            const existing = await payload.find({
              collection: 'option-opportunities',
              where: {
                and: [
                  { ticker: { equals: ticker } },
                  { earningsDate: { equals: opportunity.earningsDate } },
                  { investor: { equals: parseInt(session.user.id) } },
                ],
              },
            })

            if (existing.docs.length === 0) {
              // Create new opportunity
              const created = await payload.create({
                collection: 'option-opportunities',
                draft: false,
                data: {
                  ...opportunity,
                  opportunityId: `${ticker}_${new Date(opportunity.earningsDate).getTime()}`,
                  investor: parseInt(session.user.id),
                  identifiedDate: new Date().toISOString(),
                  status: 'pending',
                },
              })
              opportunities.push(created)
              console.log(`✅ Found opportunity: ${ticker} (Score: ${opportunity.score})`)
            } else {
              console.log(`⏭️  Skipping ${ticker}: Already exists`)
            }
          }
        } catch (error) {
          console.error(`Error checking ${ticker}:`, error)
          // Continue with next ticker
        }
      }
    } else if (options.mode === 'upcoming') {
      // Scan for upcoming earnings dates (build watchlist)
      const daysAhead = options.daysAhead || 14

      console.log(`Scanning ${TICKER_UNIVERSE.length} tickers for upcoming earnings (next ${daysAhead} days)...`)

      // Note: This is informational only - opportunities are created after earnings drop
      // We'll return a preview list without creating records
      for (const ticker of TICKER_UNIVERSE) {
        try {
          const upcomingData = await getUpcomingEarnings(ticker, daysAhead)
          if (upcomingData) {
            opportunities.push(upcomingData)
          }
        } catch (error) {
          // Silent fail for individual tickers
        }
      }
    }

    console.log(`\nScan complete: Found ${opportunities.length} opportunities`)

    return {
      success: true,
      opportunities,
      count: opportunities.length,
      mode: options.mode,
    }
  } catch (error: any) {
    console.error('Error scanning opportunities:', error)
    return { success: false, message: error.message }
  }
}

async function checkPostEarningsOpportunity(ticker: string, daysBack: number) {
  try {
    // Get quote data with earnings information
    const quote = await yahooFinance.quoteSummary(ticker, {
      modules: ['earnings', 'price', 'summaryDetail', 'defaultKeyStatistics', 'summaryProfile'],
    }) as any

    // Get price history
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysBack - 10) // Extra buffer for pre-earnings

    const history = await yahooFinance.historical(ticker, {
      period1: startDate,
      period2: endDate,
      interval: '1d',
    }) as any[]

    if (!history || history.length < 5) return null // Need enough data

    // Check for recent earnings
    const earningsData = quote.earnings?.earningsChart?.quarterly?.[0]
    if (!earningsData || !earningsData.date) return null

    const earningsDate = new Date(earningsData.date)
    const daysSinceEarnings = Math.floor((endDate.getTime() - earningsDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceEarnings < 0 || daysSinceEarnings > daysBack) {
      return null // Earnings not in our scan window
    }

    // Check for EPS beat
    const reportedEps = earningsData.actual
    const estimatedEps = earningsData.estimate

    if (!reportedEps || !estimatedEps || reportedEps <= estimatedEps) {
      return null // Didn't beat
    }

    const epsBeatPct = ((reportedEps - estimatedEps) / Math.abs(estimatedEps)) * 100

    // Calculate price drop
    const prePrices = history.filter(h => new Date(h.date) < earningsDate)
    const postPrices = history.filter(h => new Date(h.date) > earningsDate)

    if (prePrices.length === 0 || postPrices.length === 0) return null

    const prePrice = prePrices[prePrices.length - 1].close
    const postPrice = postPrices[0].close
    const dropPct = ((postPrice - prePrice) / prePrice) * 100

    if (dropPct > -10.0) return null // Didn't drop enough (minimum 10% based on backtest data)

    // Calculate score (from Python scoring logic)
    const score = await calculateOpportunityScore({
      dropPct,
      epsBeatPct,
      marketCap: quote.price?.marketCap || 0,
      sector: quote.summaryProfile?.sector || 'Other',
    })

    // Calculate Day 1 price action and entry status (daysSinceEarnings already calculated above)
    let day1Change = null
    let entryStatus = 'pending'
    let entryWindow = 'optimal' // optimal, late, expired

    if (daysSinceEarnings >= 1) {
      // Check Day 1 price action
      const day1Prices = postPrices.filter(h => {
        const daysSince = Math.floor((new Date(h.date).getTime() - earningsDate.getTime()) / (1000 * 60 * 60 * 24))
        return daysSince === 1
      })

      if (day1Prices.length > 0) {
        const day1Price = day1Prices[0].close
        day1Change = ((day1Price - postPrice) / postPrice) * 100

        // Apply Day 1 filter rule
        if (day1Change < -5.0) {
          entryStatus = 'skip' // Stock continued dropping >5% on Day 1
        } else {
          entryStatus = 'ready' // Stock was stable/bounced
        }
      }
    }

    // Determine entry window
    if (daysSinceEarnings === 0) {
      entryWindow = 'wait_day1' // Wait for Day 1 close
    } else if (daysSinceEarnings <= 3) {
      entryWindow = 'optimal' // Best entry window (Day 1-3)
    } else if (daysSinceEarnings <= 5) {
      entryWindow = 'late' // Can still enter but theta decay starting
    } else {
      entryWindow = 'expired' // Too late, skip
    }

    return {
      ticker,
      companyName: quote.price?.shortName || ticker,
      earningsDate: earningsDate.toISOString(),
      dropPct,
      epsBeatPct,
      score,
      preEarningsPrice: prePrice,
      postEarningsPrice: postPrice,
      currentPrice: quote.price?.regularMarketPrice || postPrice,
      marketCap: quote.price?.marketCap,
      sector: mapSector(quote.summaryProfile?.sector || 'Other'),
      daysSinceEarnings,
      day1Change,
      entryStatus, // 'pending', 'ready', 'skip'
      entryWindow, // 'wait_day1', 'optimal', 'late', 'expired'
    }
  } catch (error) {
    // Silent fail - ticker might not have data
    return null
  }
}

async function getUpcomingEarnings(ticker: string, daysAhead: number) {
  try {
    const quote = await yahooFinance.quoteSummary(ticker, {
      modules: ['calendarEvents', 'price', 'summaryProfile'],
    }) as any

    const earningsDate = quote.calendarEvents?.earnings?.earningsDate?.[0]
    if (!earningsDate) return null

    const daysUntil = Math.floor((new Date(earningsDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

    if (daysUntil < 0 || daysUntil > daysAhead) return null

    return {
      ticker,
      companyName: quote.price?.shortName || ticker,
      earningsDate: new Date(earningsDate).toISOString(),
      daysUntil,
      currentPrice: quote.price?.regularMarketPrice,
      marketCap: quote.price?.marketCap,
      sector: mapSector(quote.summaryProfile?.sector || 'Other'),
    }
  } catch (error) {
    return null
  }
}

async function calculateOpportunityScore(params: {
  dropPct: number
  epsBeatPct: number
  marketCap: number
  sector: string
}): Promise<number> {
  let score = 0

  // Drop Size (30 points) - Based on backtest data showing 10-15% drops have best win rate
  // Research: 10-15% drops = 60% win rate, <10% = strong (limited sample), 15-25% = 38%, >25% = 25%
  const absDropPct = Math.abs(params.dropPct)
  if (absDropPct >= 10 && absDropPct <= 15) {
    score += 30 // Sweet spot: 10-15% drops (60% win rate)
  } else if (absDropPct < 10) {
    score += 25 // Small drops still good (but less data)
  } else if (absDropPct > 15 && absDropPct <= 25) {
    score += 15 // Larger drops riskier (38% win rate)
  } else {
    score += 5 // Very large drops (>25%) have lowest win rate (25%)
  }

  // EPS Beat Size (25 points)
  if (params.epsBeatPct > 15) score += 25
  else if (params.epsBeatPct > 10) score += 20
  else if (params.epsBeatPct > 5) score += 10
  else score += 5

  // Market Cap (20 points)
  if (params.marketCap > 500_000_000_000) score += 20 // $500B+
  else if (params.marketCap > 100_000_000_000) score += 15 // $100-500B
  else if (params.marketCap > 10_000_000_000) score += 10 // $10-100B
  else score += 5 // <$10B

  // Sector (15 points)
  if (params.sector === 'technology' || params.sector === 'communication') {
    score += 15
  } else if (params.sector === 'healthcare') {
    score += 10
  } else {
    score += 5
  }

  // Market Regime (10 points) - Based on SPY 1-month momentum
  try {
    const spy = yahooFinance.historical('SPY', {
      period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      period2: new Date().toISOString().split('T')[0],
    })

    const spyData = (await spy) as any[]
    if (spyData && spyData.length >= 2) {
      const firstClose = spyData[0].close
      const lastClose = spyData[spyData.length - 1].close
      const spyReturn = ((lastClose - firstClose) / firstClose) * 100

      if (spyReturn > 5) {
        score += 10 // Strong uptrend
      } else if (spyReturn > 0) {
        score += 7 // Mild uptrend
      } else if (spyReturn > -5) {
        score += 3 // Mild downtrend
      }
      // else: score += 0 (strong downtrend)
    } else {
      // Fallback if SPY data unavailable
      score += 5
    }
  } catch (error) {
    console.error('Error fetching SPY data for market regime:', error)
    // Fallback to neutral score if error
    score += 5
  }

  return Math.min(score, 100)
}

function mapSector(yahooSector: string): 'technology' | 'communication' | 'healthcare' | 'financial' | 'consumer' | 'other' {
  const lower = yahooSector.toLowerCase()

  if (lower.includes('technology') || lower.includes('software') || lower.includes('computer')) {
    return 'technology'
  } else if (lower.includes('communication')) {
    return 'communication'
  } else if (lower.includes('healthcare') || lower.includes('health')) {
    return 'healthcare'
  } else if (lower.includes('financial')) {
    return 'financial'
  } else if (lower.includes('consumer')) {
    return 'consumer'
  }

  return 'other'
}
