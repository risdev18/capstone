'use client';

import { useAuth } from '@/lib/auth/context';
import { getHealthStatus, getStatusColor, getStatusBg, formatRelativeTime, formatValue } from '@/lib/utils/health';
import { METRIC_CONFIGS, type HealthReading, type SensorMetric } from '@/types/health';
import { useDemoData } from '@/lib/mock/useDemoData';
import { DemoModeBanner } from '@/components/dashboard/DemoModeBanner';
import { Heart, Droplets, Thermometer, Activity, Radio, CheckCircle2 } from 'lucide-react';

type Metric = 'heart_rate' | 'spo2' | 'temperature' | 'blood_pressure_systolic';

export default function LiveMonitoringPage() {
  const { profile } = useAuth();
  const {
    isDemoMode,
    hasRealHardwareData,
    demoScenario,
    setDemoScenario,
    toggleDemoMode,
    readings,
  } = useDemoData({
    userId: profile?.uid,
    enableLiveTicks: true,
    tickIntervalMs: 2500,
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold">Live Monitoring</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-fg)' }}>
            Real-time continuous telemetry stream from MediBox sensors.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="live-dot" />
            <span>{isDemoMode ? 'Live Simulated Stream' : 'Live Hardware Stream'}</span>
          </div>
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

      {/* ── Live Metric Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(['heart_rate', 'spo2', 'temperature', 'blood_pressure_systolic'] as Metric[]).map((metric) => {
          const reading = readings[metric];
          const config = METRIC_CONFIGS[metric];
          const status = reading ? getHealthStatus(metric, reading.value) : 'UNKNOWN';
          const Icon = {
            heart_rate: Heart,
            spo2: Droplets,
            temperature: Thermometer,
            blood_pressure_systolic: Activity,
          }[metric];

          return (
            <div
              key={metric}
              className={`card rounded-2xl p-6 flex flex-col justify-between min-h-[200px] border-2 transition-all ${getStatusBg(
                status
              )}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-white/60 dark:bg-black/30 shadow-sm">
                      <Icon className={`h-5 w-5 ${getStatusColor(status)} ${metric === 'heart_rate' ? 'animate-pulse' : ''}`} />
                    </div>
                    <div>
                      <span className="font-semibold text-sm block leading-tight">{config.label}</span>
                      <span className="text-[10px] text-[var(--muted-fg)]">
                        Range: {config.normalMin} - {config.normalMax} {config.unit}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`badge text-[10px] ${
                      status === 'NORMAL'
                        ? 'badge-normal'
                        : status === 'WARNING'
                        ? 'badge-warning'
                        : status === 'CRITICAL'
                        ? 'badge-critical'
                        : 'badge-offline'
                    }`}
                  >
                    {status}
                  </span>
                </div>

                {reading ? (
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-5xl font-extrabold tracking-tight">
                      {formatValue(metric, reading.value)}
                    </span>
                    <span className="text-lg font-medium" style={{ color: 'var(--muted-fg)' }}>
                      {config.unit}
                    </span>
                  </div>
                ) : (
                  <div className="text-3xl font-bold" style={{ color: 'var(--muted-fg)' }}>
                    --
                  </div>
                )}
              </div>

              <div className="mt-6 pt-3 border-t border-black/10 dark:border-white/10 flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5" style={{ color: 'var(--muted-fg)' }}>
                  <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
                  <span>Stream Source:</span>
                  <span className="font-semibold text-foreground">{reading?.source ?? 'DEMO'}</span>
                </div>
                <span className="font-medium text-[var(--muted-fg)]">
                  {reading ? formatRelativeTime(reading.timestamp) : 'Awaiting data...'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Sensor Hardware Telemetry Summary ── */}
      <div className="card rounded-2xl p-6">
        <h2 className="text-base font-semibold mb-3">Active Sensor Telemetry</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-[var(--muted)] flex items-center justify-between">
            <div>
              <p className="font-semibold">MAX30102 PPG</p>
              <p className="text-[var(--muted-fg)]">Optical Heart & SpO₂</p>
            </div>
            <span className="badge badge-normal text-[10px]">Active 25Hz</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--muted)] flex items-center justify-between">
            <div>
              <p className="font-semibold">DS18B20 1-Wire</p>
              <p className="text-[var(--muted-fg)]">Digital Temperature</p>
            </div>
            <span className="badge badge-normal text-[10px]">Active 0.5Hz</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--muted)] flex items-center justify-between">
            <div>
              <p className="font-semibold">HX711 24-bit ADC</p>
              <p className="text-[var(--muted-fg)]">Pill Weight Load Cell</p>
            </div>
            <span className="badge badge-normal text-[10px]">Active 10Hz</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--muted)] flex items-center justify-between">
            <div>
              <p className="font-semibold">IR Gate Sensors</p>
              <p className="text-[var(--muted-fg)]">15 Pill Compartments</p>
            </div>
            <span className="badge badge-normal text-[10px]">Armed / Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
