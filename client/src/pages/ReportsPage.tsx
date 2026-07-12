import { useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";

export function ReportsPage() {
  const [isGenOpen, setGenOpen] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  function exportCSV() {
    const rows = [
      ["metric", "value"],
      ["total_trips", "1234"],
      ["fuel_cost", "24560"],
      ["active_vehicles", "48"],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function generate() {
    // simple mock generate
    setReport(
      "Report generated: Total Trips 1,234, Fuel Cost $24,560, Active Vehicles 48",
    );
    setGenOpen(true);
  }

  return (
    <>
      <Card variant="glass" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Analytics</h2>
            <p className="text-sm text-neutral-400">
              Overview metrics and reports
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={exportCSV}>
              Export CSV
            </Button>
            <Button variant="primary" onClick={generate}>
              Generate Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4">
            <h3 className="text-sm text-neutral-400">Total Trips</h3>
            <div className="text-2xl font-bold">1,234</div>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm text-neutral-400">Fuel Cost</h3>
            <div className="text-2xl font-bold">$24,560</div>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm text-neutral-400">Active Vehicles</h3>
            <div className="text-2xl font-bold">48</div>
          </Card>
        </div>
      </Card>

      <Modal
        title="Generated Report"
        isOpen={isGenOpen}
        onClose={() => setGenOpen(false)}
      >
        <div className="p-4">
          <pre className="whitespace-pre-wrap">{report}</pre>
        </div>
      </Modal>
    </>
  );
}
