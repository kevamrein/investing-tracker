// Utility functions for options opportunities (non-server-actions)

export function mapSector(yahooSector: string): 'technology' | 'communication' | 'healthcare' | 'financial' | 'consumer' | 'other' {
  const lower = yahooSector.toLowerCase()

  if (lower.includes('technology') || lower.includes('software') || lower.includes('computer')) {
    return 'technology'
  } else if (lower.includes('communication')) {
    return 'communication'
  } else if (lower.includes('healthcare') || lower.includes('health')) {
    return 'healthcare'
  } else if (lower.includes('financial')) {
    return 'financial'
  } else if (lower.includes('consumer')) {
    return 'consumer'
  }

  return 'other'
}
