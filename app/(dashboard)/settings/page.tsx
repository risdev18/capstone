import { Settings, Bell, Shield } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-fg)' }}>
          Manage your application preferences and settings.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          <p className="text-sm mb-4" style={{ color: 'var(--muted-fg)' }}>
            Configure how you want to receive alerts and medication reminders.
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border)' }}>
              <div>
                <p className="font-medium">Email Alerts</p>
                <p className="text-xs" style={{ color: 'var(--muted-fg)' }}>Receive critical alerts via email</p>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-xs" style={{ color: 'var(--muted-fg)' }}>Receive alerts on this device</p>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-sky-500" />
            <h2 className="text-lg font-semibold">Privacy & Security</h2>
          </div>
          <p className="text-sm" style={{ color: 'var(--muted-fg)' }}>
            Your health data is securely encrypted and stored in Firebase. Additional data sharing controls will appear here in a future update.
          </p>
        </div>
      </div>
    </div>
  );
}
