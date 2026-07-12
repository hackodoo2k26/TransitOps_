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
import type { Driver } from '../services/transitops/transitops.types'

type DriverFormState = {
  name: string
  employeeId: string
  phone: string
  email: string
  address: string
  bloodGroup: string
  licenseNumber: string
  licenseCategory: string
  licenseExpiry: string
  joiningDate: string
  safetyScore: string
  status: Driver['status']
}

const defaultForm: DriverFormState = {
  name: '',
  employeeId: '',
  phone: '',
  email: '',
  address: '',
  bloodGroup: '',
  licenseNumber: '',
  licenseCategory: '',
  licenseExpiry: '',
  joiningDate: '',
  safetyScore: '100',
  status: 'available',
}

export function DriversPage() {
  const { user } = useAuth()
  const canManageDrivers = hasAnyRole(user, ['DISPATCHER'])
  const canManageSafety = hasAnyRole(user, ['SAFETY_OFFICER'])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Driver | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState<DriverFormState>(defaultForm)

  const loadDrivers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      setDrivers(await transitopsService.listDrivers(query, statusFilter))
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Failed to load drivers.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadDrivers()
  }, [statusFilter])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDrivers()
    }, 250)
    return () => window.clearTimeout(timer)
  }, [query])

  const openCreate = () => {
    setEditing(null)
    setForm(defaultForm)
    setIsModalOpen(true)
  }

  const openEdit = (driver: Driver) => {
    setEditing(driver)
    setForm({
      name: driver.name,
      employeeId: driver.employeeId,
      phone: driver.phone,
      email: driver.email ?? '',
      address: driver.address ?? '',
      bloodGroup: driver.bloodGroup ?? '',
      licenseNumber: driver.licenseNumber,
      licenseCategory: driver.licenseCategory,
      licenseExpiry: driver.licenseExpiry,
      joiningDate: driver.joiningDate,
      safetyScore: driver.safetyScore,
      status: driver.status,
    })
    setIsModalOpen(true)
  }

  const saveDriver = async () => {
    try {
      const payload = {
        ...form,
        email: form.email || undefined,
        address: form.address || undefined,
        bloodGroup: form.bloodGroup || undefined,
        safetyScore: Number(form.safetyScore),
      }

      if (editing) {
        await transitopsService.updateDriver(editing.id, payload)
      } else {
        await transitopsService.createDriver(payload)
      }
      setIsModalOpen(false)
      await loadDrivers()
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Failed to save driver.')
    }
  }

  const changeStatus = async (driver: Driver, status: Driver['status']) => {
    try {
      await transitopsService.updateDriverStatus(driver.id, status)
      await loadDrivers()
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Failed to update driver status.')
    }
  }

  const bumpSafety = async (driver: Driver, delta: number) => {
    try {
      const nextScore = Math.max(0, Math.min(100, Number(driver.safetyScore) + delta))
      await transitopsService.updateDriverSafety(driver.id, nextScore)
      await loadDrivers()
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Failed to update safety score.')
    }
  }

  return (
    <>
      <Card variant="glass" className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Drivers</h2>
            <p className="text-sm text-neutral-400">Connected to `/api/drivers`.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input label="Search" placeholder="Search name or employee ID" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="available">Available</option>
              <option value="on_trip">On trip</option>
              <option value="off_duty">Off duty</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </Select>
            <div className="flex items-end">
              {canManageDrivers ? (
                <Button className="w-full" onClick={openCreate}>Add Driver</Button>
              ) : (
                <Button className="w-full" variant="secondary" onClick={() => void loadDrivers()}>Refresh</Button>
              )}
            </div>
          </div>
        </div>

        {error ? <ErrorState title="Driver request failed" description={error} action={<Button onClick={() => void loadDrivers()}>Retry</Button>} /> : null}
        {isLoading ? <div className="text-sm text-neutral-400">Loading drivers...</div> : null}

        {!isLoading && !drivers.length ? (
          <EmptyState title="No drivers found" description="Create a driver or adjust the current filters." action={canManageDrivers ? <Button onClick={openCreate}>Create Driver</Button> : undefined} />
        ) : null}

        {!!drivers.length && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-neutral-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-2 px-3">Employee</th>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Phone</th>
                  <th className="py-2 px-3">License</th>
                  <th className="py-2 px-3">Safety</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {drivers.map((driver) => (
                  <tr key={driver.id}>
                    <td className="py-3 px-3 font-mono text-orange-400">{driver.employeeId}</td>
                    <td className="py-3 px-3">{driver.name}</td>
                    <td className="py-3 px-3">{driver.phone}</td>
                    <td className="py-3 px-3">{driver.licenseNumber}</td>
                    <td className="py-3 px-3">{driver.safetyScore}</td>
                    <td className="py-3 px-3">
                      <Badge variant={driver.status === 'available' ? 'success' : driver.status === 'on_trip' ? 'accent' : driver.status === 'suspended' ? 'warning' : 'neutral'}>
                        {driver.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-2">
                        {canManageDrivers ? <Button variant="outline" onClick={() => openEdit(driver)}>Edit</Button> : null}
                        {canManageDrivers ? (
                          <Select value={driver.status} onChange={(e) => void changeStatus(driver, e.target.value as Driver['status'])}>
                            <option value="available">Available</option>
                            <option value="off_duty">Off duty</option>
                            <option value="suspended">Suspended</option>
                            <option value="inactive">Inactive</option>
                          </Select>
                        ) : null}
                        {canManageSafety ? (
                          <>
                            <Button variant="ghost" onClick={() => void bumpSafety(driver, 5)}>+5 Safety</Button>
                            <Button variant="ghost" onClick={() => void bumpSafety(driver, -5)}>-5 Safety</Button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal title={editing ? 'Edit Driver' : 'Create Driver'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-4 grid gap-3">
          <Input label="Name" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
          <Input label="Employee ID" value={form.employeeId} onChange={(e) => setForm((current) => ({ ...current, employeeId: e.target.value }))} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} />
          <Input label="Address" value={form.address} onChange={(e) => setForm((current) => ({ ...current, address: e.target.value }))} />
          <Input label="Blood Group" value={form.bloodGroup} onChange={(e) => setForm((current) => ({ ...current, bloodGroup: e.target.value }))} />
          <Input label="License Number" value={form.licenseNumber} onChange={(e) => setForm((current) => ({ ...current, licenseNumber: e.target.value }))} />
          <Input label="License Category" value={form.licenseCategory} onChange={(e) => setForm((current) => ({ ...current, licenseCategory: e.target.value }))} />
          <Input label="License Expiry" type="date" value={form.licenseExpiry} onChange={(e) => setForm((current) => ({ ...current, licenseExpiry: e.target.value }))} />
          <Input label="Joining Date" type="date" value={form.joiningDate} onChange={(e) => setForm((current) => ({ ...current, joiningDate: e.target.value }))} />
          <Input label="Safety Score" type="number" value={form.safetyScore} onChange={(e) => setForm((current) => ({ ...current, safetyScore: e.target.value }))} />
          <Select label="Status" value={form.status} onChange={(e) => setForm((current) => ({ ...current, status: e.target.value as Driver['status'] }))}>
            <option value="available">Available</option>
            <option value="off_duty">Off duty</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </Select>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={() => void saveDriver()}>{editing ? 'Save Changes' : 'Create Driver'}</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

