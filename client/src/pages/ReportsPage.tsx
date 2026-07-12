import { useEffect, useState } from 'react'

import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ErrorState } from '../components/ui/ErrorState'
import { transitopsService } from '../services/transitops/transitops.service'

type ReportRows = Array<Record<string, unknown>>

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function ReportsPage() {
  const [fuelEfficiency, setFuelEfficiency] = useState<ReportRows>([])
  const [fleetUtilization, setFleetUtilization] = useState<ReportRows>([])
  const [vehicleRoi, setVehicleRoi] = useState<ReportRows>([])
  const [monthlyExpenses, setMonthlyExpenses] = useState<ReportRows>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadReports = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [fuelRows, fleetRows, roiRows, expenseRows] = await Promise.all([
        transitopsService.getFuelEfficiencyReport(),
        transitopsService.getFleetUtilizationReport(),
        transitopsService.getVehicleRoiReport(),
        transitopsService.getMonthlyExpensesReport(),
      ])
      setFuelEfficiency(fuelRows)
      setFleetUtilization(fleetRows)
      setVehicleRoi(roiRows)
      setMonthlyExpenses(expenseRows)
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Failed to load reports.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadReports()
  }, [])

  const exportMonthlyExpenses = async (format: 'csv' | 'pdf') => {
    try {
      const blob = await transitopsService.exportMonthlyExpenses(format)
      downloadBlob(blob, format === 'pdf' ? 'monthly-expenses.pdf' : 'monthly-expenses.csv')
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message || `Failed to export ${format.toUpperCase()} report.`)
    }
  }

  const renderRows = (rows: ReportRows) => {
    if (!rows.length) {
      return <div className="text-sm text-neutral-400">No rows returned.</div>
    }

    const headers = Object.keys(rows[0])
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-neutral-400 text-xs uppercase tracking-wider">
            <tr>
              {headers.map((header) => <th key={header} className="py-2 px-3">{header}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {rows.slice(0, 6).map((row, index) => (
              <tr key={index}>
                {headers.map((header) => <td key={header} className="py-3 px-3">{String(row[header] ?? '-')}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card variant="glass" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Analytics & Reports</h2>
            <p className="text-sm text-neutral-400">Connected to `/api/reports`.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => void exportMonthlyExpenses('csv')}>Export CSV</Button>
            <Button onClick={() => void exportMonthlyExpenses('pdf')}>Export PDF</Button>
          </div>
        </div>
        {error ? <ErrorState title="Report request failed" description={error} action={<Button onClick={() => void loadReports()}>Retry</Button>} /> : null}
        {isLoading ? <div className="text-sm text-neutral-400">Loading reports...</div> : null}
      </Card>

      <div className="grid gap-6">
        <Card variant="glass" className="p-5 space-y-3">
          <h3 className="text-base font-semibold text-white">Fuel Efficiency</h3>
          {renderRows(fuelEfficiency)}
        </Card>
        <Card variant="glass" className="p-5 space-y-3">
          <h3 className="text-base font-semibold text-white">Fleet Utilization</h3>
          {renderRows(fleetUtilization)}
        </Card>
        <Card variant="glass" className="p-5 space-y-3">
          <h3 className="text-base font-semibold text-white">Vehicle ROI</h3>
          {renderRows(vehicleRoi)}
        </Card>
        <Card variant="glass" className="p-5 space-y-3">
          <h3 className="text-base font-semibold text-white">Monthly Expenses</h3>
          {renderRows(monthlyExpenses)}
        </Card>
      </div>
    </div>
  )
}

