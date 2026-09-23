'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth/context';
import type { HealthReading, SensorMetric } from '@/types/health';
import { METRIC_CONFIGS } from '@/types/health';
import { getHealthStatus, formatValue, formatTimestamp } from '@/lib/utils/health';
import { Search, Filter, Calendar } from 'lucide-react';
import { HealthTrendChart } from '@/components/charts/HealthTrendChart';
import { useDemoData } from '@/lib/mock/useDemoData';
import { DemoModeBanner } from '@/components/dashboard/DemoModeBanner';

export default function HealthHistoryPage() {
  const { profile } = useAuth();
  const {
    isDemoMode,
    hasRealHardwareData,
    demoScenario,
    setDemoScenario,
    toggleDemoMode,
    history,
  } = useDemoData({
    userId: profile?.uid,
  });

  const [filterMetric, setFilterMetric] = useState<SensorMetric | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort history
  const filteredHistory = useMemo(() => {
    return history
      .filter((h) => {
        const matchesMetric = filterMetric === 'ALL' || h.metric === filterMetric;
        const label = METRIC_CONFIGS[h.metric]?.label ?? h.metric;
        const matchesSearch =
          searchQuery.trim() === '' ||
          label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.value.toString().includes(searchQuery);

        return matchesMetric && matchesSearch;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [history, filterMetric, searchQuery]);

  // Chart data
  const chartMetric = filterMetric === 'ALL' ? 'heart_rate' : filterMetric;
  const chartData = useMemo(() => {
    return history.filter((h) => h.metric === chartMetric);
  }, [history, chartMetric]);

  const chartColor =
    chartMetric === 'spo2'
      ? '#0ea5e9'
      : chartMetric === 'temperature'
      ? '#f59e0b'
      : chartMetric === 'blood_pressure_systolic'
      ? '#8b5cf6'
      : '#ef4444';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold">Health History</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-fg)' }}>
            Review past sensor readings, trends, and chronological telemetry logs.
          </p>
        </div>
      </div>

      {/* ── Demo / Simulation Banner ── */}
      <DemoModeBanner
        isDemoMode={isDemoMode}
        hasRealHardwareData={hasRealHardwareData}
        scenario={demoScenario}
        onSelectScenario={setDemoScenario}
        onToggleDemoMode={toggleDemoMode}
      />

      {/* ── Trend Analysis Chart Card ── */}
      <div className="card rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold">Trend Analysis</h2>
            <p className="text-xs text-[var(--muted-fg)]">
              Showing time-series for {METRIC_CONFIGS[chartMetric]?.label ?? chartMetric}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted-fg)]">Chart Metric:</span>
            <select
              className="input max-w-[220px] text-sm"
              value={filterMetric}
              onChange={(e) => setFilterMetric(e.target.value as SensorMetric | 'ALL')}
            >
              <option value="ALL">All Metrics (Chart shows HR)</option>
              <option value="heart_rate">Heart Rate (BPM)</option>
              <option value="spo2">SpO₂ (%)</option>
              <option value="temperature">Body Temperature (°C)</option>
              <option value="blood_pressure_systolic">Systolic BP (mmHg)</option>
              <option value="blood_pressure_diastolic">Diastolic BP (mmHg)</option>
            </select>
          </div>
        </div>

        <HealthTrendChart data={chartData} metric={chartMetric} color={chartColor} height={320} />
      </div>

      {/* ── Historical Log Table ── */}
      <div className="card rounded-2xl overflow-hidden">
        <div
          className="p-4 border-b flex flex-wrap gap-4 items-center justify-between"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: 'var(--muted-fg)' }}
            />
            <input
              type="text"
              placeholder="Search by metric or value..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--muted-fg)]">
            <Calendar className="h-4 w-4" />
            <span>Showing {filteredHistory.length} readings</span>
          </div>
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
                <th>Data Source</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((reading) => {
                const config = METRIC_CONFIGS[reading.metric];
                const status = getHealthStatus(reading.metric, reading.value);
                return (
                  <tr key={reading.id}>
                    <td className="whitespace-nowrap font-medium text-xs">
                      {formatTimestamp(reading.timestamp)}
                    </td>
                    <td className="font-semibold text-sm">{config?.label ?? reading.metric}</td>
                    <td className="font-mono font-bold text-sm">
                      {formatValue(reading.metric, reading.value)}
                    </td>
                    <td className="text-xs" style={{ color: 'var(--muted-fg)' }}>
                      {config?.unit}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          status === 'NORMAL'
                            ? 'badge-normal'
                            : status === 'WARNING'
                            ? 'badge-warning'
                            : 'badge-critical'
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          reading.source === 'DEMO'
                            ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {reading.source}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8" style={{ color: 'var(--muted-fg)' }}>
                    No readings found matching criteria.
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
