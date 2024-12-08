import { CompanyInfoBox } from './company-info-box'
import { getPayload } from 'payload'
import config from '@payload-config'

export default async function HomePage() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'company',
  })

  //   const companies = [
  //     {
  //       name: 'TechCorp',
  //       ticker: 'TECH',
  //       recommendationDate: '2023-07-30',
  //       priceTarget: 150,
  //       timeframe: '12 months',
  //       currentPrice: 125.5,
  //       bullCase: [
  //         { date: '2023-06-15', point: 'Strong product pipeline in AI and quantum computing' },
  //         { date: '2023-07-01', point: 'Expanding market share in emerging technologies' },
  //         { date: '2023-07-20', point: 'Consistent revenue growth and high profit margins' },
  //       ],
  //       bearCase: [
  //         { date: '2023-06-10', point: 'Increasing competition in key markets' },
  //         { date: '2023-06-30', point: 'Potential regulatory challenges in data privacy' },
  //         { date: '2023-07-15', point: 'High valuation compared to industry peers' },
  //       ],
  //       performance: {
  //         pastYear: 15.5,
  //         pastSixMonths: -3.2,
  //         pastMonth: 2.8,
  //       },
  //     },
  //     {
  //       name: 'GreenEnergy',
  //       ticker: 'GREN',
  //       recommendationDate: '2023-07-28',
  //       priceTarget: 75,
  //       timeframe: '18 months',
  //       currentPrice: 62.75,
  //       bullCase: [
  //         { date: '2023-06-20', point: 'Growing demand for renewable energy solutions' },
  //         { date: '2023-07-05', point: 'Government incentives for clean energy adoption' },
  //         { date: '2023-07-25', point: 'Innovative battery technology with wide-scale potential' },
  //       ],
  //       bearCase: [
  //         { date: '2023-06-25', point: 'Dependency on government subsidies' },
  //         { date: '2023-07-10', point: 'High capital expenditure requirements' },
  //         { date: '2023-07-30', point: 'Potential supply chain disruptions for rare materials' },
  //       ],
  //       performance: {
  //         pastYear: 28.7,
  //         pastSixMonths: 12.4,
  //         pastMonth: -1.5,
  //       },
  //     },
  //     {
  //       name: 'HealthTech',
  //       ticker: 'HLTH',
  //       recommendationDate: '2023-07-25',
  //       currentPrice: 89.25,
  //       bullCase: [
  //         { date: '2023-06-18', point: 'Innovative medical devices in development' },
  //         { date: '2023-07-03', point: 'Strong R&D pipeline in personalized medicine' },
  //         { date: '2023-07-22', point: 'Aging population driving demand for healthcare solutions' },
  //       ],
  //       bearCase: [
  //         { date: '2023-06-22', point: 'Regulatory hurdles in key markets' },
  //         { date: '2023-07-08', point: 'Potential pricing pressures from healthcare reforms' },
  //         { date: '2023-07-28', point: 'High costs associated with clinical trials' },
  //       ],
  //       performance: {
  //         pastYear: 5.2,
  //         pastSixMonths: 8.9,
  //         pastMonth: null,
  //       },
  //     },
  //   ]
  const companies = result.docs.map((doc) => {
    return {
      name: doc.name,
      ticker: doc.ticker,
      recommendationDate: doc.recommendationDate,
      priceTarget: doc.priceTarget,
      timeframe: doc.timeframe,
      currentPrice: doc.currentPrice,
      bullCase: doc.bullCase.map((point) => ({
        date: point.opinionDate,
        point: point.opinionText,
      })),
      bearCase: doc.bearCase.map((point) => ({
        date: point.opinionDate,
        point: point.opinionText,
      })),
      performance: {
        pastYear: doc.oneYearReturn,
        pastWeek: doc.weekToDateReturn,
        yearToDate: doc.ytdReturn,
      },
    }
  })

  return (
    <div>
      {companies.map((company, index) => (
        <CompanyInfoBox key={index} {...company} />
      ))}
    </div>
  )
}
