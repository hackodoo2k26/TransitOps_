import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  CheckCircle2,
  Wrench,
  Route,
  Clock,
  UserRound,
  BarChart3,
  RotateCw,
  Download,
  Fuel,
  Activity,
  type LucideIcon,
} from "lucide-react";

// Loading skeleton helper declared outside render to prevent recreation of component
function Skeleton({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse bg-neutral-800/60 rounded-md ${className}`}
    />
  );
}

import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { fadeIn, fadeUp, staggerChildren, scaleIn } from "../lib/motion";
import api, { getStoredTokens } from "../lib/api";

// Mock Data
interface Trip {
  id: string;
  vehicle: string;
  driver: string;
  status: "draft" | "dispatched" | "completed" | "cancelled";
  eta: string;
}

const mockTrips: Trip[] = [
  {
    id: "TRIP-1042",
    vehicle: "TRK-084 (Volvo FH16)",
    driver: "Marcus Vance",
    status: "dispatched",
    eta: "2.5 hrs",
  },
  {
    id: "TRIP-1041",
    vehicle: "VAN-023 (Ford Transit)",
    driver: "Sarah Connor",
    status: "completed",
    eta: "Completed",
  },
  {
    id: "TRIP-1040",
    vehicle: "BUS-005 (Mercedes Citaro)",
    driver: "David Miller",
    status: "dispatched",
    eta: "45 mins",
  },
  {
    id: "TRIP-1039",
    vehicle: "TRK-112 (Scania R500)",
    driver: "Elena Rostova",
    status: "cancelled",
    eta: "--",
  },
  {
    id: "TRIP-1038",
    vehicle: "VAN-012 (Ram ProMaster)",
    driver: "John Doe",
    status: "draft",
    eta: "Scheduled",
  },
];

interface VehicleStatusData {
  label: string;
  count: number;
  percentage: number;
  colorClass: string;
}

const vehicleStatuses: VehicleStatusData[] = [
  {
    label: "Available",
    count: 42,
    percentage: 40,
    colorClass: "bg-emerald-500",
  },
  { label: "On Trip", count: 53, percentage: 50, colorClass: "bg-orange-500" },
  { label: "Maintenance", count: 5, percentage: 5, colorClass: "bg-amber-500" },
  { label: "Retired", count: 5, percentage: 5, colorClass: "bg-rose-500" },
];

interface ActivityItem {
  id: string;
  message: string;
  time: string;
  icon: LucideIcon;
  iconColor: string;
}

const mockActivities: ActivityItem[] = [
  {
    id: "act-1",
    message: "Vehicle VAN-05 dispatched to Route 9",
    time: "10 mins ago",
    icon: Route,
    iconColor: "text-orange-500",
  },
  {
    id: "act-2",
    message: "Maintenance completed for TRK-084 (Oil change & brake service)",
    time: "1 hr ago",
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
  },
  {
    id: "act-3",
    message: "Driver Alex Mercer assigned to TRIP-1043",
    time: "2 hrs ago",
    icon: UserRound,
    iconColor: "text-sky-500",
  },
  {
    id: "act-4",
    message: "Fuel log added: 120L ($186.50) for BUS-012",
    time: "3 hrs ago",
    icon: Fuel,
    iconColor: "text-amber-500",
  },
  {
    id: "act-5",
    message: "Completed trip TRIP-1037 from New York to Philadelphia",
    time: "5 hrs ago",
    icon: Truck,
    iconColor: "text-emerald-500",
  },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState<
    "standard" | "loading" | "empty" | "error"
  >("standard");
  const [loadingData, setLoadingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dashboardOrg, setDashboardOrg] = useState<any | null>(null);
  const [dashboardGlobal, setDashboardGlobal] = useState<any | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] =
    useState<boolean>(!!getStoredTokens());
  const [vehicleType, setVehicleType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [dateRange, setDateRange] = useState("7d");

  // Simulate refresh loading state
  const handleRefresh = () => {
    // trigger a real refresh of dashboard data
    fetchDashboard();
  };

  // Handle fake export
  const handleExport = () => {
    alert("Exporting dashboard metrics to CSV...");
  };

  const fetchDashboard = async () => {
    setLoadingData(true);
    setViewState("loading");
    setErrorMsg(null);
    try {
      const org = await api.getDashboardOrganization();
      const global = await api.getDashboardGlobal();
      setDashboardOrg(org);
      setDashboardGlobal(global);
      setViewState("standard");
    } catch (err: any) {
      if (err?.message === "unauthorized") {
        setIsAuthenticated(false);
        setShowLogin(true);
      } else {
        setErrorMsg(err?.message ?? String(err));
        setViewState("error");
      }
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboard();
    } else {
      // show login hint but keep UI usable
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      await api.login(email, password);
      setIsAuthenticated(true);
      setShowLogin(false);
      fetchDashboard();
    } catch (err: any) {
      alert("Login failed: " + (err?.message || "unknown"));
    }
  };

  return (
    <motion.div
      animate="visible"
      className="space-y-6"
      initial="hidden"
      variants={fadeIn}
    >
      {/* Top Filter and Controls Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between bg-neutral-900/30 p-4 rounded-xl border border-white/[0.04] backdrop-blur-md">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 flex-1 max-w-5xl">
          <Select
            label="Vehicle Type"
            onChange={(e) => setVehicleType(e.target.value)}
            value={vehicleType}
          >
            <option value="all">All Types</option>
            <option value="truck">Trucks</option>
            <option value="van">Vans</option>
            <option value="bus">Buses</option>
          </Select>

          <Select
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
            value={statusFilter}
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="ontrip">On Trip</option>
            <option value="shop">In Shop</option>
          </Select>

          <Select
            label="Region"
            onChange={(e) => setRegionFilter(e.target.value)}
            value={regionFilter}
          >
            <option value="all">All Regions</option>
            <option value="north">North</option>
            <option value="south">South</option>
            <option value="east">East</option>
            <option value="west">West</option>
          </Select>

          <Select
            label="Date Range"
            onChange={(e) => setDateRange(e.target.value)}
            value={dateRange}
          >
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="ytd">Year to Date</option>
          </Select>

          {/* State Simulator Dropdown */}
          <Select
            className="border-orange-500/40 text-orange-400 focus:border-orange-500"
            label="State Simulator"
            onChange={(e) =>
              setViewState(
                e.target.value as "standard" | "loading" | "empty" | "error",
              )
            }
            value={viewState}
          >
            <option value="standard">Standard View</option>
            <option value="loading">Loading Skeleton</option>
            <option value="empty">Empty State</option>
            <option value="error">Error State</option>
          </Select>
        </div>

        <div className="flex gap-2 self-end lg:self-auto">
          <Button
            aria-label="Back to Home"
            className="h-11"
            onClick={() => navigate("/")}
            variant="secondary"
          >
            <span>Home</span>
          </Button>
          <Button
            aria-label={isAuthenticated ? "Logout" : "Login"}
            className="h-11"
            onClick={async () => {
              if (isAuthenticated) {
                await api.logout();
                setIsAuthenticated(false);
                setDashboardOrg(null);
                setDashboardGlobal(null);
              } else {
                setShowLogin(true);
              }
            }}
            variant="ghost"
          >
            <span>{isAuthenticated ? "Logout" : "Login"}</span>
          </Button>
          <Button
            aria-label="Refresh Data"
            className="h-11"
            onClick={handleRefresh}
            variant="secondary"
          >
            <RotateCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button
            aria-label="Export Data"
            className="h-11"
            onClick={handleExport}
            variant="outline"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <div className="flex items-center text-xs text-neutral-400 pl-2">
            {isAuthenticated ? (
              <span>Connected to backend</span>
            ) : (
              <span>Not connected</span>
            )}
            <span style={{ display: "none" }}>
              {loadingData ? "loading" : ""}
              {dashboardOrg ? JSON.stringify(dashboardOrg) : ""}
              {dashboardGlobal ? JSON.stringify(dashboardGlobal) : ""}
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Loading State */}
        {viewState === "loading" && (
          <motion.div
            key="loading"
            animate="visible"
            className="space-y-6"
            exit="hidden"
            initial="hidden"
            variants={fadeIn}
          >
            {/* KPI Skeletons */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <Card
                  className="h-32 flex flex-col justify-between"
                  key={i}
                  variant="glass"
                >
                  <div className="flex justify-between items-start">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="w-12 h-4" />
                  </div>
                  <Skeleton className="w-16 h-8" />
                  <Skeleton className="w-20 h-4" />
                </Card>
              ))}
            </div>

            {/* Main Content Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card
                  className="h-[400px] flex flex-col justify-between"
                  variant="glass"
                >
                  <Skeleton className="w-48 h-6" />
                  <div className="space-y-3 flex-1 mt-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton className="w-full h-10" key={i} />
                    ))}
                  </div>
                </Card>
              </div>
              <div>
                <Card
                  className="h-[400px] flex flex-col justify-between"
                  variant="glass"
                >
                  <Skeleton className="w-36 h-6" />
                  <div className="space-y-6 flex-1 mt-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div className="space-y-2" key={i}>
                        <div className="flex justify-between">
                          <Skeleton className="w-20 h-4" />
                          <Skeleton className="w-8 h-4" />
                        </div>
                        <Skeleton className="w-full h-3 rounded-full" />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {viewState === "empty" && (
          <motion.div
            key="empty"
            animate="visible"
            exit="hidden"
            initial="hidden"
            variants={scaleIn}
          >
            <Card
              className="py-20 flex justify-center items-center"
              variant="glass"
            >
              <EmptyState
                action={
                  <Button
                    onClick={() => setViewState("standard")}
                    variant="primary"
                  >
                    Reload Mock Data
                  </Button>
                }
                description="No vehicle logs or trip activity were found for the selected filter parameters."
                title="No Dashboard Records Found"
              />
            </Card>
          </motion.div>
        )}

        {/* Error State */}
        {viewState === "error" && (
          <motion.div
            key="error"
            animate="visible"
            exit="hidden"
            initial="hidden"
            variants={scaleIn}
          >
            <Card
              className="py-20 flex justify-center items-center border-rose-500/20"
              variant="glass"
            >
              <ErrorState
                action={
                  <Button
                    onClick={() => setViewState("standard")}
                    variant="primary"
                  >
                    Try Again
                  </Button>
                }
                description={
                  errorMsg ??
                  "The application encountered an unexpected failure fetching the fleet metrics telemetry database."
                }
                title="Failed to Load Dashboard Data"
              />
            </Card>
          </motion.div>
        )}

        {/* Standard View State */}
        {viewState === "standard" && (
          <motion.div
            key="standard"
            animate="visible"
            className="space-y-6"
            exit="hidden"
            initial="hidden"
            variants={staggerChildren}
          >
            {/* KPI Cards row */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {[
                {
                  label: "Active Vehicles",
                  value: "53",
                  trend: "+6%",
                  icon: Truck,
                  trendVariant: "success" as const,
                },
                {
                  label: "Available Vehicles",
                  value: "42",
                  trend: "+3%",
                  icon: CheckCircle2,
                  trendVariant: "success" as const,
                },
                {
                  label: "Vehicles In Maint.",
                  value: "5",
                  trend: "Attention",
                  icon: Wrench,
                  trendVariant: "warning" as const,
                },
                {
                  label: "Active Trips",
                  value: "18",
                  trend: "Active",
                  icon: Route,
                  trendVariant: "accent" as const,
                },
                {
                  label: "Pending Trips",
                  value: "9",
                  trend: "Awaiting",
                  icon: Clock,
                  trendVariant: "neutral" as const,
                },
                {
                  label: "Drivers On Duty",
                  value: "26",
                  trend: "92% Active",
                  icon: UserRound,
                  trendVariant: "success" as const,
                },
                {
                  label: "Fleet Util.",
                  value: "87%",
                  trend: "Optimal",
                  icon: BarChart3,
                  trendVariant: "success" as const,
                },
              ].map((card) => (
                <motion.div key={card.label} variants={fadeUp}>
                  <Card
                    className="group relative overflow-hidden p-4 h-full flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-[0_8px_30px_rgb(249,115,22,0.06)]"
                    variant="glass"
                  >
                    {/* Subtle Gradient Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.02] to-transparent pointer-events-none" />

                    <div className="flex justify-between items-start mb-2">
                      <span className="p-2 rounded-lg bg-orange-500/5 text-orange-400 group-hover:bg-orange-500/10 group-hover:text-orange-300 transition-colors">
                        <card.icon size={18} />
                      </span>
                      <Badge variant={card.trendVariant}>{card.trend}</Badge>
                    </div>

                    <div className="mt-2">
                      <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider line-clamp-1">
                        {card.label}
                      </p>
                      <h3 className="text-2xl font-bold mt-0.5 tracking-tight text-white">
                        {card.value}
                      </h3>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2/3 - Recent Trips Table */}
              <motion.div className="lg:col-span-2" variants={fadeUp}>
                <Card
                  className="h-full flex flex-col overflow-hidden"
                  variant="glass"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-semibold text-white">
                        Recent Trips
                      </h2>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Real-time status of active and planned dispatches
                      </p>
                    </div>
                    <Badge variant="accent">Live Feed</Badge>
                  </div>

                  <div className="overflow-x-auto -mx-6">
                    <div className="inline-block min-w-full align-middle px-6">
                      <table className="min-w-full divide-y divide-white/[0.06] text-left">
                        <thead>
                          <tr className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                            <th className="py-3 px-4">Trip ID</th>
                            <th className="py-3 px-4">Vehicle</th>
                            <th className="py-3 px-4">Driver</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">ETA / Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04] text-sm">
                          {mockTrips.map((trip) => (
                            <tr
                              className="hover:bg-white/[0.02] transition-colors"
                              key={trip.id}
                            >
                              <td className="py-3.5 px-4 font-mono font-medium text-orange-400">
                                {trip.id}
                              </td>
                              <td className="py-3.5 px-4 text-neutral-200">
                                {trip.vehicle}
                              </td>
                              <td className="py-3.5 px-4 text-neutral-300">
                                {trip.driver}
                              </td>
                              <td className="py-3.5 px-4">
                                <Badge
                                  variant={
                                    trip.status === "completed"
                                      ? "success"
                                      : trip.status === "dispatched"
                                        ? "accent"
                                        : trip.status === "cancelled"
                                          ? "error"
                                          : "neutral"
                                  }
                                >
                                  {trip.status}
                                </Badge>
                              </td>
                              <td className="py-3.5 px-4 text-right text-neutral-400 font-medium">
                                {trip.eta}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Right 1/3 - Vehicle Status Progress Bars */}
              <motion.div variants={fadeUp}>
                <Card
                  className="h-full flex flex-col justify-between"
                  variant="glass"
                >
                  <div>
                    <h2 className="text-base font-semibold text-white">
                      Vehicle Status
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Fleet distribution and availability overview
                    </p>
                  </div>

                  <div className="space-y-5 my-6">
                    {vehicleStatuses.map((status) => (
                      <div className="space-y-2" key={status.label}>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-neutral-300">
                            {status.label}
                          </span>
                          <span className="font-semibold text-neutral-200">
                            {status.count}{" "}
                            <span className="text-xs text-neutral-500 font-normal">
                              ({status.percentage}%)
                            </span>
                          </span>
                        </div>
                        <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden">
                          <motion.div
                            animate={{ width: `${status.percentage}%` }}
                            className={`h-full rounded-full ${status.colorClass}`}
                            initial={{ width: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-orange-500/5 rounded-lg border border-orange-500/10 flex items-center gap-3">
                    <Activity className="h-5 w-5 text-orange-400 shrink-0 animate-pulse" />
                    <p className="text-xs text-neutral-300">
                      Total Active Fleet tracking is currently operating at
                      nominal capacities.
                    </p>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fleet Health */}
              <motion.div variants={fadeUp}>
                <Card className="h-full flex flex-col" variant="glass">
                  <div className="mb-4">
                    <h2 className="text-base font-semibold text-white">
                      Fleet Health Indices
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Asset health indexes and metric trackers
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 my-auto">
                    {[
                      {
                        label: "Maintenance Due",
                        value: "2 Vehicles",
                        percentage: 90,
                        desc: "90% Safe Rating",
                      },
                      {
                        label: "Vehicles Active",
                        value: "53 Active",
                        percentage: 85,
                        desc: "85% Operating",
                      },
                      {
                        label: "Average Age",
                        value: "3.2 Years",
                        percentage: 75,
                        desc: "75% Lifespan Index",
                      },
                      {
                        label: "Fuel Efficiency",
                        value: "8.4 km/L",
                        percentage: 92,
                        desc: "92% Performance",
                      },
                    ].map((metric) => (
                      <div className="space-y-2" key={metric.label}>
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs text-neutral-400 font-medium">
                            {metric.label}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-white leading-none">
                          {metric.value}
                        </div>
                        <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                          <motion.div
                            animate={{ width: `${metric.percentage}%` }}
                            className="h-full bg-orange-500 rounded-full"
                            initial={{ width: 0 }}
                            transition={{
                              duration: 0.8,
                              ease: "easeOut",
                              delay: 0.1,
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-neutral-500 font-semibold">
                          {metric.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Recent Activity Timeline */}
              <motion.div variants={fadeUp}>
                <Card className="h-full" variant="glass">
                  <div className="mb-4">
                    <h2 className="text-base font-semibold text-white">
                      Recent Activity
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Chronological operations log telemetry
                    </p>
                  </div>

                  <div className="flow-root">
                    <ul className="-mb-8">
                      {mockActivities.map((act, actIdx) => {
                        const Icon = act.icon;
                        return (
                          <li key={act.id}>
                            <div className="relative pb-6">
                              {actIdx !== mockActivities.length - 1 ? (
                                <span
                                  aria-hidden="true"
                                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-white/[0.06]"
                                />
                              ) : null}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span
                                    className={`h-8 w-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center ${act.iconColor}`}
                                  >
                                    <Icon className="h-4 w-4" />
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                                  <div>
                                    <p className="text-sm text-neutral-200">
                                      {act.message}
                                    </p>
                                  </div>
                                  <div className="text-right text-xs whitespace-nowrap text-neutral-400 self-center">
                                    {act.time}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Modal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        title="Sign in to backend"
      >
        <form onSubmit={handleLogin} className="p-4 space-y-4">
          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="flex justify-end">
            <Button type="submit" variant="primary">
              Sign in
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
