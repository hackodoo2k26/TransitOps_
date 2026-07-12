import { useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";

interface Fuel {
  id: string;
  vehicle: string;
  liters: number;
  cost: number;
  date: string;
}

const initialFuel: Fuel[] = [
  { id: "F-01", vehicle: "V-023", liters: 120, cost: 240, date: "2026-06-15" },
  { id: "F-02", vehicle: "V-084", liters: 300, cost: 600, date: "2026-07-02" },
];

export function FuelExpensesPage() {
  const [q, setQ] = useState("");
  const [logs, setLogs] = useState<Fuel[]>(initialFuel);
  const [isAddOpen, setAddOpen] = useState(false);

  const list = logs.filter((f) =>
    `${f.id} ${f.vehicle}`.toLowerCase().includes(q.toLowerCase()),
  );

  function handleAdd(payload: Omit<Fuel, "id">) {
    const id = `F-${Math.floor(Math.random() * 900 + 10)}`;
    setLogs((s) => [{ id, ...payload }, ...s]);
    setAddOpen(false);
  }

  return (
    <>
      <Card variant="glass" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Fuel & Expenses
            </h2>
            <p className="text-sm text-neutral-400">
              Fuel logs and expense tracking
            </p>
          </div>
          <div className="flex gap-2">
            <input
              placeholder="Search fuel logs"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="ui-input"
            />
            <Button variant="primary" onClick={() => setAddOpen(true)}>
              Add Log
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-neutral-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-2 px-3">ID</th>
                <th className="py-2 px-3">Vehicle</th>
                <th className="py-2 px-3">Liters</th>
                <th className="py-2 px-3">Cost</th>
                <th className="py-2 px-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {list.map((f) => (
                <tr
                  key={f.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 px-3 font-mono text-orange-400">
                    {f.id}
                  </td>
                  <td className="py-3 px-3">{f.vehicle}</td>
                  <td className="py-3 px-3">{f.liters}</td>
                  <td className="py-3 px-3">${f.cost}</td>
                  <td className="py-3 px-3">{f.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        title="Add Fuel Log"
        isOpen={isAddOpen}
        onClose={() => setAddOpen(false)}
      >
        <FuelForm
          onCancel={() => setAddOpen(false)}
          onSave={(p) => handleAdd(p)}
        />
      </Modal>
    </>
  );
}

function FuelForm({
  onSave,
  onCancel,
}: {
  onSave: (f: Omit<Fuel, "id">) => void;
  onCancel: () => void;
}) {
  const [vehicle, setVehicle] = useState("");
  const [liters, setLiters] = useState("");
  const [cost, setCost] = useState("");
  const [date, setDate] = useState("");

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
        <label className="block text-sm text-neutral-400">Liters</label>
        <input
          className="ui-input mt-1"
          value={liters}
          onChange={(e) => setLiters(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm text-neutral-400">Cost</label>
        <input
          className="ui-input mt-1"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm text-neutral-400">Date</label>
        <input
          className="ui-input mt-1"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() =>
            onSave({
              vehicle,
              liters: Number(liters || 0),
              cost: Number(cost || 0),
              date,
            })
          }
        >
          Save
        </Button>
      </div>
    </div>
  );
}
