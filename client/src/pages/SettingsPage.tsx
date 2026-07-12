import { useState } from "react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";

export function SettingsPage() {
  const [companyName, setCompanyName] = useState("TransitOps");
  const [saved, setSaved] = useState(false);

  return (
    <Card variant="glass" className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Settings</h2>
        <p className="text-sm text-neutral-400">
          Application settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-neutral-400">Company Name</label>
          <input
            className="ui-input mt-1"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button variant="primary" onClick={() => setSaved(true)}>
            Save Settings
          </Button>
        </div>
      </div>
      <Modal
        title="Settings Saved"
        isOpen={saved}
        onClose={() => setSaved(false)}
      >
        <div className="p-4">Settings saved successfully.</div>
      </Modal>
    </Card>
  );
}
