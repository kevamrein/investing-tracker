import { CollectionConfig } from 'payload'

export const InvestmentRecommendation: CollectionConfig = {
  slug: 'investmentRecommendation',
  fields: [
    {
      name: 'investor',
      label: 'Investor',
      type: 'relationship',
      relationTo: 'investors',
      required: true,
    },
    {
      name: 'company',
      label: 'Company',
      type: 'relationship',
      relationTo: 'company',
      required: true,
    },
    {
      name: 'recommendationDate',
      label: 'Recommendation Date',
      type: 'date',
      required: true,
    },
    {
      name: 'buySellHoldRecommendation',
      label: 'Buy/Sell/Hold Recommendation',
      type: 'select',
      options: [
        { label: 'Buy', value: 'buy' },
        { label: 'Sell', value: 'sell' },
        { label: 'Hold', value: 'hold' },
      ],
      required: true,
    },
    {
      name: 'recommendationReasoning',
      label: 'Recommendation Reasoning',
      type: 'textarea',
      required: true,
    },
  ],
}
