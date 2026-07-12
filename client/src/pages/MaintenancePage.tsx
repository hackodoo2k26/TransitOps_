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
import { transitopsService } from '../services/transitops/transitops.service'
import type { MaintenanceLog, Vehicle } from '../services/transitops/transitops.types'

type FormState = {
  vehicleId: string
  description: string
  cost: string
  openedAt: string
}

const defaultForm: FormState = {
  vehicleId: '',
  description: '',
  cost: '',
  openedAt: '',
}

export function MaintenancePage() {
  const { user } = useAuth()
  const canManageMaintenance = hasAnyRole(user, ['FLEET_MANAGER'])
  const [items, setItems] = useState<MaintenanceLog[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState<FormState>(defaultForm)

  const loadMaintenance = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [maintenance, vehicleRows] = await Promise.all([
        transitopsService.listMaintenance(),
        transitopsService.listVehicles(),
      ])
      setItems(maintenance)
      setVehicles(vehicleRows)
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Failed to load maintenance logs.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadMaintenance()
  }, [])

  const createLog = async () => {
    try {
      await transitopsService.createMaintenance({
        vehicleId: Number(form.vehicleId),
        description: form.description,
        cost: Number(form.cost),
        openedAt: form.openedAt,
      })
      setIsModalOpen(false)
      setForm(defaultForm)
      await loadMaintenance()
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Failed to create maintenance log.')
    }
  }

  const closeLog = async (log: MaintenanceLog) => {
    try {
      await transitopsService.closeMaintenance(log.id)
      await loadMaintenance()
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Failed to close maintenance log.')
    }
  }

  const vehicleLabel = (id: number) => vehicles.find((vehicle) => vehicle.id === id)?.registrationNumber ?? `#${id}`

  return (
    <>
      <Card variant="glass" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Maintenance</h2>
            <p className="text-sm text-neutral-400">Connected to `/api/maintenance`.</p>
          </div>
          {canManageMaintenance ? <Button onClick={() => setIsModalOpen(true)}>Schedule Maintenance</Button> : <Button variant="secondary" onClick={() => void loadMaintenance()}>Refresh</Button>}
        </div>

        {error ? <ErrorState title="Maintenance request failed" description={error} action={<Button onClick={() => void loadMaintenance()}>Retry</Button>} /> : null}
        {isLoading ? <div className="text-sm text-neutral-400">Loading maintenance logs...</div> : null}

        {!isLoading && !items.length ? <EmptyState title="No maintenance logs found" description="Create a maintenance record to track workshop activity." action={canManageMaintenance ? <Button onClick={() => setIsModalOpen(true)}>Create Log</Button> : undefined} /> : null}

        {!!items.length && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-neutral-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-2 px-3">Vehicle</th>
                  <th className="py-2 px-3">Description</th>
                  <th className="py-2 px-3">Cost</th>
                  <th className="py-2 px-3">Opened</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-3 font-mono text-orange-400">{vehicleLabel(item.vehicleId)}</td>
                    <td className="py-3 px-3">{item.description}</td>
                    <td className="py-3 px-3">${item.cost}</td>
                    <td className="py-3 px-3">{item.openedAt}</td>
                    <td className="py-3 px-3">
                      <Badge variant={item.status === 'closed' ? 'success' : 'warning'}>{item.status}</Badge>
                    </td>
                    <td className="py-3 px-3">
                      {canManageMaintenance && item.status === 'open' ? <Button variant="outline" onClick={() => void closeLog(item)}>Close</Button> : <span className="text-neutral-500">No action</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal title="Schedule Maintenance" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-4 grid gap-3">
          <Select label="Vehicle" value={form.vehicleId} onChange={(e) => setForm((current) => ({ ...current, vehicleId: e.target.value }))}>
            <option value="">Select vehicle</option>
            {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.registrationNumber}</option>)}
          </Select>
          <Input label="Description" value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} />
          <Input label="Cost" type="number" value={form.cost} onChange={(e) => setForm((current) => ({ ...current, cost: e.target.value }))} />
          <Input label="Opened At" type="date" value={form.openedAt} onChange={(e) => setForm((current) => ({ ...current, openedAt: e.target.value }))} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={() => void createLog()}>Create Log</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

