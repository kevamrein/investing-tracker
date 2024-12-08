interface DollarValueBoxProps {
  label: string
  value: number | null | undefined
}

export function DollarValueBox({ label, value }: DollarValueBoxProps) {
  const isValidNumber = typeof value === 'number' && !isNaN(value)
  const formattedValue = isValidNumber ? `$${value.toFixed(2)}` : 'N/A'
  return (
    <div className="flex flex-col items-center justify-center px-4 py-2 rounded-md bg-gray-100 text-gray-800">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-sm font-bold">{formattedValue}</span>
    </div>
  )
}
