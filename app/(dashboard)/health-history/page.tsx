'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { generateDemoHistory } from '@/lib/simulator/demoData';
import type { HealthReading } from '@/types/health';
import { METRIC_CONFIGS, type SensorMetric } from '@/types/health';
import { getHealthStatus, formatValue, formatTimestamp } from '@/lib/utils/health';
import { Search, Filter } from 'lucide-react';
import { HealthTrendChart } from '@/components/charts/HealthTrendChart';

export default function HealthHistoryPage() {
  const { profile } = useAuth();
  const [history, setHistory] = useState<HealthReading[]>([]);
  const [filterMetric, setFilterMetric] = useState<SensorMetric | 'ALL'>('ALL');
  
  useEffect(() => {
    if (profile?.uid) {
       setHistory(generateDemoHistory(profile.uid, 24, 'normal'));
    }
  }, [profile?.uid]);

  const filteredHistory = history.filter(h => filterMetric === 'ALL' || h.metric === filterMetric)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold">Health History</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-fg)' }}>
            Review past sensor readings and historical trends.
          </p>
        </div>
      </div>

      <div className="card rounded-2xl p-6 mb-6">
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Trend Analysis</h2>
            <select 
               className="input max-w-[200px]" 
               value={filterMetric} 
               onChange={(e) => setFilterMetric(e.target.value as SensorMetric | 'ALL')}
            >
               <option value="ALL">All Metrics (Chart shows HR)</option>
               <option value="heart_rate">Heart Rate</option>
               <option value="spo2">SpO₂</option>
               <option value="temperature">Temperature</option>
               <option value="blood_pressure_systolic">Blood Pressure (Sys)</option>
            </select>
         </div>
         <HealthTrendChart 
            data={history.filter(h => h.metric === (filterMetric === 'ALL' ? 'heart_rate' : filterMetric))}
            metric={filterMetric === 'ALL' ? 'heart_rate' : filterMetric}
            color={filterMetric === 'spo2' ? '#0ea5e9' : filterMetric === 'temperature' ? '#f59e0b' : '#ef4444'}
         />
      </div>

      <div className="card rounded-2xl overflow-hidden">
         <div className="p-4 border-b flex flex-wrap gap-4 items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <div className="relative w-full sm:max-w-xs">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--muted-fg)' }} />
               <input type="text" placeholder="Search history..." className="input pl-9" />
            </div>
            <button className="btn btn-outline btn-sm gap-2">
               <Filter className="h-4 w-4" /> Filter
            </button>
         </div>
         <div className="table-wrapper border-none">
            <table className="table">
               <thead>
                  <tr>
                     <th>Date & Time</th>
                     <th>Metric</th>
                     <th>Value</th>
                     <th>Unit</th>
                     <th>Status</th>
                     <th>Source</th>
                  </tr>
               </thead>
               <tbody>
                  {filteredHistory.map(reading => {
                     const config = METRIC_CONFIGS[reading.metric];
                     const status = getHealthStatus(reading.metric, reading.value);
                     return (
                        <tr key={reading.id}>
                           <td className="whitespace-nowrap">{formatTimestamp(reading.timestamp)}</td>
                           <td className="font-medium">{config?.label}</td>
                           <td className="font-mono">{formatValue(reading.metric, reading.value)}</td>
                           <td className="text-xs" style={{ color: 'var(--muted-fg)' }}>{config?.unit}</td>
                           <td>
                              <span className={`badge ${status === 'NORMAL' ? 'badge-normal' : status === 'WARNING' ? 'badge-warning' : 'badge-critical'}`}>
                                 {status}
                              </span>
                           </td>
                           <td className="text-xs" style={{ color: 'var(--muted-fg)' }}>{reading.source}</td>
                        </tr>
                     );
                  })}
                  {filteredHistory.length === 0 && (
                     <tr>
                        <td colSpan={6} className="text-center py-8" style={{ color: 'var(--muted-fg)' }}>
                           No readings found.
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
