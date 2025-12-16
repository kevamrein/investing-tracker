import { CollectionConfig } from 'payload'

export const OptionPaperTrade: CollectionConfig = {
  slug: 'option-paper-trades',
  admin: {
    useAsTitle: 'displayTitle',
    defaultColumns: ['displayTitle', 'ticker', 'status', 'pnlPercent', 'entryDate'],
    group: 'Options Trading',
  },
  access: {
    // Multi-user: investors see only their trades
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.collection === 'users') return true // Admin access
      return {
        investor: {
          equals: user.id,
        },
      }
    },
    create: ({ req: { user } }) => {
      if (!user) return false
      return user.collection === 'users' || user.collection === 'investors'
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.collection === 'users') return true
      return {
        investor: {
          equals: user.id,
        },
      }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.collection === 'users') return true
      return {
        investor: {
          equals: user.id,
        },
      }
    },
  },
  fields: [
    // Identification
    {
      name: 'tradeId',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ data, operation }) => {
            if (operation === 'create' && !data?.tradeId) {
              return `TRADE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }
            return data?.tradeId
          },
        ],
      },
    },
    {
      name: 'ticker',
      label: 'Ticker Symbol',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Stock ticker symbol',
      },
    },

    // Relationships
    {
      name: 'investor',
      label: 'Investor',
      type: 'relationship',
      relationTo: 'investors',
      required: true,
      index: true,
      admin: {
        description: 'Investor who owns this trade',
      },
    },
    {
      name: 'opportunity',
      label: 'Related Opportunity',
      type: 'relationship',
      relationTo: 'option-opportunities',
      admin: {
        description: 'Link to the opportunity that triggered this trade',
      },
    },

    // Opportunity Context (denormalized for reporting)
    {
      name: 'earningsDate',
      label: 'Earnings Date',
      type: 'date',
      required: true,
      admin: {
        description: 'Original earnings date',
      },
    },
    {
      name: 'identifiedDate',
      label: 'Identified Date',
      type: 'date',
      required: true,
      admin: {
        description: 'When opportunity was identified',
      },
    },
    {
      name: 'dropPct',
      label: 'Drop Percentage',
      type: 'number',
      required: true,
      admin: {
        description: 'Post-earnings price drop %',
      },
    },
    {
      name: 'epsBeatPct',
      label: 'EPS Beat Percentage',
      type: 'number',
      required: true,
      admin: {
        description: 'EPS beat magnitude %',
      },
    },
    {
      name: 'score',
      label: 'Opportunity Score',
      type: 'number',
      required: true,
      admin: {
        description: 'Original opportunity score (0-100)',
      },
    },

    // Entry Details
    {
      name: 'entryDate',
      label: 'Entry Date',
      type: 'date',
      index: true,
      admin: {
        description: 'When position was entered',
        date: {
          displayFormat: 'MMM dd, yyyy HH:mm',
        },
      },
    },
    {
      name: 'stockPriceAtEntry',
      label: 'Stock Price at Entry',
      type: 'number',
      admin: {
        description: 'Stock price when entering position',
      },
    },
    {
      name: 'strikePrice',
      label: 'Strike Price',
      type: 'number',
      admin: {
        description: 'ATM strike price of call option',
      },
    },
    {
      name: 'entryPremium',
      label: 'Entry Premium',
      type: 'number',
      admin: {
        description: 'Premium paid per contract (e.g., $3.80)',
      },
    },
    {
      name: 'contracts',
      label: 'Number of Contracts',
      type: 'number',
      required: true,
      defaultValue: 1,
      min: 1,
      admin: {
        description: 'Number of option contracts (each = 100 shares)',
      },
    },
    {
      name: 'dteAtEntry',
      label: 'DTE at Entry',
      type: 'number',
      admin: {
        description: 'Days to expiration when entered (typically 30-45)',
      },
    },

    // Exit Details
    {
      name: 'exitDate',
      label: 'Exit Date',
      type: 'date',
      admin: {
        description: 'When position was closed',
        date: {
          displayFormat: 'MMM dd, yyyy HH:mm',
        },
      },
    },
    {
      name: 'stockPriceAtExit',
      label: 'Stock Price at Exit',
      type: 'number',
      admin: {
        description: 'Stock price when closing position',
      },
    },
    {
      name: 'exitPremium',
      label: 'Exit Premium',
      type: 'number',
      admin: {
        description: 'Premium received per contract when selling',
      },
    },
    {
      name: 'exitReason',
      label: 'Exit Reason',
      type: 'select',
      options: [
        { label: 'Profit Target (+50%)', value: 'profit_target' },
        { label: 'Stop Loss (-30%)', value: 'stop_loss' },
        { label: 'Time Stop (Max DTE)', value: 'time_stop' },
        { label: 'Day 1 Circuit Breaker (-10%)', value: 'day1_circuit_breaker' },
        { label: 'Manual Exit', value: 'manual' },
      ],
      admin: {
        description: 'Why was this position closed?',
      },
    },

    // Position Tracking
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending Entry', value: 'pending' },
        { label: 'Open Position', value: 'open' },
        { label: 'Closed', value: 'closed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      index: true,
      admin: {
        description: 'Current position status',
      },
    },
    {
      name: 'positionSizePct',
      label: 'Position Size %',
      type: 'number',
      defaultValue: 2.0,
      admin: {
        description: 'Percentage of account allocated (e.g., 2.0 = 2%)',
      },
    },

    // Performance Metrics (auto-calculated via hooks)
    {
      name: 'pnlDollars',
      label: 'P&L (Dollars)',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Calculated: (exitPremium - entryPremium) * contracts * 100',
      },
    },
    {
      name: 'pnlPercent',
      label: 'P&L (Percent)',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Calculated: ((exitPremium - entryPremium) / entryPremium) * 100',
      },
    },
    {
      name: 'holdingDays',
      label: 'Holding Days',
      type: 'number',
      admin: {
        readOnly: true,
        description: 'Days between entry and exit',
      },
    },

    // Strategy & Notes
    {
      name: 'strategy',
      label: 'Strategy',
      type: 'text',
      defaultValue: 'beat_drop_recovery',
      admin: {
        readOnly: true,
        description: 'Trading strategy name',
      },
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      admin: {
        description: 'Trade notes and observations',
      },
    },

    // Display title
    {
      name: 'displayTitle',
      type: 'text',
      admin: {
        hidden: true,
      },
      hooks: {
        afterRead: [
          ({ data }) => {
            if (!data) return 'No data'

            let statusEmoji = '⏳'
            if (data.status === 'open') statusEmoji = '🔓'
            else if (data.status === 'closed') {
              statusEmoji = data.pnlPercent && data.pnlPercent > 0 ? '✅' : '❌'
            }
            else if (data.status === 'cancelled') statusEmoji = '🚫'

            const pnl = data.pnlPercent
              ? `${data.pnlPercent > 0 ? '+' : ''}${data.pnlPercent.toFixed(1)}%`
              : 'N/A'

            return `${statusEmoji} ${data.ticker} - ${data.status.toUpperCase()} (${pnl})`
          },
        ],
      },
    },
  ],
  hooks: {
    // Auto-calculate P&L when trade is closed
    beforeChange: [
      ({ data, operation }) => {
        if (data.status === 'closed' && data.entryPremium && data.exitPremium) {
          // Calculate P&L dollars
          data.pnlDollars = (data.exitPremium - data.entryPremium) * (data.contracts || 1) * 100

          // Calculate P&L percent
          data.pnlPercent = ((data.exitPremium - data.entryPremium) / data.entryPremium) * 100

          // Calculate holding days
          if (data.entryDate && data.exitDate) {
            const entry = new Date(data.entryDate)
            const exit = new Date(data.exitDate)
            data.holdingDays = Math.floor((exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24))
          }
        }
        return data
      },
    ],
  },
}
