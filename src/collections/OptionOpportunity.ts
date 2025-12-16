import { CollectionConfig } from 'payload'

export const OptionOpportunity: CollectionConfig = {
  slug: 'option-opportunities',
  admin: {
    useAsTitle: 'displayTitle',
    defaultColumns: ['displayTitle', 'ticker', 'earningsDate', 'score', 'status'],
    group: 'Options Trading',
  },
  access: {
    // Multi-user: investors see only their own opportunities
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
      name: 'opportunityId',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          ({ data, operation }) => {
            if (operation === 'create' && !data?.opportunityId) {
              return `${data.ticker}_${new Date(data.earningsDate).getTime()}`
            }
            return data?.opportunityId
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
        description: 'Stock ticker symbol (e.g., SNOW, OKTA, ZS)',
      },
    },
    {
      name: 'companyName',
      label: 'Company Name',
      type: 'text',
      admin: {
        description: 'Full company name',
      },
    },

    // Investor relationship (multi-user support)
    {
      name: 'investor',
      label: 'Investor',
      type: 'relationship',
      relationTo: 'investors',
      required: true,
      index: true,
      admin: {
        description: 'Investor who owns this opportunity',
      },
    },

    // Earnings Event Details
    {
      name: 'earningsDate',
      label: 'Earnings Date',
      type: 'date',
      required: true,
      index: true,
      admin: {
        description: 'Date of earnings announcement',
        date: {
          displayFormat: 'MMM dd, yyyy',
        },
      },
    },
    {
      name: 'identifiedDate',
      label: 'Identified Date',
      type: 'date',
      required: true,
      admin: {
        description: 'When this opportunity was found by scanner',
        date: {
          displayFormat: 'MMM dd, yyyy HH:mm',
        },
      },
    },

    // Scoring Components (from Python model)
    {
      name: 'dropPct',
      label: 'Drop Percentage',
      type: 'number',
      required: true,
      admin: {
        description: 'Post-earnings price drop percentage (e.g., -14.7)',
      },
    },
    {
      name: 'epsBeatPct',
      label: 'EPS Beat Percentage',
      type: 'number',
      required: true,
      admin: {
        description: 'How much earnings beat estimates (e.g., +12.5)',
      },
    },
    {
      name: 'score',
      label: 'Opportunity Score',
      type: 'number',
      required: true,
      min: 0,
      max: 100,
      index: true,
      admin: {
        description: 'Composite score (0-100). 85+ = Strong trade signal, 70-84 = Consider',
      },
    },

    // Market Data
    {
      name: 'preEarningsPrice',
      label: 'Pre-Earnings Price',
      type: 'number',
      admin: {
        description: 'Stock price before earnings',
      },
    },
    {
      name: 'postEarningsPrice',
      label: 'Post-Earnings Price',
      type: 'number',
      admin: {
        description: 'Stock price after earnings drop',
      },
    },
    {
      name: 'currentPrice',
      label: 'Current Price',
      type: 'number',
      admin: {
        description: 'Latest stock price',
      },
    },
    {
      name: 'marketCap',
      label: 'Market Cap',
      type: 'number',
      admin: {
        description: 'Market capitalization in dollars',
      },
    },
    {
      name: 'sector',
      label: 'Sector',
      type: 'select',
      options: [
        { label: 'Technology', value: 'technology' },
        { label: 'Communication Services', value: 'communication' },
        { label: 'Healthcare', value: 'healthcare' },
        { label: 'Financial Services', value: 'financial' },
        { label: 'Consumer Cyclical', value: 'consumer' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'Stock sector (Tech preferred for this strategy)',
      },
    },

    // Status Tracking
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending Review', value: 'pending' },
        { label: 'Traded', value: 'traded' },
        { label: 'Dismissed', value: 'dismissed' },
        { label: 'Expired', value: 'expired' },
      ],
      index: true,
      admin: {
        description: 'Opportunity lifecycle status',
      },
    },

    // Strategy
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

    // Notes
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      admin: {
        description: 'Additional notes or observations',
      },
    },

    // Auto-computed display title
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
            const earningsDate = new Date(data.earningsDate)
            const date = earningsDate.toLocaleDateString()
            const scoreEmoji = data.score >= 85 ? '🟢' : data.score >= 70 ? '🟡' : '🔴'
            return `${scoreEmoji} ${data.ticker} - ${date} (Score: ${data.score})`
          },
        ],
      },
    },
  ],
}
