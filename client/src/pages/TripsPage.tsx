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
import type { Driver, Trip, Vehicle } from '../services/transitops/transitops.types'

type TripFormState = {
  source: string
  destination: string
  vehicleId: string
  driverId: string
  cargoWeight: string
  plannedDistance: string
  revenue: string
  notes: string
}

const defaultForm: TripFormState = {
  source: '',
  destination: '',
  vehicleId: '',
  driverId: '',
  cargoWeight: '0',
  plannedDistance: '0',
  revenue: '0',
  notes: '',
}

export function TripsPage() {
  const { user } = useAuth()
  const canManageTrips = hasAnyRole(user, ['DISPATCHER'])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [trips, setTrips] = useState<Trip[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState<TripFormState>(defaultForm)

  const loadTrips = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [tripRows, vehicleRows, driverRows] = await Promise.all([
        transitopsService.listTrips(query, statusFilter),
        transitopsService.listVehicles(),
        transitopsService.listDrivers(),
      ])
      setTrips(tripRows)
      setVehicles(vehicleRows)
      setDrivers(driverRows)
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Failed to load trips.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadTrips()
  }, [statusFilter])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTrips()
    }, 250)
    return () => window.clearTimeout(timer)
  }, [query])

  const createTrip = async () => {
    try {
      await transitopsService.createTrip({
        source: form.source,
        destination: form.destination,
        vehicleId: Number(form.vehicleId),
        driverId: Number(form.driverId),
        cargoWeight: Number(form.cargoWeight),
        plannedDistance: Number(form.plannedDistance),
        revenue: Number(form.revenue),
        notes: form.notes || undefined,
      })
      setIsModalOpen(false)
      setForm(defaultForm)
      await loadTrips()
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Failed to create trip.')
    }
  }

  const dispatchTrip = async (trip: Trip) => {
    try {
      await transitopsService.dispatchTrip(trip.id)
      await loadTrips()
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Failed to dispatch trip.')
    }
  }

  const completeTrip = async (trip: Trip) => {
    try {
      await transitopsService.completeTrip(trip.id, {
        endOdometer: Number(trip.startOdometer ?? 0) + Number(trip.plannedDistance || 0),
        actualDistance: Number(trip.plannedDistance || 0),
        fuelConsumed: Number(trip.fuelConsumed || 0),
        revenue: Number(trip.revenue || 0),
      })
      await loadTrips()
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Failed to complete trip.')
    }
  }

  const cancelTrip = async (trip: Trip) => {
    try {
      await transitopsService.cancelTrip(trip.id, trip.notes ?? undefined)
      await loadTrips()
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Failed to cancel trip.')
    }
  }

  const vehicleLabel = (id: number | null) => vehicles.find((vehicle) => vehicle.id === id)?.registrationNumber ?? '-'
  const driverLabel = (id: number | null) => drivers.find((driver) => driver.id === id)?.name ?? '-'

  return (
    <>
      <Card variant="glass" className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Trips</h2>
            <p className="text-sm text-neutral-400">Connected to `/api/trips`.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input label="Search" placeholder="Search source or destination" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="dispatched">Dispatched</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
            <div className="flex items-end">
              {canManageTrips ? (
                <Button className="w-full" onClick={() => setIsModalOpen(true)}>Create Trip</Button>
              ) : (
                <Button className="w-full" variant="secondary" onClick={() => void loadTrips()}>Refresh</Button>
              )}
            </div>
          </div>
        </div>

        {error ? <ErrorState title="Trip request failed" description={error} action={<Button onClick={() => void loadTrips()}>Retry</Button>} /> : null}
        {isLoading ? <div className="text-sm text-neutral-400">Loading trips...</div> : null}

        {!isLoading && !trips.length ? (
          <EmptyState title="No trips found" description="Create a draft trip to start dispatch operations." action={canManageTrips ? <Button onClick={() => setIsModalOpen(true)}>Create Trip</Button> : undefined} />
        ) : null}

        {!!trips.length && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-neutral-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-2 px-3">Trip</th>
                  <th className="py-2 px-3">Route</th>
                  <th className="py-2 px-3">Vehicle</th>
                  <th className="py-2 px-3">Driver</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {trips.map((trip) => (
                  <tr key={trip.id}>
                    <td className="py-3 px-3 font-mono text-orange-400">#{trip.id}</td>
                    <td className="py-3 px-3">{trip.source} to {trip.destination}</td>
                    <td className="py-3 px-3">{vehicleLabel(trip.vehicleId)}</td>
                    <td className="py-3 px-3">{driverLabel(trip.driverId)}</td>
                    <td className="py-3 px-3">
                      <Badge variant={trip.status === 'completed' ? 'success' : trip.status === 'dispatched' ? 'accent' : trip.status === 'cancelled' ? 'error' : 'neutral'}>
                        {trip.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      {canManageTrips ? (
                        <div className="flex flex-wrap gap-2">
                          {trip.status === 'draft' ? <Button variant="outline" onClick={() => void dispatchTrip(trip)}>Dispatch</Button> : null}
                          {trip.status === 'dispatched' ? <Button variant="outline" onClick={() => void completeTrip(trip)}>Complete</Button> : null}
                          {trip.status !== 'completed' && trip.status !== 'cancelled' ? <Button variant="ghost" onClick={() => void cancelTrip(trip)}>Cancel</Button> : null}
                        </div>
                      ) : (
                        <span className="text-neutral-500">Read only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal title="Create Trip" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-4 grid gap-3">
          <Input label="Source" value={form.source} onChange={(e) => setForm((current) => ({ ...current, source: e.target.value }))} />
          <Input label="Destination" value={form.destination} onChange={(e) => setForm((current) => ({ ...current, destination: e.target.value }))} />
          <Select label="Vehicle" value={form.vehicleId} onChange={(e) => setForm((current) => ({ ...current, vehicleId: e.target.value }))}>
            <option value="">Select vehicle</option>
            {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.registrationNumber}</option>)}
          </Select>
          <Select label="Driver" value={form.driverId} onChange={(e) => setForm((current) => ({ ...current, driverId: e.target.value }))}>
            <option value="">Select driver</option>
            {drivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.name}</option>)}
          </Select>
          <Input label="Cargo Weight" type="number" value={form.cargoWeight} onChange={(e) => setForm((current) => ({ ...current, cargoWeight: e.target.value }))} />
          <Input label="Planned Distance" type="number" value={form.plannedDistance} onChange={(e) => setForm((current) => ({ ...current, plannedDistance: e.target.value }))} />
          <Input label="Revenue" type="number" value={form.revenue} onChange={(e) => setForm((current) => ({ ...current, revenue: e.target.value }))} />
          <TextArea label="Notes" value={form.notes} onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={() => void createTrip()}>Create Draft</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

