import { CollectionConfig } from 'payload'

export const Investment: CollectionConfig = {
  slug: 'investment',
  admin: {
    useAsTitle: 'displayTitle',
    group: 'Test Group',
  },
  fields: [
    {
      name: 'company',
      label: 'Company',
      type: 'relationship',
      relationTo: 'company',
    },
    {
      name: 'investmentDate',
      label: 'Investment Date',
      type: 'date',
      required: true,
    },
    {
      name: 'investmentAmount',
      label: 'Investment Amount',
      type: 'number',
      required: true,
    },
    {
      name: 'currentValue',
      label: 'Current Value',
      type: 'number',
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
            console.log(data.company)
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
