import { useEffect, useState } from 'react'
import { BarChart3, Building2, Route, ShieldAlert, Truck, UserRound, Wrench } from 'lucide-react'

import { useAuth } from '../hooks/useAuth'
import { hasAnyRole } from '../lib/access'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { Badge } from '../components/ui/Badge'
import { transitopsService } from '../services/transitops/transitops.service'
import type { GlobalDashboard, OrganizationDashboard, Trip } from '../services/transitops/transitops.types'

type KpiCard = {
  label: string
  value: string
  icon: typeof Truck
  variant?: 'neutral' | 'accent' | 'success' | 'warning' | 'error'
}

export function DashboardPage() {
  const { user } = useAuth()
  const [organizationDashboard, setOrganizationDashboard] = useState<OrganizationDashboard | null>(null)
  const [globalDashboard, setGlobalDashboard] = useState<GlobalDashboard | null>(null)
  const [recentTrips, setRecentTrips] = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const canReadTrips = hasAnyRole(user, ['DISPATCHER', 'FLEET_MANAGER', 'FINANCIAL_ANALYST'])
  const isOrgUser = Boolean(user?.organizationId)

  const loadDashboard = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (user?.isSuperAdmin && !user.organizationId) {
        const global = await transitopsService.getGlobalDashboard()
        setGlobalDashboard(global)
        setOrganizationDashboard(null)
        setRecentTrips([])
      } else {
        const [orgDashboard, trips] = await Promise.all([
          transitopsService.getOrganizationDashboard(),
          canReadTrips ? transitopsService.listTrips(undefined, 'all') : Promise.resolve([]),
        ])
        setOrganizationDashboard(orgDashboard)
        setRecentTrips((trips as Trip[]).slice(0, 5))
        setGlobalDashboard(null)
      }
    } catch (err) {
      const apiError = err as { message?: string }
      setError(apiError.message || 'Failed to load dashboard data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadDashboard()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card variant="glass" className="p-6 text-neutral-300">Loading dashboard...</Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card variant="glass" className="p-6">
        <ErrorState
          title="Unable to load dashboard"
          description={error}
          action={<Button onClick={() => void loadDashboard()}>Retry</Button>}
        />
      </Card>
    )
  }

  if (user?.isSuperAdmin && !isOrgUser) {
    const globalCards: KpiCard[] = [
      { label: 'Organizations', value: String(globalDashboard?.totalOrganizations ?? 0), icon: Building2, variant: 'accent' },
      { label: 'Active', value: String(globalDashboard?.activeOrganizations ?? 0), icon: Truck, variant: 'success' },
      { label: 'Suspended', value: String(globalDashboard?.suspendedOrganizations ?? 0), icon: ShieldAlert, variant: 'warning' },
    ]

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Global Dashboard</h2>
            <p className="text-sm text-neutral-400">You are signed in as super admin without an organization context.</p>
          </div>
          <Button variant="secondary" onClick={() => void loadDashboard()}>
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {globalCards.map((card) => (
            <Card key={card.label} variant="glass" className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <card.icon className="h-5 w-5 text-orange-400" />
                <Badge variant={card.variant}>{card.label}</Badge>
              </div>
              <div className="text-3xl font-bold text-white">{card.value}</div>
            </Card>
          ))}
        </div>

        <Card variant="glass" className="p-6">
          <EmptyState
            title="Organization-scoped pages need an organization user"
            description="Log in as a fleet manager, dispatcher, safety officer, or financial analyst to view fleet operations data."
          />
        </Card>
      </div>
    )
  }

  const cards: KpiCard[] = [
    { label: 'Vehicles Available', value: String(organizationDashboard?.vehicleStats.available ?? 0), icon: Truck, variant: 'success' },
    { label: 'Vehicles On Trip', value: String(organizationDashboard?.vehicleStats.onTrip ?? 0), icon: Route, variant: 'accent' },
    { label: 'Vehicles In Shop', value: String(organizationDashboard?.vehicleStats.inShop ?? 0), icon: Wrench, variant: 'warning' },
    { label: 'Drivers Available', value: String(organizationDashboard?.driverStats.available ?? 0), icon: UserRound, variant: 'success' },
    { label: 'Drivers On Trip', value: String(organizationDashboard?.driverStats.onTrip ?? 0), icon: Route, variant: 'accent' },
    { label: 'Pending Trips', value: String(organizationDashboard?.tripStats.pending ?? 0), icon: BarChart3, variant: 'neutral' },
    { label: 'Completed Trips', value: String(organizationDashboard?.tripStats.completed ?? 0), icon: BarChart3, variant: 'success' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Operations Dashboard</h2>
          <p className="text-sm text-neutral-400">Live data from your TransitOps backend.</p>
        </div>
        <Button variant="secondary" onClick={() => void loadDashboard()}>
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} variant="glass" className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <card.icon className="h-5 w-5 text-orange-400" />
              <Badge variant={card.variant}>{card.label}</Badge>
            </div>
            <div className="text-3xl font-bold text-white">{card.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="glass" className="p-5">
          <h3 className="text-base font-semibold text-white">Cost Snapshot</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-sm text-neutral-400">Fuel Cost</div>
              <div className="mt-1 text-2xl font-semibold text-white">${organizationDashboard?.costs.fuelCost ?? '0'}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-400">Maintenance Cost</div>
              <div className="mt-1 text-2xl font-semibold text-white">${organizationDashboard?.costs.maintenanceCost ?? '0'}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-400">Expense Cost</div>
              <div className="mt-1 text-2xl font-semibold text-white">${organizationDashboard?.costs.expenseCost ?? '0'}</div>
            </div>
          </div>
        </Card>

        <Card variant="glass" className="p-5">
          <h3 className="text-base font-semibold text-white">Recent Trips</h3>
          {!recentTrips.length ? (
            <div className="mt-4">
              <EmptyState title="No trips found" description="Create or dispatch trips to populate this panel." />
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-neutral-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-3">Trip</th>
                    <th className="py-2 px-3">Route</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {recentTrips.map((trip) => (
                    <tr key={trip.id}>
                      <td className="py-3 px-3 font-mono text-orange-400">#{trip.id}</td>
                      <td className="py-3 px-3">{trip.source} to {trip.destination}</td>
                      <td className="py-3 px-3">
                        <Badge
                          variant={
                            trip.status === 'completed'
                              ? 'success'
                              : trip.status === 'dispatched'
                                ? 'accent'
                                : trip.status === 'cancelled'
                                  ? 'error'
                                  : 'neutral'
                          }
                        >
                          {trip.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Card variant="glass" className="p-5">
        <h3 className="text-base font-semibold text-white">Driver Status</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <div>
            <div className="text-sm text-neutral-400">Available</div>
            <div className="text-2xl font-semibold text-white">{organizationDashboard?.driverStats.available ?? 0}</div>
          </div>
          <div>
            <div className="text-sm text-neutral-400">On Trip</div>
            <div className="text-2xl font-semibold text-white">{organizationDashboard?.driverStats.onTrip ?? 0}</div>
          </div>
          <div>
            <div className="text-sm text-neutral-400">Off Duty</div>
            <div className="text-2xl font-semibold text-white">{organizationDashboard?.driverStats.offDuty ?? 0}</div>
          </div>
          <div>
            <div className="text-sm text-neutral-400">Suspended</div>
            <div className="text-2xl font-semibold text-white">{organizationDashboard?.driverStats.suspended ?? 0}</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
