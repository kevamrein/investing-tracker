import { cn } from '@/lib/utils'

interface StockPerformanceBoxProps {
  label: string
  value: number | null | undefined
}

export function StockPerformanceBox({ label, value }: StockPerformanceBoxProps) {
  const isValidNumber = typeof value === 'number' && !isNaN(value)
  const isPositive = isValidNumber && value >= 0
  const formattedValue = isValidNumber ? `${isPositive ? '+' : ''}${value.toFixed(2)}%` : 'N/A'

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-4 py-2 rounded-md',
        isValidNumber
          ? isPositive
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
          : 'bg-gray-100 text-gray-800',
      )}
    >
      <span className="text-sm font-medium">{label}</span>
      <span className="text-sm font-bold">{formattedValue}</span>
    </div>
  )
}
