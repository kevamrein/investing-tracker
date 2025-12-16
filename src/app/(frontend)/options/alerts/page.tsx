'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Bell, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { getServerSession } from 'next-auth'

export default function AlertsPage() {
  const [alertConfig, setAlertConfig] = useState({
    enabled: true,
    minScore: 85,
    alertTypes: ['new_opportunity', 'profit_target', 'stop_loss'] as string[],
    deliveryMethods: ['email', 'in_app'] as string[],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const allAlertTypes = [
    { value: 'new_opportunity', label: 'New High-Score Opportunity', description: 'Alert when scanner finds opportunity ≥ min score' },
    { value: 'profit_target', label: 'Profit Target Hit', description: 'Alert when position reaches +50% profit' },
    { value: 'stop_loss', label: 'Stop Loss Triggered', description: 'Alert when position drops -30%' },
    { value: 'position_update', label: 'Position Updates', description: 'Daily summary of open positions' },
    { value: 'daily_summary', label: 'Daily Summary', description: 'Daily digest of all pending opportunities' },
  ]

  const allDeliveryMethods = [
    { value: 'email', label: 'Email', icon: Mail, description: 'Receive alerts via email' },
    { value: 'in_app', label: 'In-App', icon: Bell, description: 'See notifications in the app' },
  ]

  const handleToggleAlertType = (type: string) => {
    setAlertConfig((prev) => ({
      ...prev,
      alertTypes: prev.alertTypes.includes(type)
        ? prev.alertTypes.filter((t) => t !== type)
        : [...prev.alertTypes, type],
    }))
  }

  const handleToggleDeliveryMethod = (method: string) => {
    setAlertConfig((prev) => ({
      ...prev,
      deliveryMethods: prev.deliveryMethods.includes(method)
        ? prev.deliveryMethods.filter((m) => m !== method)
        : [...prev.deliveryMethods, method],
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      // TODO: Implement save logic to create/update OptionAlert record
      // For now, just simulate a save
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setMessage({
        type: 'success',
        text: 'Alert preferences saved successfully!',
      })
    } catch (error: any) {
      console.error('Error saving alerts:', error)
      setMessage({
        type: 'error',
        text: 'Failed to save alert preferences. Please try again.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Alert Preferences</h1>
        <p className="text-gray-600 mt-1">
          Configure notifications for opportunities and position updates
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg border flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Master Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Master Alert Toggle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-lg">
                Alerts {alertConfig.enabled ? 'Enabled' : 'Disabled'}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {alertConfig.enabled
                  ? 'You will receive alerts based on your preferences below'
                  : 'All alerts are paused. Toggle on to resume.'}
              </p>
            </div>
            <button
              onClick={() => setAlertConfig({ ...alertConfig, enabled: !alertConfig.enabled })}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                alertConfig.enabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  alertConfig.enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Minimum Score Threshold */}
      <Card>
        <CardHeader>
          <CardTitle>Opportunity Score Threshold</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Minimum Score for Alerts
              </label>
              <select
                value={alertConfig.minScore}
                onChange={(e) =>
                  setAlertConfig({ ...alertConfig, minScore: parseInt(e.target.value) })
                }
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!alertConfig.enabled}
              >
                <option value="70">70+ (All viable opportunities)</option>
                <option value="80">80+ (High quality)</option>
                <option value="85">85+ (Strong buy only)</option>
                <option value="90">90+ (Exceptional only)</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Only receive alerts for opportunities with this score or higher
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Types */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allAlertTypes.map((type) => (
              <div
                key={type.value}
                className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                  alertConfig.enabled && alertConfig.alertTypes.includes(type.value)
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{type.label}</div>
                  <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                </div>
                <button
                  onClick={() => handleToggleAlertType(type.value)}
                  disabled={!alertConfig.enabled}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    alertConfig.enabled && alertConfig.alertTypes.includes(type.value)
                      ? 'bg-blue-600'
                      : 'bg-gray-300'
                  } ${!alertConfig.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      alertConfig.alertTypes.includes(type.value)
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allDeliveryMethods.map((method) => {
              const Icon = method.icon
              return (
                <div
                  key={method.value}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                    alertConfig.enabled && alertConfig.deliveryMethods.includes(method.value)
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`p-2 rounded-lg ${
                        alertConfig.enabled && alertConfig.deliveryMethods.includes(method.value)
                          ? 'bg-green-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          alertConfig.enabled && alertConfig.deliveryMethods.includes(method.value)
                            ? 'text-green-600'
                            : 'text-gray-600'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{method.label}</div>
                      <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleDeliveryMethod(method.value)}
                    disabled={!alertConfig.enabled}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      alertConfig.enabled && alertConfig.deliveryMethods.includes(method.value)
                        ? 'bg-green-600'
                        : 'bg-gray-300'
                    } ${!alertConfig.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        alertConfig.deliveryMethods.includes(method.value)
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )
            })}
          </div>

          {alertConfig.deliveryMethods.includes('email') && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Email alerts will be sent to the email address associated
                with your account. Make sure your email is verified.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg" className="px-8">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
