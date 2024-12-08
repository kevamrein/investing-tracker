import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StockPerformanceBox } from './stock-performance-box'
import { DollarValueBox } from './dollar-value-box'
import { formatDate } from '@/lib/utils'

interface CasePoint {
  date: string
  point: string
}

interface CompanyInfoBoxProps {
  name: string
  ticker: string
  recommendationDate: date
  priceTarget?: number
  timeframe?: string
  currentPrice: number
  bullCase: CasePoint[]
  bearCase: CasePoint[]
  performance: {
    pastYear: number | null
    pastWeek: number | null
    yearToDate: number | null
  }
}

export function CompanyInfoBox({
  name,
  ticker,
  recommendationDate,
  priceTarget,
  timeframe,
  currentPrice,
  bullCase,
  bearCase,
  performance,
}: CompanyInfoBoxProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">
                {name} <span className="text-xl font-semibold text-primary">{ticker}</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Recommendation Date: {formatDate(recommendationDate)}
              </p>
              {priceTarget && (
                <p className="text-sm text-muted-foreground">
                  Price Target: ${priceTarget.toFixed(2)}
                </p>
              )}
              {timeframe && <p className="text-sm text-muted-foreground">Timeframe: {timeframe}</p>}
              <div className="flex justify-left items-center space-x-4">
                <DollarValueBox label="Now" value={currentPrice} />
                <StockPerformanceBox label="1 Year" value={performance.pastYear} />
                <StockPerformanceBox label="Past Week" value={performance.pastWeek} />
                <StockPerformanceBox label="YTD" value={performance.yearToDate} />
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border-t border-gray-200 my-4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Bull Case</h3>
            <ul className="list-disc pl-5 space-y-2">
              {bullCase.map((point, index) => (
                <li key={index}>
                  <span className="text-sm font-medium">{formatDate(point.date)}: </span>
                  <span className="text-sm text-muted-foreground">{point.point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Bear Case</h3>
            <ul className="list-disc pl-5 space-y-2">
              {bearCase.map((point, index) => (
                <li key={index}>
                  <span className="text-sm font-medium">{formatDate(point.date)}: </span>
                  <span className="text-sm text-muted-foreground">{point.point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
