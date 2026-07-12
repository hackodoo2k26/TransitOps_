import { useState } from "react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  status: "available" | "ontrip" | "maintenance" | "retired";
  lastService: string;
}

const initialVehicles: Vehicle[] = [
  {
    id: "V-084",
    plate: "TRK-084",
    model: "Volvo FH16",
    status: "ontrip",
    lastService: "2026-06-10",
  },
  {
    id: "V-023",
    plate: "VAN-023",
    model: "Ford Transit",
    status: "available",
    lastService: "2026-04-21",
  },
  {
    id: "V-005",
    plate: "BUS-005",
    model: "Mercedes Citaro",
    status: "maintenance",
    lastService: "2026-07-01",
  },
];

export function VehiclesPage() {
  const [query, setQuery] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [isAddOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [viewing, setViewing] = useState<Vehicle | null>(null);

  const list = vehicles.filter((v) =>
    `${v.plate} ${v.model}`.toLowerCase().includes(query.toLowerCase()),
  );

  function handleCreate(payload: Omit<Vehicle, "id">) {
    const id = `V-${Math.floor(Math.random() * 900 + 100)}`;
    setVehicles((s) => [{ id, ...payload }, ...s]);
    setAddOpen(false);
  }

  function handleUpdate(updated: Vehicle) {
    setVehicles((s) => s.map((v) => (v.id === updated.id ? updated : v)));
    setEditing(null);
    setViewing(updated);
  }

  return (
    <>
      <Card variant="glass" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Fleet</h2>
            <p className="text-sm text-neutral-400">
              Manage vehicles and fleet status
            </p>
          </div>
          <div className="flex gap-2">
            <input
              placeholder="Search vehicles"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="ui-input"
            />
            <Button variant="primary" onClick={() => setAddOpen(true)}>
              Add Vehicle
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-neutral-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-2 px-3">ID</th>
                <th className="py-2 px-3">Plate</th>
                <th className="py-2 px-3">Model</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Last Service</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {list.map((v) => (
                <tr
                  key={v.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 px-3 font-mono text-orange-400">
                    {v.id}
                  </td>
                  <td className="py-3 px-3">{v.plate}</td>
                  <td className="py-3 px-3">{v.model}</td>
                  <td className="py-3 px-3">
                    <Badge
                      variant={
                        v.status === "available"
                          ? "success"
                          : v.status === "ontrip"
                            ? "accent"
                            : v.status === "maintenance"
                              ? "warning"
                              : "neutral"
                      }
                    >
                      {v.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3">{v.lastService}</td>
                  <td className="py-3 px-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => setViewing(v)}>
                        View
                      </Button>
                      <Button variant="outline" onClick={() => setEditing(v)}>
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
        title="Add Vehicle"
        isOpen={isAddOpen}
        onClose={() => setAddOpen(false)}
      >
        <VehicleForm
          onCancel={() => setAddOpen(false)}
          onSave={(p) => handleCreate(p)}
        />
      </Modal>

      <Modal
        title={editing ? "Edit Vehicle" : "View Vehicle"}
        isOpen={!!editing}
        onClose={() => setEditing(null)}
      >
        {editing && (
          <VehicleForm
            vehicle={editing}
            onCancel={() => setEditing(null)}
            onSave={(v) => handleUpdate(v as Vehicle)}
          />
        )}
      </Modal>

      <Modal
        title="Vehicle Details"
        isOpen={!!viewing}
        onClose={() => setViewing(null)}
      >
        {viewing && (
          <div className="p-4">
            <div className="text-sm text-neutral-400">ID</div>
            <div className="font-mono text-orange-400">{viewing.id}</div>
            <div className="mt-3 text-sm text-neutral-400">Plate</div>
            <div>{viewing.plate}</div>
            <div className="mt-3 text-sm text-neutral-400">Model</div>
            <div>{viewing.model}</div>
            <div className="mt-3 text-sm text-neutral-400">Status</div>
            <div>
              <Badge
                variant={
                  viewing.status === "available"
                    ? "success"
                    : viewing.status === "ontrip"
                      ? "accent"
                      : viewing.status === "maintenance"
                        ? "warning"
                        : "neutral"
                }
              >
                {viewing.status}
              </Badge>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function VehicleForm({
  vehicle,
  onSave,
  onCancel,
}: {
  vehicle?: Vehicle;
  onSave: (v: Vehicle | Omit<Vehicle, "id">) => void;
  onCancel: () => void;
}) {
  const [plate, setPlate] = useState(vehicle?.plate ?? "");
  const [model, setModel] = useState(vehicle?.model ?? "");
  const [status] = useState<Vehicle["status"]>(vehicle?.status ?? "available");
  const [lastService, setLastService] = useState(vehicle?.lastService ?? "");

  function save() {
    if (vehicle)
      onSave({ ...vehicle, plate, model, status, lastService } as Vehicle);
    else onSave({ plate, model, status, lastService } as Omit<Vehicle, "id">);
  }

  return (
    <div className="p-4 space-y-3">
      <div>
        <label className="block text-sm text-neutral-400">Plate</label>
        <input
          className="ui-input mt-1"
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm text-neutral-400">Model</label>
        <input
          className="ui-input mt-1"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm text-neutral-400">Last Service</label>
        <input
          className="ui-input mt-1"
          value={lastService}
          onChange={(e) => setLastService(e.target.value)}
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
