'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { db } from '@/lib/firebase/client';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { getHealthStatus, getStatusColor, getStatusBg, formatRelativeTime, formatValue } from '@/lib/utils/health';
import { METRIC_CONFIGS, type HealthReading } from '@/types/health';
import { Heart, Droplets, Thermometer, Activity } from 'lucide-react';

type Metric = 'heart_rate' | 'spo2' | 'temperature' | 'blood_pressure_systolic';

export default function LiveMonitoringPage() {
  const { profile } = useAuth();
  const [readings, setReadings] = useState<Partial<Record<Metric, HealthReading>>>({});

  useEffect(() => {
    if (!profile?.uid) return;

    // Fetch Latest Readings
    const qHistory = query(collection(db, 'readings'), where('userId', '==', profile.uid), orderBy('timestamp', 'desc'), limit(50));
    const unsub = onSnapshot(qHistory, (snap) => {
      const docs = snap.docs.map(d => d.data() as HealthReading);
      
      const latest: Partial<Record<Metric, HealthReading>> = {};
      for (const r of docs) {
        if (!latest[r.metric as Metric]) {
          latest[r.metric as Metric] = r;
        }
      }
      setReadings(latest);
    });

    return () => unsub();
  }, [profile?.uid]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold">Live Monitoring</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-fg)' }}>
            Real-time data stream from connected sensors.
          </p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 text-sm font-medium">
              <span className="live-dot" /> Live from Device
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(['heart_rate', 'spo2', 'temperature', 'blood_pressure_systolic'] as Metric[]).map((metric) => {
          const reading = readings[metric];
          const config = METRIC_CONFIGS[metric];
          const status = reading ? getHealthStatus(metric, reading.value) : 'UNKNOWN';
          const Icon = { heart_rate: Heart, spo2: Droplets, temperature: Thermometer, blood_pressure_systolic: Activity }[metric];

          return (
            <div key={metric} className={`card rounded-2xl p-6 flex flex-col justify-between min-h-[160px] border-2 ${getStatusBg(status)}`}>
               <div>
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${getStatusColor(status)}`} />
                        <span className="font-semibold text-sm">{config.label}</span>
                     </div>
                     <span className={`badge ${status === 'NORMAL' ? 'badge-normal' : status === 'WARNING' ? 'badge-warning' : status === 'CRITICAL' ? 'badge-critical' : 'badge-offline'}`}>
                        {status}
                     </span>
                  </div>
                  {reading ? (
                     <div className="flex items-end gap-2">
                        <span className="text-5xl font-bold tracking-tight">{formatValue(metric, reading.value)}</span>
                        <span className="text-lg font-medium mb-1" style={{ color: 'var(--muted-fg)' }}>{config.unit}</span>
                     </div>
                  ) : (
                     <div className="text-3xl font-bold" style={{ color: 'var(--muted-fg)' }}>--</div>
                  )}
               </div>
               <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 flex justify-between items-center text-xs">
                  <span style={{ color: 'var(--muted-fg)' }}>Updated:</span>
                  <span className="font-medium">{reading ? formatRelativeTime(reading.timestamp) : 'Waiting for hardware...'}</span>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
