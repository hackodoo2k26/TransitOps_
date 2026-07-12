import { useState } from "react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";

interface Driver {
  id: string;
  name: string;
  phone?: string;
  assignedVehicle?: string;
  status: "active" | "inactive" | "suspended";
}

const initialDrivers: Driver[] = [
  {
    id: "D-001",
    name: "Alice Morgan",
    phone: "555-0123",
    assignedVehicle: "V-023",
    status: "active",
  },
  {
    id: "D-004",
    name: "Brian Ochoa",
    phone: "555-0789",
    assignedVehicle: undefined,
    status: "inactive",
  },
  {
    id: "D-011",
    name: "Chen Liu",
    phone: "555-0456",
    assignedVehicle: "V-084",
    status: "active",
  },
];

export function DriversPage() {
  const [query, setQuery] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [isAddOpen, setAddOpen] = useState(false);
  const [profile, setProfile] = useState<Driver | null>(null);
  const [assigning, setAssigning] = useState<Driver | null>(null);

  const list = drivers.filter((d) =>
    `${d.name} ${d.id}`.toLowerCase().includes(query.toLowerCase()),
  );

  function handleCreate(payload: Omit<Driver, "id">) {
    const id = `D-${Math.floor(Math.random() * 900 + 100)}`;
    setDrivers((s) => [{ id, ...payload }, ...s]);
    setAddOpen(false);
  }

  function handleAssign(driverId: string, vehicleId: string) {
    setDrivers((s) =>
      s.map((d) =>
        d.id === driverId ? { ...d, assignedVehicle: vehicleId } : d,
      ),
    );
    setAssigning(null);
  }

  return (
    <>
      <Card variant="glass" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Drivers</h2>
            <p className="text-sm text-neutral-400">
              Manage drivers and assignments
            </p>
          </div>
          <div className="flex gap-2">
            <input
              placeholder="Search drivers"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="ui-input"
            />
            <Button variant="primary" onClick={() => setAddOpen(true)}>
              Add Driver
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-neutral-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-2 px-3">ID</th>
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Phone</th>
                <th className="py-2 px-3">Vehicle</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {list.map((d) => (
                <tr
                  key={d.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 px-3 font-mono text-orange-400">
                    {d.id}
                  </td>
                  <td className="py-3 px-3">{d.name}</td>
                  <td className="py-3 px-3">{d.phone}</td>
                  <td className="py-3 px-3">{d.assignedVehicle ?? "-"}</td>
                  <td className="py-3 px-3">
                    <Badge
                      variant={
                        d.status === "active"
                          ? "success"
                          : d.status === "suspended"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {d.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => setProfile(d)}>
                        Profile
                      </Button>
                      <Button variant="outline" onClick={() => setAssigning(d)}>
                        Assign
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
        title="Add Driver"
        isOpen={isAddOpen}
        onClose={() => setAddOpen(false)}
      >
        <DriverForm
          onCancel={() => setAddOpen(false)}
          onSave={(p) => handleCreate(p)}
        />
      </Modal>

      <Modal
        title="Driver Profile"
        isOpen={!!profile}
        onClose={() => setProfile(null)}
      >
        {profile && (
          <div className="p-4">
            <div className="text-sm text-neutral-400">Name</div>
            <div className="font-semibold">{profile.name}</div>
            <div className="mt-3 text-sm text-neutral-400">Phone</div>
            <div>{profile.phone}</div>
            <div className="mt-3 text-sm text-neutral-400">
              Assigned Vehicle
            </div>
            <div>{profile.assignedVehicle ?? "-"}</div>
          </div>
        )}
      </Modal>

      <Modal
        title="Assign Vehicle"
        isOpen={!!assigning}
        onClose={() => setAssigning(null)}
      >
        {assigning && (
          <AssignForm
            driver={assigning}
            onCancel={() => setAssigning(null)}
            onAssign={(vehicleId) => handleAssign(assigning.id, vehicleId)}
          />
        )}
      </Modal>
    </>
  );
}

function DriverForm({
  onSave,
  onCancel,
}: {
  onSave: (d: Omit<Driver, "id">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status] = useState<Driver["status"]>("active");

  return (
    <div className="p-4 space-y-3">
      <div>
        <label className="block text-sm text-neutral-400">Name</label>
        <input
          className="ui-input mt-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm text-neutral-400">Phone</label>
        <input
          className="ui-input mt-1"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => onSave({ name, phone, status })}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

function AssignForm({
  driver,
  onAssign,
  onCancel,
}: {
  driver: Driver;
  onAssign: (vehicleId: string) => void;
  onCancel: () => void;
}) {
  const [vehicleId, setVehicleId] = useState(driver.assignedVehicle ?? "");
  return (
    <div className="p-4 space-y-3">
      <div>
        <label className="block text-sm text-neutral-400">Vehicle ID</label>
        <input
          className="ui-input mt-1"
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => onAssign(vehicleId)}>
          Assign
        </Button>
      </div>
    </div>
  );
}
