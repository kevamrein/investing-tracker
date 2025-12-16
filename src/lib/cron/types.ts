import type { Payload } from 'payload'

export interface CronJobResult {
  success: boolean
  jobName: string
  startTime: Date
  endTime: Date
  duration: number
  processedCount?: number
  errorCount?: number
  errors?: Array<{
    message: string
    context?: any
  }>
  message: string
}

export interface CronContext {
  payload: Payload
  processingUser: any
}
