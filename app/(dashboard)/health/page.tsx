'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/context';
import { DEMO_DEVICE, tickLiveReadings, type DemoScenario } from '@/lib/simulator/demoData';
import { getHealthStatus, getStatusColor, getStatusBg, formatRelativeTime, formatValue } from '@/lib/utils/health';
import { METRIC_CONFIGS, type HealthReading } from '@/types/health';
import { Heart, Droplets, Thermometer, Activity, RefreshCw } from 'lucide-react';

type Metric = 'heart_rate' | 'spo2' | 'temperature' | 'blood_pressure_systolic';

export default function LiveMonitoringPage() {
  const { profile } = useAuth();
  const [scenario, setScenario] = useState<DemoScenario>('normal');
  const [readings, setReadings] = useState<Partial<Record<Metric, HealthReading>>>({});
  const [lastSync, setLastSync] = useState<Date>(new Date());

  const refresh = useCallback(() => {
    const userId = profile?.uid ?? 'demo-user';
    const live = tickLiveReadings(userId, scenario) as HealthReading[];
    const map: Partial<Record<Metric, HealthReading>> = {};
    for (const r of live) {
      if (['heart_rate', 'spo2', 'temperature', 'blood_pressure_systolic'].includes(r.metric)) {
        map[r.metric as Metric] = r;
      }
    }
    setReadings(map);
    setLastSync(new Date());
  }, [profile?.uid, scenario]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000); // 5 seconds for live view
    return () => clearInterval(interval);
  }, [refresh]);

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
              <span className="live-dot" /> Live
           </div>
           <button onClick={refresh} className="btn btn-secondary btn-sm gap-2">
              <RefreshCw className="h-4 w-4" /> Refresh
           </button>
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
                     <span className={`badge ${status === 'NORMAL' ? 'badge-normal' : status === 'WARNING' ? 'badge-warning' : 'badge-critical'}`}>
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
                  <span className="font-medium">{reading ? formatRelativeTime(reading.timestamp) : 'Waiting...'}</span>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
