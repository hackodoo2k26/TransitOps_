import { useEffect, useState } from 'react'

import { useAuth } from '../hooks/useAuth'
import { hasAnyRole } from '../lib/access'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Select } from '../components/ui/Select'
import { TextArea } from '../components/ui/TextArea'
import { transitopsService } from '../services/transitops/transitops.service'
import type { Expense, FuelLog, Vehicle } from '../services/transitops/transitops.types'

type FuelFormState = {
  vehicleId: string
  tripId: string
  liters: string
  cost: string
  odometer: string
  date: string
}

type ExpenseFormState = {
  vehicleId: string
  tripId: string
  type: Expense['type']
  amount: string
  date: string
  notes: string
}

const defaultFuelForm: FuelFormState = {
  vehicleId: '',
  tripId: '',
  liters: '',
  cost: '',
  odometer: '',
  date: '',
}

const defaultExpenseForm: ExpenseFormState = {
  vehicleId: '',
  tripId: '',
  type: 'misc',
  amount: '',
  date: '',
  notes: '',
}

export function FuelExpensesPage() {
  const { user } = useAuth()
  const canCreate = hasAnyRole(user, ['FLEET_MANAGER'])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [fuelForm, setFuelForm] = useState<FuelFormState>(defaultFuelForm)
  const [expenseForm, setExpenseForm] = useState<ExpenseFormState>(defaultExpenseForm)

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [vehicleRows, fuelRows, expenseRows] = await Promise.all([
        transitopsService.listVehicles(),
        transitopsService.listFuelLogs(),
        transitopsService.listExpenses(),
      ])
      setVehicles(vehicleRows)
      setFuelLogs(fuelRows)
      setExpenses(expenseRows)
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Failed to load fuel and expense data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const createFuelLog = async () => {
    try {
      await transitopsService.createFuelLog({
        vehicleId: Number(fuelForm.vehicleId),
        tripId: fuelForm.tripId ? Number(fuelForm.tripId) : undefined,
        liters: Number(fuelForm.liters),
        cost: Number(fuelForm.cost),
        odometer: fuelForm.odometer ? Number(fuelForm.odometer) : undefined,
        date: fuelForm.date,
      })
      setFuelForm(defaultFuelForm)
      setIsFuelModalOpen(false)
      await loadData()
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Failed to create fuel log.')
    }
  }

  const createExpense = async () => {
    try {
      await transitopsService.createExpense({
        vehicleId: expenseForm.vehicleId ? Number(expenseForm.vehicleId) : undefined,
        tripId: expenseForm.tripId ? Number(expenseForm.tripId) : undefined,
        type: expenseForm.type,
        amount: Number(expenseForm.amount),
        date: expenseForm.date,
        notes: expenseForm.notes || undefined,
      })
      setExpenseForm(defaultExpenseForm)
      setIsExpenseModalOpen(false)
      await loadData()
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Failed to create expense.')
    }
  }

  const vehicleLabel = (id: number | null) => (id ? vehicles.find((vehicle) => vehicle.id === id)?.registrationNumber ?? `#${id}` : '-')

  return (
    <>
      <div className="space-y-6">
        <Card variant="glass" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Fuel & Expenses</h2>
              <p className="text-sm text-neutral-400">Connected to `/api/fuel-logs` and `/api/expenses`.</p>
            </div>
            <div className="flex gap-2">
              {canCreate ? (
                <>
                  <Button variant="secondary" onClick={() => setIsFuelModalOpen(true)}>Add Fuel Log</Button>
                  <Button onClick={() => setIsExpenseModalOpen(true)}>Add Expense</Button>
                </>
              ) : (
                <Button variant="secondary" onClick={() => void loadData()}>Refresh</Button>
              )}
            </div>
          </div>

          {error ? <ErrorState title="Finance request failed" description={error} action={<Button onClick={() => void loadData()}>Retry</Button>} /> : null}
          {isLoading ? <div className="text-sm text-neutral-400">Loading finance data...</div> : null}
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card variant="glass" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Fuel Logs</h3>
              <Badge variant="accent">{fuelLogs.length} records</Badge>
            </div>

            {!isLoading && !fuelLogs.length ? <EmptyState title="No fuel logs found" description="Create a fuel log to start tracking consumption." /> : null}

            {!!fuelLogs.length && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-neutral-400 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="py-2 px-3">Vehicle</th>
                      <th className="py-2 px-3">Liters</th>
                      <th className="py-2 px-3">Cost</th>
                      <th className="py-2 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {fuelLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="py-3 px-3 font-mono text-orange-400">{vehicleLabel(log.vehicleId)}</td>
                        <td className="py-3 px-3">{log.liters}</td>
                        <td className="py-3 px-3">${log.cost}</td>
                        <td className="py-3 px-3">{log.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card variant="glass" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Expenses</h3>
              <Badge variant="warning">{expenses.length} records</Badge>
            </div>

            {!isLoading && !expenses.length ? <EmptyState title="No expenses found" description="Create an expense to populate this section." /> : null}

            {!!expenses.length && (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-neutral-400 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Vehicle</th>
                      <th className="py-2 px-3">Amount</th>
                      <th className="py-2 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {expenses.map((expense) => (
                      <tr key={expense.id}>
                        <td className="py-3 px-3"><Badge variant="neutral">{expense.type}</Badge></td>
                        <td className="py-3 px-3">{vehicleLabel(expense.vehicleId)}</td>
                        <td className="py-3 px-3">${expense.amount}</td>
                        <td className="py-3 px-3">{expense.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      <Modal title="Add Fuel Log" isOpen={isFuelModalOpen} onClose={() => setIsFuelModalOpen(false)}>
        <div className="p-4 grid gap-3">
          <Select label="Vehicle" value={fuelForm.vehicleId} onChange={(e) => setFuelForm((current) => ({ ...current, vehicleId: e.target.value }))}>
            <option value="">Select vehicle</option>
            {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.registrationNumber}</option>)}
          </Select>
          <Input label="Trip ID" type="number" value={fuelForm.tripId} onChange={(e) => setFuelForm((current) => ({ ...current, tripId: e.target.value }))} />
          <Input label="Liters" type="number" value={fuelForm.liters} onChange={(e) => setFuelForm((current) => ({ ...current, liters: e.target.value }))} />
          <Input label="Cost" type="number" value={fuelForm.cost} onChange={(e) => setFuelForm((current) => ({ ...current, cost: e.target.value }))} />
          <Input label="Odometer" type="number" value={fuelForm.odometer} onChange={(e) => setFuelForm((current) => ({ ...current, odometer: e.target.value }))} />
          <Input label="Date" type="date" value={fuelForm.date} onChange={(e) => setFuelForm((current) => ({ ...current, date: e.target.value }))} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsFuelModalOpen(false)}>Cancel</Button>
            <Button onClick={() => void createFuelLog()}>Save Fuel Log</Button>
          </div>
        </div>
      </Modal>

      <Modal title="Add Expense" isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)}>
        <div className="p-4 grid gap-3">
          <Select label="Type" value={expenseForm.type} onChange={(e) => setExpenseForm((current) => ({ ...current, type: e.target.value as Expense['type'] }))}>
            <option value="fuel">Fuel</option>
            <option value="maintenance">Maintenance</option>
            <option value="toll">Toll</option>
            <option value="misc">Misc</option>
          </Select>
          <Select label="Vehicle" value={expenseForm.vehicleId} onChange={(e) => setExpenseForm((current) => ({ ...current, vehicleId: e.target.value }))}>
            <option value="">Select vehicle</option>
            {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.registrationNumber}</option>)}
          </Select>
          <Input label="Trip ID" type="number" value={expenseForm.tripId} onChange={(e) => setExpenseForm((current) => ({ ...current, tripId: e.target.value }))} />
          <Input label="Amount" type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm((current) => ({ ...current, amount: e.target.value }))} />
          <Input label="Date" type="date" value={expenseForm.date} onChange={(e) => setExpenseForm((current) => ({ ...current, date: e.target.value }))} />
          <TextArea label="Notes" value={expenseForm.notes} onChange={(e) => setExpenseForm((current) => ({ ...current, notes: e.target.value }))} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsExpenseModalOpen(false)}>Cancel</Button>
            <Button onClick={() => void createExpense()}>Save Expense</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

