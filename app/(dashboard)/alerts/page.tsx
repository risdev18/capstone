'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { db } from '@/lib/firebase/client';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc } from 'firebase/firestore';
import type { Alert } from '@/types/alert';
import { METRIC_CONFIGS } from '@/types/health';
import { AlertCircle, AlertTriangle, Check, CheckCircle2, Clock } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/health';
import { toast } from '@/components/ui/Toaster';

export default function AlertsPage() {
  const { profile } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (!profile?.uid) return;

    const qAlerts = query(collection(db, 'alerts'), where('userId', '==', profile.uid), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(qAlerts, (snap) => {
      setAlerts(snap.docs.map(d => ({ ...d.data(), id: d.id } as Alert)));
    });

    return () => unsub();
  }, [profile?.uid]);

  const handleAcknowledge = async (id: string) => {
    try {
      await updateDoc(doc(db, 'alerts', id), {
        status: 'ACKNOWLEDGED',
        acknowledgedAt: new Date().toISOString()
      });
      toast({ title: 'Alert Acknowledged', variant: 'success' });
    } catch (e) {
      toast({ title: 'Error acknowledging alert', variant: 'destructive' });
    }
  };

  const activeAlerts = alerts.filter(a => a.status === 'UNACKNOWLEDGED');
  const pastAlerts = alerts.filter(a => a.status !== 'UNACKNOWLEDGED');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Alerts & Notifications</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-fg)' }}>
          Review and manage system alerts based on configured health thresholds.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2" style={{ borderColor: 'var(--border)' }}>Requires Attention</h2>
        {activeAlerts.length === 0 ? (
          <div className="card p-8 text-center rounded-2xl flex flex-col items-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-3" />
            <p className="font-medium">All clear</p>
            <p className="text-sm" style={{ color: 'var(--muted-fg)' }}>No unacknowledged alerts.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeAlerts.map(alert => (
              <div key={alert.id} className="card rounded-2xl p-5 border-l-4"
                style={{ borderLeftColor: alert.severity === 'CRITICAL' ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-start">
                  <div className="flex items-start gap-4">
                     {alert.severity === 'CRITICAL' ? (
                        <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full text-red-600 dark:text-red-400">
                           <AlertCircle className="h-6 w-6" />
                        </div>
                     ) : (
                        <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-full text-amber-600 dark:text-amber-400">
                           <AlertTriangle className="h-6 w-6" />
                        </div>
                     )}
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <span className="font-semibold text-base">{alert.metric ? METRIC_CONFIGS[alert.metric as keyof typeof METRIC_CONFIGS]?.label : 'System'} Alert</span>
                           <span className={`badge ${alert.severity === 'CRITICAL' ? 'badge-critical' : 'badge-warning'}`}>
                              {alert.severity}
                           </span>
                        </div>
                        <p className="text-sm leading-relaxed mb-2" style={{ color: 'var(--muted-fg)' }}>{alert.message}</p>
                        <div className="flex items-center gap-4 text-xs font-medium">
                           <div className="flex items-center gap-1.5" style={{ color: 'var(--muted-fg)' }}>
                              <Clock className="h-3.5 w-3.5" />
                              {formatRelativeTime(alert.createdAt)}
                           </div>
                           {alert.value !== undefined && (
                             <div className="bg-muted px-2 py-1 rounded text-foreground">
                                Reading: {alert.value} {alert.unit}
                             </div>
                           )}
                        </div>
                     </div>
                  </div>
                  <button onClick={() => handleAcknowledge(alert.id)} className="btn btn-primary sm:w-auto w-full">
                     <Check className="h-4 w-4" /> Acknowledge
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4 pt-6">
        <h2 className="text-lg font-semibold border-b pb-2" style={{ borderColor: 'var(--border)' }}>Past Alerts</h2>
        {pastAlerts.length === 0 ? (
           <p className="text-sm" style={{ color: 'var(--muted-fg)' }}>No past alerts to show.</p>
        ) : (
          <div className="card rounded-2xl overflow-hidden">
             <div className="table-wrapper border-none">
                <table className="table">
                   <thead>
                      <tr>
                         <th>Severity</th>
                         <th>Metric</th>
                         <th>Message</th>
                         <th>Acknowledged</th>
                      </tr>
                   </thead>
                   <tbody>
                      {pastAlerts.map(alert => (
                         <tr key={alert.id}>
                            <td>
                               <span className={`badge ${alert.severity === 'CRITICAL' ? 'badge-critical' : 'badge-warning'}`}>
                                  {alert.severity}
                               </span>
                            </td>
                            <td className="font-medium">{alert.metric ? METRIC_CONFIGS[alert.metric as keyof typeof METRIC_CONFIGS]?.label : 'System'}</td>
                            <td className="max-w-md truncate" title={alert.message}>{alert.message}</td>
                            <td className="text-xs" style={{ color: 'var(--muted-fg)' }}>
                               {alert.acknowledgedAt ? formatRelativeTime(alert.acknowledgedAt) : '-'}
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
