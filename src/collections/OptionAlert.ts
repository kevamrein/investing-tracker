import { CollectionConfig } from 'payload'

export const OptionAlert: CollectionConfig = {
  slug: 'option-alerts',
  admin: {
    useAsTitle: 'displayTitle',
    defaultColumns: ['displayTitle', 'investor', 'alertType', 'enabled'],
    group: 'Options Trading',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.collection === 'users') return true
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
    {
      name: 'investor',
      label: 'Investor',
      type: 'relationship',
      relationTo: 'investors',
      required: true,
      index: true,
      admin: {
        description: 'Investor who owns this alert configuration',
      },
    },

    // Alert Type
    {
      name: 'alertType',
      label: 'Alert Type',
      type: 'select',
      required: true,
      options: [
        { label: 'New Opportunity (Score >= X)', value: 'new_opportunity' },
        { label: 'Profit Target Hit', value: 'profit_target' },
        { label: 'Stop Loss Triggered', value: 'stop_loss' },
        { label: 'Position Update', value: 'position_update' },
        { label: 'Daily Summary', value: 'daily_summary' },
      ],
      admin: {
        description: 'Type of event that triggers this alert',
      },
    },

    // Trigger Conditions
    {
      name: 'minScore',
      label: 'Minimum Score',
      type: 'number',
      defaultValue: 85,
      min: 0,
      max: 100,
      admin: {
        description: 'Only alert on opportunities with score >= this value (for new_opportunity alerts)',
        condition: (data) => data.alertType === 'new_opportunity',
      },
    },

    // Delivery Methods
    {
      name: 'deliveryMethods',
      label: 'Delivery Methods',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'method',
          type: 'select',
          required: true,
          options: [
            { label: 'Email', value: 'email' },
            { label: 'In-App Notification', value: 'in_app' },
          ],
        },
      ],
      admin: {
        description: 'How to deliver this alert (can select multiple)',
      },
    },

    // Email settings
    {
      name: 'emailAddress',
      label: 'Email Address',
      type: 'email',
      admin: {
        description: 'Email address for delivery (only shown if Email is selected)',
        condition: (data) => {
          return data.deliveryMethods?.some((d: any) => d.method === 'email')
        },
      },
    },

    // Status
    {
      name: 'enabled',
      label: 'Enabled',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Turn this alert on or off',
      },
    },

    // Alert History (for tracking sent alerts)
    {
      name: 'lastTriggered',
      label: 'Last Triggered',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Last time this alert was sent',
        date: {
          displayFormat: 'MMM dd, yyyy HH:mm',
        },
      },
    },
    {
      name: 'triggerCount',
      label: 'Trigger Count',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Number of times this alert has been triggered',
      },
    },

    // Display
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
            const status = data.enabled ? '🟢 ON' : '🔴 OFF'
            const alertLabel = data.alertType?.replace(/_/g, ' ').toUpperCase() || 'UNKNOWN'

            if (data.alertType === 'new_opportunity' && data.minScore) {
              return `${status} - ${alertLabel} (Score ≥${data.minScore})`
            }

            return `${status} - ${alertLabel}`
          },
        ],
      },
    },
  ],
}
