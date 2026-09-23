'use client';

import { useAuth } from '@/lib/auth/context';
import type { Alert } from '@/types/alert';
import { METRIC_CONFIGS } from '@/types/health';
import { AlertCircle, AlertTriangle, Check, CheckCircle2, Clock, Info } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/health';
import { toast } from '@/components/ui/Toaster';
import { useDemoData } from '@/lib/mock/useDemoData';
import { DemoModeBanner } from '@/components/dashboard/DemoModeBanner';

export default function AlertsPage() {
  const { profile } = useAuth();
  const {
    isDemoMode,
    hasRealHardwareData,
    demoScenario,
    setDemoScenario,
    toggleDemoMode,
    alerts,
    acknowledgeAlert,
  } = useDemoData({
    userId: profile?.uid,
  });

  const handleAcknowledge = async (id: string) => {
    const success = await acknowledgeAlert(id, profile?.name ?? 'Caregiver');
    if (success) {
      toast({
        title: 'Alert Acknowledged',
        description: 'Alert marked as reviewed and moved to audit history.',
        variant: 'success',
      });
    } else {
      toast({ title: 'Error acknowledging alert', variant: 'destructive' });
    }
  };

  const activeAlerts = alerts.filter((a) => a.status === 'UNACKNOWLEDGED');
  const pastAlerts = alerts.filter((a) => a.status !== 'UNACKNOWLEDGED');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Alerts & Notifications</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-fg)' }}>
          Review and manage system alerts based on configured vital thresholds and medication compliance.
        </p>
      </div>

      {/* ── Demo / Simulation Banner ── */}
      <DemoModeBanner
        isDemoMode={isDemoMode}
        hasRealHardwareData={hasRealHardwareData}
        scenario={demoScenario}
        onSelectScenario={setDemoScenario}
        onToggleDemoMode={toggleDemoMode}
      />

      {/* ── Active Alerts ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold">Requires Attention</h2>
          <span className="badge badge-warning text-xs">
            {activeAlerts.length} Unacknowledged
          </span>
        </div>

        {activeAlerts.length === 0 ? (
          <div className="card p-8 text-center rounded-2xl flex flex-col items-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-3" />
            <p className="font-semibold text-base">All clear</p>
            <p className="text-sm text-[var(--muted-fg)] mt-0.5">
              No unacknowledged alerts. All sensor metrics and pill schedules are in optimal ranges.
            </p>
            {isDemoMode && demoScenario === 'normal' && (
              <p className="text-xs text-sky-600 dark:text-sky-400 mt-2 font-medium">
                Tip: Select &quot;Warning&quot; or &quot;Critical&quot; in the banner above to simulate active alert triggers!
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="card rounded-2xl p-5 border-l-4 shadow-sm"
                style={{
                  borderLeftColor:
                    alert.severity === 'CRITICAL'
                      ? 'var(--color-danger)'
                      : alert.severity === 'WARNING'
                      ? 'var(--color-warning)'
                      : 'var(--color-primary)',
                }}
              >
                <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-start">
                  <div className="flex items-start gap-4">
                    {alert.severity === 'CRITICAL' ? (
                      <div className="p-2 bg-red-100 dark:bg-red-900/60 rounded-xl text-red-600 dark:text-red-400">
                        <AlertCircle className="h-6 w-6" />
                      </div>
                    ) : alert.severity === 'WARNING' ? (
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/60 rounded-xl text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="h-6 w-6" />
                      </div>
                    ) : (
                      <div className="p-2 bg-sky-100 dark:bg-sky-900/60 rounded-xl text-sky-600 dark:text-sky-400">
                        <Info className="h-6 w-6" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-base">
                          {alert.metric ? METRIC_CONFIGS[alert.metric]?.label : 'System'} Alert
                        </span>
                        <span
                          className={`badge text-[10px] ${
                            alert.severity === 'CRITICAL'
                              ? 'badge-critical'
                              : alert.severity === 'WARNING'
                              ? 'badge-warning'
                              : 'badge-info'
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed mb-2 text-foreground">{alert.message}</p>
                      <div className="flex items-center gap-4 text-xs font-medium">
                        <div className="flex items-center gap-1.5" style={{ color: 'var(--muted-fg)' }}>
                          <Clock className="h-3.5 w-3.5" />
                          {formatRelativeTime(alert.createdAt)}
                        </div>
                        {alert.value !== undefined && (
                          <div className="bg-[var(--muted)] px-2.5 py-0.5 rounded text-foreground font-mono">
                            Reading: {alert.value} {alert.unit}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="btn btn-primary sm:w-auto w-full gap-1.5 text-xs font-semibold"
                  >
                    <Check className="h-4 w-4" /> Acknowledge
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Past Alerts Log ── */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-semibold border-b pb-2" style={{ borderColor: 'var(--border)' }}>
          Past Alerts & Audit Log
        </h2>
        {pastAlerts.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--muted-fg)' }}>
            No past alerts to show.
          </p>
        ) : (
          <div className="card rounded-2xl overflow-hidden">
            <div className="table-wrapper border-none">
              <table className="table">
                <thead>
                  <tr>
                    <th>Severity</th>
                    <th>Metric / Subject</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Acknowledged</th>
                  </tr>
                </thead>
                <tbody>
                  {pastAlerts.map((alert) => (
                    <tr key={alert.id}>
                      <td>
                        <span
                          className={`badge text-[10px] ${
                            alert.severity === 'CRITICAL'
                              ? 'badge-critical'
                              : alert.severity === 'WARNING'
                              ? 'badge-warning'
                              : 'badge-info'
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </td>
                      <td className="font-semibold text-sm">
                        {alert.metric ? METRIC_CONFIGS[alert.metric]?.label : 'System Hub'}
                      </td>
                      <td className="max-w-md text-xs leading-relaxed" title={alert.message}>
                        {alert.message}
                      </td>
                      <td>
                        <span className="badge badge-normal text-[10px]">
                          {alert.status}
                        </span>
                      </td>
                      <td className="text-xs whitespace-nowrap" style={{ color: 'var(--muted-fg)' }}>
                        {alert.acknowledgedAt ? formatRelativeTime(alert.acknowledgedAt) : 'Pending'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
