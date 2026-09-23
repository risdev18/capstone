'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { METRIC_CONFIGS, type HealthReading, type HealthStatus } from '@/types/health';
import { getHealthStatus, getStatusColor, getStatusBg, formatRelativeTime, isDeviceOnline, formatValue } from '@/lib/utils/health';
import { useDemoData } from '@/lib/mock/useDemoData';
import DemoModeBanner from '@/components/dashboard/DemoModeBanner';
import MetricDetailModal from '@/components/dashboard/MetricDetailModal';
import Link from 'next/link';
import {
  Heart, Droplets, Thermometer, Activity, Wifi, WifiOff,
  Battery, AlertTriangle, AlertCircle, Info, Clock, ChevronRight,
  Shield, CheckCircle2, Pill
} from 'lucide-react';
import { HealthTrendChart } from '@/components/charts/HealthTrendChart';

type Metric = 'heart_rate' | 'spo2' | 'temperature' | 'blood_pressure_systolic';

const METRIC_ICONS: Record<Metric, React.ComponentType<{ className?: string }>> = {
  heart_rate: Heart,
  spo2: Droplets,
  temperature: Thermometer,
  blood_pressure_systolic: Activity,
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { profile } = useAuth();
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);

  const {
    isDemoMode,
    hasRealHardwareData,
    demoScenario,
    setDemoScenario,
    toggleDemoMode,
    device,
    readings,
    history,
    alerts,
    medEvents,
    medications,
  } = useDemoData({
    userId: profile?.uid,
    enableLiveTicks: true,
    tickIntervalMs: 3000,
  });

  const isOnline = device ? isDeviceOnline(device.lastSeen) && device.status === 'ONLINE' : false;

  // Helper to find medication name for a compartment
  const getMedNameForCompartment = (comp: string) => {
    const found = medications.find((m) => m.compartmentId === comp);
    return found ? `${found.name} (${found.dosage})` : `Compartment ${comp}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {getGreeting()}, {profile?.name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-fg)' }}>
            Here&apos;s your health overview and smart pillbox monitoring for today.
          </p>
        </div>
      </div>

      {/* ── Demo / Simulation Mode Banner ── */}
      <DemoModeBanner
        isDemoMode={isDemoMode}
        hasRealHardwareData={hasRealHardwareData}
        scenario={demoScenario}
        onSelectScenario={setDemoScenario}
        onToggleDemoMode={toggleDemoMode}
      />

      {/* ── Device Status Bar ── */}
      {device ? (
        <div className="card rounded-2xl p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={isOnline ? 'live-dot' : 'offline-dot'} />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{device.name}</p>
                {isDemoMode && (
                  <span className="badge badge-info text-[10px] py-0 px-1.5">Simulated Hub</span>
                )}
              </div>
              <p className="text-xs" style={{ color: 'var(--muted-fg)' }}>{device.deviceCode}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 ml-auto text-sm">
            <div className="flex items-center gap-1.5">
              {isOnline ? <Wifi className="h-4 w-4 text-emerald-500" /> : <WifiOff className="h-4 w-4 text-red-400" />}
              <span className={isOnline ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-red-500 font-medium'}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            {isOnline && (
              <>
                <div className="flex items-center gap-1.5" style={{ color: 'var(--muted-fg)' }}>
                  <Battery className="h-4 w-4" />
                  <span>{device.batteryLevel?.toFixed(0) ?? '--'}%</span>
                </div>
                {device.wifiSignal !== undefined && (
                  <span className="text-xs text-[var(--muted-fg)] hidden sm:inline">
                    {device.wifiSignal} dBm
                  </span>
                )}
                <span className="badge badge-normal">{device.firmwareVersion ?? 'v1.0'}</span>
              </>
            )}
            <Link href="/devices" className="btn btn-ghost btn-sm gap-1">
              Details <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {!isOnline && (
            <p className="w-full text-sm text-amber-600 dark:text-amber-400 font-medium">
              ⚠ Device may be offline or disconnected. Last seen: {formatRelativeTime(device.lastSeen)}
            </p>
          )}
        </div>
      ) : (
        <div className="card rounded-2xl p-6 text-center">
          <WifiOff className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <h2 className="text-base font-semibold">No Device Connected</h2>
          <p className="text-sm text-[var(--muted-fg)] mt-1 mb-4">Please connect your MediBox hardware.</p>
        </div>
      )}

      {/* ── Health Metric Cards ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Health Overview</h2>
          <Link href="/health" className="btn btn-ghost btn-sm gap-1 text-xs">
            Live Stream <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {(['heart_rate', 'spo2', 'temperature', 'blood_pressure_systolic'] as Metric[]).map((metric) => {
            const reading = readings[metric];
            const config = METRIC_CONFIGS[metric];
            const status: HealthStatus = reading ? getHealthStatus(metric, reading.value) : 'UNKNOWN';
            const Icon = METRIC_ICONS[metric];

            return (
              <div
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`card card-pop cursor-pointer group relative rounded-2xl p-5 border transition-all ${getStatusBg(status)}`}
                title="Click for hardware telemetry pop-up & clinical specifications"
              >
                <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 flex-shrink-0 ${getStatusColor(status)} group-hover:scale-110 transition-transform`} />
                    <span className="text-xs font-medium leading-tight line-clamp-2" style={{ color: 'var(--muted-fg)' }}>
                      {config.label}
                    </span>
                  </div>
                  <span className={`badge text-[10px] w-fit whitespace-nowrap ${status === 'NORMAL' ? 'badge-normal' : status === 'WARNING' ? 'badge-warning' : status === 'CRITICAL' ? 'badge-critical' : 'badge-offline'}`}>
                    {status}
                  </span>
                </div>

                {reading ? (
                  <>
                    <div className="flex items-baseline gap-1.5">
                      <span className="metric-value group-hover:text-cyan-400 transition-colors">{formatValue(metric, reading.value)}</span>
                      <span className="metric-unit">{config.unit}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/5 dark:border-white/5">
                      <p className="text-[11px]" style={{ color: 'var(--muted-fg)' }}>
                        {formatRelativeTime(reading.timestamp)}
                      </p>
                      <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        Details <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="mt-2">
                    <p className="text-base font-medium" style={{ color: 'var(--muted-fg)' }}>
                      —
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--muted-fg)' }}>
                      Awaiting data
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Trend Chart ── */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold">Heart Rate Trend</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-fg)' }}>
              24-hour continuous sensor timeline
            </p>
          </div>
          <Link href="/health-history" className="btn btn-ghost btn-sm gap-1 text-xs">
            Historical Trends <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <HealthTrendChart
          data={history.filter((r) => r.metric === 'heart_rate')}
          metric="heart_rate"
          color="#0ea5e9"
        />
      </div>

      {/* ── Medicine Schedule & Recent Medication Activity ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Recent Medication Activity</h2>
          <div className="flex items-center gap-2">
            <Link href="/medicines" className="btn btn-ghost btn-sm gap-1 text-xs">
              Medicines <ChevronRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/medicines/box" className="btn btn-ghost btn-sm gap-1 text-xs">
              View Box <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {medEvents.length === 0 ? (
          <div className="card rounded-2xl p-6 text-center">
            <p className="text-sm font-medium" style={{ color: 'var(--muted-fg)' }}>No recent medication events.</p>
          </div>
        ) : (
          <div className="card rounded-2xl p-5 flex flex-col justify-center space-y-4">
            {medEvents.slice(0, 4).map((event) => (
              <div key={event.id} className="flex items-center justify-between pb-3 border-b border-[var(--border)] last:border-0">
                <div className="flex items-center gap-3">
                  {event.status === 'TAKEN' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : event.status === 'MISSED' ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-sky-500" />
                  )}
                  <div>
                    <span className="font-semibold text-sm">
                      {getMedNameForCompartment(event.compartmentId)}
                    </span>
                    <p className="text-xs text-[var(--muted-fg)]">
                      Compartment {event.compartmentId} • {event.reason ?? `${event.expectedQuantity} unit(s)`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    event.status === 'TAKEN'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : event.status === 'MISSED'
                      ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                      : 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                  }`}>
                    {event.status}
                  </span>
                  <p className="text-xs text-[var(--muted-fg)] mt-1">
                    {formatRelativeTime(event.eventTime ?? event.scheduledTime)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Recent Alerts ── */}
      <div className="card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Recent Alerts</h2>
          <Link href="/alerts" className="btn btn-ghost btn-sm gap-1 text-xs">
            View all ({alerts.length}) <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Shield className="h-8 w-8 text-emerald-400 mb-2" />
            <p className="text-sm font-medium">No active alerts</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-fg)' }}>All readings are within normal range</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 rounded-xl p-3"
                style={{ background: 'var(--muted)' }}>
                {alert.severity === 'CRITICAL' ? (
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                ) : alert.severity === 'WARNING' ? (
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <Info className="h-4 w-4 text-sky-500 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge text-[10px] ${
                      alert.severity === 'CRITICAL'
                        ? 'badge-critical'
                        : alert.severity === 'WARNING'
                        ? 'badge-warning'
                        : 'badge-info'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs font-semibold">
                      {METRIC_CONFIGS[alert.metric]?.label ?? 'System'}
                    </span>
                    <span className="text-[10px] text-[var(--muted-fg)] ml-auto">
                      {formatRelativeTime(alert.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--muted-fg)' }}>
                    {alert.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pop-up Metric Detail Telemetry Modal */}
      <MetricDetailModal
        metric={selectedMetric}
        reading={selectedMetric ? readings[selectedMetric] : undefined}
        isOpen={!!selectedMetric}
        onClose={() => setSelectedMetric(null)}
      />
    </div>
  );
}
