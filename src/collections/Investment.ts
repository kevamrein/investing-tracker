import { CollectionConfig } from 'payload'

export const Investment: CollectionConfig = {
  slug: 'investment',
  admin: {
    useAsTitle: 'displayTitle',
  },
  fields: [
    {
      name: 'accountType',
      label: 'Account Type',
      type: 'select',
      options: [
        { label: 'Taxable', value: 'taxable' },
        { label: 'IRA', value: 'ira' },
      ],
      required: true,
      defaultValue: 'taxable',
    },
    {
      name: 'investor',
      label: 'Investor',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'investorMapping',
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
      name: 'transactionType',
      label: 'Transaction Type',
      type: 'select',
      options: [
        { label: 'Buy', value: 'buy' },
        { label: 'Sell', value: 'sell' },
      ],
      required: true,
    },
    {
      name: 'investmentDate',
      label: 'Investment Date',
      type: 'date',
      required: true,
    },
    {
      name: 'shares',
      label: 'Shares',
      type: 'number',
      required: true,
    },
    {
      name: 'pricePerShare',
      label: 'Price Per Share',
      type: 'number',
      required: true,
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
    },
    {
      name: 'displayTitle',
      type: 'text',
      hidden: true,
      hooks: {
        afterRead: [
          async ({ data, req }) => {
            if (!data) return 'No data'

            const company = await req.payload.findByID({
              collection: 'company',
              id: data.company,
            })

            const investmentDate = new Date(data.investmentDate)
            const date = `${investmentDate.getMonth() + 1}/${investmentDate.getDate()}/${investmentDate.getFullYear()}`
            return `${company.name}: ${date}`
          },
        ],
      },
    },
  ],
}
