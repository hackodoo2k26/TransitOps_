import { useState } from "react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";

interface Maintenance {
  id: string;
  vehicle: string;
  type: string;
  dueDate?: string;
  status: "scheduled" | "in_progress" | "done";
}

const initialMaint: Maintenance[] = [
  {
    id: "M-200",
    vehicle: "V-005",
    type: "Engine check",
    dueDate: "2026-07-10",
    status: "scheduled",
  },
  {
    id: "M-199",
    vehicle: "V-084",
    type: "Tire replacement",
    dueDate: "2026-06-12",
    status: "done",
  },
];
export function MaintenancePage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Maintenance[]>(initialMaint);
  const [isScheduleOpen, setScheduleOpen] = useState(false);
  const [viewing, setViewing] = useState<Maintenance | null>(null);

  const list = items.filter((m) =>
    `${m.id} ${m.vehicle} ${m.type}`.toLowerCase().includes(q.toLowerCase()),
  );

  function handleSchedule(payload: Omit<Maintenance, "id">) {
    const id = `M-${Math.floor(Math.random() * 900 + 100)}`;
    setItems((s) => [{ id, ...payload }, ...s]);
    setScheduleOpen(false);
  }

  function markDone(id: string) {
    setItems((s) => s.map((m) => (m.id === id ? { ...m, status: "done" } : m)));
  }

  return (
    <>
      <Card variant="glass" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Maintenance</h2>
            <p className="text-sm text-neutral-400">
              Maintenance schedule and history
            </p>
          </div>
          <div className="flex gap-2">
            <input
              placeholder="Search maintenance"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="ui-input"
            />
            <Button variant="primary" onClick={() => setScheduleOpen(true)}>
              Schedule
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-neutral-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-2 px-3">ID</th>
                <th className="py-2 px-3">Vehicle</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Due</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {list.map((m) => (
                <tr
                  key={m.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 px-3 font-mono text-orange-400">
                    {m.id}
                  </td>
                  <td className="py-3 px-3">{m.vehicle}</td>
                  <td className="py-3 px-3">{m.type}</td>
                  <td className="py-3 px-3">{m.dueDate ?? "-"}</td>
                  <td className="py-3 px-3">
                    <Badge
                      variant={
                        m.status === "done"
                          ? "success"
                          : m.status === "in_progress"
                            ? "accent"
                            : "neutral"
                      }
                    >
                      {m.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => setViewing(m)}>
                        View
                      </Button>
                      <Button variant="outline" onClick={() => markDone(m.id)}>
                        Mark Done
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
        title="Schedule Maintenance"
        isOpen={isScheduleOpen}
        onClose={() => setScheduleOpen(false)}
      >
        <MaintenanceForm
          onCancel={() => setScheduleOpen(false)}
          onSave={(p) => handleSchedule(p)}
        />
      </Modal>

      <Modal
        title="Maintenance Details"
        isOpen={!!viewing}
        onClose={() => setViewing(null)}
      >
        {viewing && (
          <div className="p-4">
            <div className="text-sm text-neutral-400">ID</div>
            <div className="font-mono text-orange-400">{viewing.id}</div>
            <div className="mt-3 text-sm text-neutral-400">Vehicle</div>
            <div>{viewing.vehicle}</div>
            <div className="mt-3 text-sm text-neutral-400">Type</div>
            <div>{viewing.type}</div>
            <div className="mt-3 text-sm text-neutral-400">Due</div>
            <div>{viewing.dueDate ?? "-"}</div>
          </div>
        )}
      </Modal>
    </>
  );
}

function MaintenanceForm({
  onSave,
  onCancel,
}: {
  onSave: (m: Omit<Maintenance, "id">) => void;
  onCancel: () => void;
}) {
  const [vehicle, setVehicle] = useState("");
  const [type, setType] = useState("");
  const [dueDate, setDueDate] = useState("");

  return (
    <div className="p-4 space-y-3">
      <div>
        <label className="block text-sm text-neutral-400">Vehicle</label>
        <input
          className="ui-input mt-1"
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm text-neutral-400">Type</label>
        <input
          className="ui-input mt-1"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm text-neutral-400">Due Date</label>
        <input
          className="ui-input mt-1"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() =>
            onSave({ vehicle, type, dueDate, status: "scheduled" })
          }
        >
          Schedule
        </Button>
      </div>
    </div>
  );
}
