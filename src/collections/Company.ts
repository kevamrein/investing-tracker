import { CollectionConfig } from 'payload'
import { generateStockInformation } from '@/ai/ai-service'

export const Company: CollectionConfig = {
  slug: 'company',
  admin: {
    useAsTitle: 'name',
    group: 'Test Group',
  },
  hooks: {
    beforeChange: [
      async ({ data }) => {
        if (!data.ticker) {
          return data
        }

        const response = await generateStockInformation({ ticker: data.ticker })
        const date = new Date()
        data.bullCase.push({
          opinionText: response.bullCase,
          opinionDate: date,
        })
        data.bearCase.push({
          opinionText: response.bearCase,
          opinionDate: date,
        })

        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      required: true,
    },
    {
      name: 'ticker',
      label: 'Ticker',
      type: 'text',
      required: true,
    },
    {
      name: 'recommendationDate',
      label: 'Recommendation Date',
      type: 'date',
      required: true,
    },
    {
      name: 'bullCase',
      label: 'Bull Case',
      type: 'array',
      fields: [
        {
          name: 'opinionText',
          label: 'Text',
          type: 'text',
          required: true,
        },
        {
          name: 'opinionDate',
          label: 'Date',
          type: 'date',
          required: true,
        },
      ],
    },
    {
      name: 'bearCase',
      label: 'Bear Case',
      type: 'array',
      fields: [
        {
          name: 'opinionText',
          label: 'Text',
          type: 'text',
          required: true,
        },
        {
          name: 'opinionDate',
          label: 'Date',
          type: 'date',
          required: true,
        },
      ],
    },
    {
      name: 'priceTarget',
      label: 'Price Target',
      type: 'number',
    },
    {
      name: 'currentPrice',
      label: 'Current Price',
      type: 'number',
    },
    {
      name: 'timeframe',
      label: 'Timeframe',
      type: 'text',
    },
    {
      name: 'ytdReturn',
      label: 'YTD Return',
      type: 'number',
    },
    {
      name: 'weekToDateReturn',
      label: 'Week to Date Return',
      type: 'number',
    },
    {
      name: 'oneYearReturn',
      label: 'One Year Return',
      type: 'number',
    },
  ],
}
