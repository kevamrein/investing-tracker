'use server'

import { checkPostEarningsOpportunity, OpportunityCheckResult } from './scan-earnings-opportunities'

interface LookupResult {
  success: boolean
  opportunity?: any
  error?: {
    type: 'invalid_ticker' | 'not_found' | 'no_earnings' | 'no_beat' | 'no_drop' | 'api_error'
    message: string
    details?: any
  }
}

export async function lookupTickerOpportunity(ticker: string): Promise<LookupResult> {
  try {
    // Input validation
    const trimmedTicker = ticker.trim().toUpperCase()

    if (!trimmedTicker) {
      return {
        success: false,
        error: {
          type: 'invalid_ticker',
          message: 'Please enter a ticker symbol',
        },
      }
    }

    if (trimmedTicker.length > 5) {
      return {
        success: false,
        error: {
          type: 'invalid_ticker',
          message: `"${trimmedTicker}" is not a valid ticker symbol. Tickers should be 1-5 letters only (e.g., AAPL, NVDA).`,
        },
      }
    }

    if (!/^[A-Z]+$/.test(trimmedTicker)) {
      return {
        success: false,
        error: {
          type: 'invalid_ticker',
          message: `"${trimmedTicker}" is not a valid ticker symbol. Tickers should only contain letters.`,
        },
      }
    }

    // Check if opportunity exists with detailed rejection info
    const result = await checkPostEarningsOpportunity(trimmedTicker, 10, true) as OpportunityCheckResult

    if (result.success && result.opportunity) {
      // Success! Found a qualifying opportunity
      return {
        success: true,
        opportunity: result.opportunity,
      }
    }

    // No opportunity found - return the detailed rejection reason
    if (result.rejection) {
      // Map rejection type to error type
      let errorType: 'no_earnings' | 'no_beat' | 'no_drop' | 'api_error' = 'no_earnings'
      if (result.rejection.type === 'no_beat') {
        errorType = 'no_beat'
      } else if (result.rejection.type === 'no_drop') {
        errorType = 'no_drop'
      } else if (result.rejection.type === 'no_data') {
        errorType = 'api_error'
      }

      return {
        success: false,
        error: {
          type: errorType,
          message: result.rejection.message,
          details: result.rejection.details,
        },
      }
    }

    // Fallback (shouldn't happen)
    return {
      success: false,
      error: {
        type: 'no_earnings',
        message: `${trimmedTicker} doesn't have a qualifying opportunity.`,
        details: { ticker: trimmedTicker },
      },
    }
  } catch (error: any) {
    console.error('Error in lookupTickerOpportunity:', error)

    // Check for rate limiting
    if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
      return {
        success: false,
        error: {
          type: 'api_error',
          message: 'Yahoo Finance rate limit reached. Please wait a moment and try again.',
          details: 'Too many requests - try again in 30-60 seconds.',
        },
      }
    }

    return {
      success: false,
      error: {
        type: 'api_error',
        message: 'Unable to fetch data. Please try again in a moment.',
        details: error.message,
      },
    }
  }
}
