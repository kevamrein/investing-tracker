/**
 * Date utility functions for cron job processing
 * Ensures consistent date handling across batch processing system
 */

/**
 * Get the start of today in UTC (midnight 00:00:00)
 * @returns Date object set to today at 00:00:00 UTC
 */
export function getTodayStartUTC(): Date {
  const now = new Date()
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
  return todayStart
}

/**
 * Get today's date as a string in YYYY-MM-DD format
 * @returns Date string (e.g., "2025-12-22")
 */
export function getTodayDateString(): string {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

/**
 * Check if a given date is today (UTC)
 * @param date - Date string or Date object to check
 * @returns true if the date is today, false otherwise
 */
export function isToday(date: string | Date): boolean {
  const checkDate = typeof date === 'string' ? new Date(date) : date
  const todayString = getTodayDateString()
  const checkDateString = checkDate.toISOString().split('T')[0]
  return todayString === checkDateString
}
