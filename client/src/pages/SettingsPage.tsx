import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'

export function SettingsPage() {
  const { user, checkSession } = useAuth()
  const [saved, setSaved] = useState(false)
  const [companyName, setCompanyName] = useState(user?.organizationId ? 'TransitOps Organization' : 'TransitOps')

  const refreshProfile = async () => {
    await checkSession()
    setSaved(true)
  }

  return (
    <Card variant="glass" className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Settings</h2>
        <p className="text-sm text-neutral-400">Current session and frontend environment.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-neutral-400">Company Name</label>
            <input className="ui-input mt-1" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button variant="primary" onClick={() => setSaved(true)}>Save Local Setting</Button>
            <Button variant="secondary" onClick={() => void refreshProfile()}>Refresh Session</Button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-sm text-neutral-400">Current User</div>
            <div className="text-white">{user?.name ?? '-'}</div>
          </div>
          <div>
            <div className="text-sm text-neutral-400">Email</div>
            <div className="text-white">{user?.email ?? '-'}</div>
          </div>
          <div>
            <div className="text-sm text-neutral-400">Roles</div>
            <div className="text-white">{user?.roles.join(', ') ?? '-'}</div>
          </div>
          <div>
            <div className="text-sm text-neutral-400">API URL</div>
            <div className="text-white">{import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}</div>
          </div>
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
  )
}
