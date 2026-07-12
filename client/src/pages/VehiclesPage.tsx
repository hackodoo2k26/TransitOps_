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
import type { Vehicle } from '../services/transitops/transitops.types'

type VehicleFormState = {
  registrationNumber: string
  model: string
  vehicleType: string
  maxCapacity: string
  currentOdometer: string
  acquisitionCost: string
  region: string
  status: Vehicle['status']
}

const defaultForm: VehicleFormState = {
  registrationNumber: '',
  model: '',
  vehicleType: 'Truck',
  maxCapacity: '',
  currentOdometer: '0',
  acquisitionCost: '0',
  region: '',
  status: 'available',
}

export function VehiclesPage() {
  const { user } = useAuth()
  const canManageVehicles = hasAnyRole(user, ['FLEET_MANAGER'])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<Vehicle | null>(null)
  const [form, setForm] = useState<VehicleFormState>(defaultForm)

  const loadVehicles = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await transitopsService.listVehicles(query, statusFilter)
      setVehicles(result)
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Failed to load vehicles.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadVehicles()
  }, [statusFilter])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadVehicles()
    }, 250)
    return () => window.clearTimeout(timer)
  }, [query])

  const openCreate = () => {
    setEditing(null)
    setForm(defaultForm)
    setIsModalOpen(true)
  }

  const openEdit = (vehicle: Vehicle) => {
    setEditing(vehicle)
    setForm({
      registrationNumber: vehicle.registrationNumber,
      model: vehicle.model,
      vehicleType: vehicle.vehicleType,
      maxCapacity: vehicle.maxCapacity,
      currentOdometer: vehicle.currentOdometer,
      acquisitionCost: vehicle.acquisitionCost,
      region: vehicle.region ?? '',
      status: vehicle.status,
    })
    setIsModalOpen(true)
  }

  const saveVehicle = async () => {
    try {
      if (editing) {
        await transitopsService.updateVehicle(editing.id, {
          ...form,
          maxCapacity: Number(form.maxCapacity),
          currentOdometer: Number(form.currentOdometer),
          acquisitionCost: Number(form.acquisitionCost),
        })
      } else {
        await transitopsService.createVehicle({
          ...form,
          maxCapacity: Number(form.maxCapacity),
          currentOdometer: Number(form.currentOdometer),
          acquisitionCost: Number(form.acquisitionCost),
        })
      }
      setIsModalOpen(false)
      await loadVehicles()
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Failed to save vehicle.')
    }
  }

  const removeVehicle = async (vehicle: Vehicle) => {
    try {
      await transitopsService.deleteVehicle(vehicle.id)
      await loadVehicles()
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Failed to delete vehicle.')
    }
  }

  return (
    <>
      <Card variant="glass" className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Fleet</h2>
            <p className="text-sm text-neutral-400">Connected to `/api/vehicles`.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input label="Search" placeholder="Search registration or model" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="available">Available</option>
              <option value="on_trip">On trip</option>
              <option value="in_shop">In shop</option>
              <option value="retired">Retired</option>
            </Select>
            <div className="flex items-end">
              {canManageVehicles ? (
                <Button className="w-full" onClick={openCreate}>Add Vehicle</Button>
              ) : (
                <Button className="w-full" variant="secondary" onClick={() => void loadVehicles()}>Refresh</Button>
              )}
            </div>
          </div>
        </div>

        {error ? <ErrorState title="Vehicle request failed" description={error} action={<Button onClick={() => void loadVehicles()}>Retry</Button>} /> : null}
        {isLoading ? <div className="text-sm text-neutral-400">Loading vehicles...</div> : null}

        {!isLoading && !vehicles.length ? (
          <EmptyState title="No vehicles found" description="Create a vehicle or adjust your search filters." action={canManageVehicles ? <Button onClick={openCreate}>Create Vehicle</Button> : undefined} />
        ) : null}

        {!!vehicles.length && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-neutral-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-2 px-3">Registration</th>
                  <th className="py-2 px-3">Model</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Capacity</th>
                  <th className="py-2 px-3">Odometer</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td className="py-3 px-3 font-mono text-orange-400">{vehicle.registrationNumber}</td>
                    <td className="py-3 px-3">{vehicle.model}</td>
                    <td className="py-3 px-3">{vehicle.vehicleType}</td>
                    <td className="py-3 px-3">{vehicle.maxCapacity}</td>
                    <td className="py-3 px-3">{vehicle.currentOdometer}</td>
                    <td className="py-3 px-3">
                      <Badge variant={vehicle.status === 'available' ? 'success' : vehicle.status === 'on_trip' ? 'accent' : vehicle.status === 'in_shop' ? 'warning' : 'neutral'}>
                        {vehicle.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-2">
                        {canManageVehicles ? (
                          <>
                            <Button variant="outline" onClick={() => openEdit(vehicle)}>Edit</Button>
                            <Button variant="ghost" onClick={() => void removeVehicle(vehicle)}>Delete</Button>
                          </>
                        ) : (
                          <Button variant="secondary" onClick={() => openEdit(vehicle)} disabled>
                            View
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal title={editing ? 'Edit Vehicle' : 'Create Vehicle'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-4 grid gap-3">
          <Input label="Registration Number" value={form.registrationNumber} onChange={(e) => setForm((current) => ({ ...current, registrationNumber: e.target.value }))} />
          <Input label="Model" value={form.model} onChange={(e) => setForm((current) => ({ ...current, model: e.target.value }))} />
          <Input label="Vehicle Type" value={form.vehicleType} onChange={(e) => setForm((current) => ({ ...current, vehicleType: e.target.value }))} />
          <Input label="Max Capacity" type="number" value={form.maxCapacity} onChange={(e) => setForm((current) => ({ ...current, maxCapacity: e.target.value }))} />
          <Input label="Current Odometer" type="number" value={form.currentOdometer} onChange={(e) => setForm((current) => ({ ...current, currentOdometer: e.target.value }))} />
          <Input label="Acquisition Cost" type="number" value={form.acquisitionCost} onChange={(e) => setForm((current) => ({ ...current, acquisitionCost: e.target.value }))} />
          <Input label="Region" value={form.region} onChange={(e) => setForm((current) => ({ ...current, region: e.target.value }))} />
          <Select label="Status" value={form.status} onChange={(e) => setForm((current) => ({ ...current, status: e.target.value as Vehicle['status'] }))}>
            <option value="available">Available</option>
            <option value="on_trip">On trip</option>
            <option value="in_shop">In shop</option>
            <option value="retired">Retired</option>
          </Select>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={() => void saveVehicle()}>{editing ? 'Save Changes' : 'Create Vehicle'}</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

