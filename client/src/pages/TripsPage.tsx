import { useState } from "react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";

interface Trip {
  id: string;
  origin: string;
  destination: string;
  vehicle?: string;
  driver?: string;
  status: "planned" | "ongoing" | "completed" | "cancelled";
}

const initialTrips: Trip[] = [
  {
    id: "T-1001",
    origin: "Warehouse A",
    destination: "Client X",
    vehicle: "V-084",
    driver: "D-011",
    status: "ongoing",
  },
  {
    id: "T-1002",
    origin: "Depot 3",
    destination: "Site Y",
    vehicle: "V-023",
    driver: "D-001",
    status: "planned",
  },
  {
    id: "T-0998",
    origin: "Hub",
    destination: "Terminal",
    vehicle: undefined,
    driver: undefined,
    status: "completed",
  },
];

export function TripsPage() {
  const [q, setQ] = useState("");
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Trip | null>(null);
  const [viewing, setViewing] = useState<Trip | null>(null);

  const list = trips.filter((t) =>
    `${t.id} ${t.origin} ${t.destination}`
      .toLowerCase()
      .includes(q.toLowerCase()),
  );

  function handleCreate(payload: Omit<Trip, "id">) {
    const id = `T-${Math.floor(Math.random() * 9000 + 1000)}`;
    setTrips((s) => [{ id, ...payload }, ...s]);
    setCreateOpen(false);
  }

  function handleUpdate(updated: Trip) {
    setTrips((s) => s.map((t) => (t.id === updated.id ? updated : t)));
    setEditing(null);
    setViewing(updated);
  }

  return (
    <>
      <Card variant="glass" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Trips</h2>
            <p className="text-sm text-neutral-400">Trip records and status</p>
          </div>
          <div className="flex gap-2">
            <input
              placeholder="Search trips"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="ui-input"
            />
            <Button variant="primary" onClick={() => setCreateOpen(true)}>
              Create Trip
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-neutral-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-2 px-3">Trip</th>
                <th className="py-2 px-3">Origin</th>
                <th className="py-2 px-3">Destination</th>
                <th className="py-2 px-3">Vehicle</th>
                <th className="py-2 px-3">Driver</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {list.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 px-3 font-mono text-orange-400">
                    {t.id}
                  </td>
                  <td className="py-3 px-3">{t.origin}</td>
                  <td className="py-3 px-3">{t.destination}</td>
                  <td className="py-3 px-3">{t.vehicle ?? "-"}</td>
                  <td className="py-3 px-3">{t.driver ?? "-"}</td>
                  <td className="py-3 px-3">
                    <Badge
                      variant={
                        t.status === "ongoing"
                          ? "accent"
                          : t.status === "completed"
                            ? "success"
                            : t.status === "cancelled"
                              ? "error"
                              : "neutral"
                      }
                    >
                      {t.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => setViewing(t)}>
                        View
                      </Button>
                      <Button variant="outline" onClick={() => setEditing(t)}>
                        Edit
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        title="Create Trip"
        isOpen={isCreateOpen}
        onClose={() => setCreateOpen(false)}
      >
        <TripForm
          onCancel={() => setCreateOpen(false)}
          onSave={(p) => handleCreate(p)}
        />
      </Modal>

      <Modal
        title="Edit Trip"
        isOpen={!!editing}
        onClose={() => setEditing(null)}
      >
        {editing && (
          <TripForm
            trip={editing}
            onCancel={() => setEditing(null)}
            onSave={(t) => handleUpdate(t as Trip)}
          />
        )}
      </Modal>

      <Modal
        title="Trip Details"
        isOpen={!!viewing}
        onClose={() => setViewing(null)}
      >
        {viewing && (
          <div className="p-4">
            <div className="text-sm text-neutral-400">Trip ID</div>
            <div className="font-mono text-orange-400">{viewing.id}</div>
            <div className="mt-3 text-sm text-neutral-400">Route</div>
            <div>
              {viewing.origin} → {viewing.destination}
            </div>
            <div className="mt-3 text-sm text-neutral-400">Vehicle</div>
            <div>{viewing.vehicle ?? "-"}</div>
            <div className="mt-3 text-sm text-neutral-400">Driver</div>
            <div>{viewing.driver ?? "-"}</div>
          </div>
        )}
      </Modal>
    </>
  );
}

function TripForm({
  trip,
  onSave,
  onCancel,
}: {
  trip?: Trip;
  onSave: (t: Trip | Omit<Trip, "id">) => void;
  onCancel: () => void;
}) {
  const [origin, setOrigin] = useState(trip?.origin ?? "");
  const [destination, setDestination] = useState(trip?.destination ?? "");
  const [vehicle, setVehicle] = useState(trip?.vehicle ?? "");
  const [driver, setDriver] = useState(trip?.driver ?? "");
  const [status] = useState<Trip["status"]>(trip?.status ?? "planned");

  function save() {
    if (trip)
      onSave({ ...trip, origin, destination, vehicle, driver, status } as Trip);
    else
      onSave({ origin, destination, vehicle, driver, status } as Omit<
        Trip,
        "id"
      >);
  }

  return (
    <div className="p-4 space-y-3">
      <div>
        <label className="block text-sm text-neutral-400">Origin</label>
        <input
          className="ui-input mt-1"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm text-neutral-400">Destination</label>
        <input
          className="ui-input mt-1"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm text-neutral-400">Vehicle</label>
        <input
          className="ui-input mt-1"
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm text-neutral-400">Driver</label>
        <input
          className="ui-input mt-1"
          value={driver}
          onChange={(e) => setDriver(e.target.value)}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={save}>
          Save
        </Button>
      </div>
    </div>
  );
}
