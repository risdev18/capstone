'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/context';
import { METRIC_CONFIGS, type HealthReading, type HealthStatus } from '@/types/health';
import { DEMO_DEVICE, DEMO_SENSORS, tickLiveReadings, generateDemoHistory, generateDemoAlerts, type DemoScenario } from '@/lib/simulator/demoData';
import { getHealthStatus, getStatusColor, getStatusBg, formatRelativeTime, isDeviceOnline, formatValue } from '@/lib/utils/health';
import type { Alert } from '@/types/alert';
import Link from 'next/link';
import {
  Heart, Droplets, Thermometer, Activity, Wifi, WifiOff,
  Battery, AlertTriangle, AlertCircle, Info, Clock, ChevronRight,
  RefreshCw, PlayCircle, Shield
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
  const [scenario, setScenario] = useState<DemoScenario>('normal');
  const [readings, setReadings] = useState<Partial<Record<Metric, HealthReading>>>({});
  const [history, setHistory] = useState<HealthReading[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [device, setDevice] = useState(DEMO_DEVICE);

  const refresh = useCallback(() => {
    const userId = profile?.uid ?? 'demo-user';
    const live = tickLiveReadings(userId, scenario) as HealthReading[];
    const map: Partial<Record<Metric, HealthReading>> = {};
    for (const r of live) {
      if (r.metric === 'heart_rate' || r.metric === 'spo2' || r.metric === 'temperature' || r.metric === 'blood_pressure_systolic') {
        map[r.metric as Metric] = r;
      }
    }
    setReadings(map);
    setHistory(generateDemoHistory(userId, 24, scenario));
    setAlerts(generateDemoAlerts(userId, scenario));
    setLastSync(new Date());
    setDevice((d) => ({
      ...d,
      status: scenario === 'offline' ? 'OFFLINE' : 'ONLINE',
      lastSeen: new Date().toISOString(),
      batteryLevel: scenario === 'offline' ? d.batteryLevel : Math.min(100, d.batteryLevel + 0.1),
    }));
  }, [profile?.uid, scenario]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const isOnline = isDeviceOnline(device.lastSeen) && scenario !== 'offline';
  const unacknowledgedAlerts = alerts.filter((a) => a.status === 'UNACKNOWLEDGED');
  const criticalAlerts = alerts.filter((a) => a.severity === 'CRITICAL');

  return (
    <div className="space-y-6">
      {/* ── Demo Banner ── */}
      <div className="demo-banner rounded-xl">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <span className="font-semibold">DEMO MODE</span>
        <span className="hidden sm:inline">— Readings are simulated and do not represent real sensor measurements.</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs opacity-70 hidden sm:inline">Scenario:</span>
          <select
            className="text-xs rounded-lg px-2 py-1 font-medium cursor-pointer"
            style={{ background: 'rgba(0,0,0,0.1)', border: 'none', color: 'inherit' }}
            value={scenario}
            onChange={(e) => setScenario(e.target.value as DemoScenario)}
            aria-label="Demo scenario selector"
          >
            <option value="normal">Normal</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
            <option value="offline">Offline</option>
          </select>
          <button onClick={refresh} className="btn-ghost btn-icon" title="Refresh readings" aria-label="Refresh">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {getGreeting()}, {profile?.name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-fg)' }}>
            Here&apos;s your health overview for today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-fg)' }}>
          <Clock className="h-3.5 w-3.5" />
          Last sync: {formatRelativeTime(lastSync.toISOString())}
        </div>
      </div>

      {/* ── Device Status Bar ── */}
      <div className={`card rounded-2xl p-4 flex flex-wrap items-center gap-4 ${isOnline ? '' : ''}`}>
        <div className="flex items-center gap-3">
          <div className={`${isOnline ? 'live-dot' : 'offline-dot'}`} />
          <div>
            <p className="text-sm font-semibold">{device.name}</p>
            <p className="text-xs" style={{ color: 'var(--muted-fg)' }}>{device.deviceCode}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 ml-auto text-sm">
          <div className="flex items-center gap-1.5">
            {isOnline ? <Wifi className="h-4 w-4 text-emerald-500" /> : <WifiOff className="h-4 w-4 text-red-400" />}
            <span className={isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'} style={{ fontWeight: 500 }}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          {isOnline && (
            <>
              <div className="flex items-center gap-1.5" style={{ color: 'var(--muted-fg)' }}>
                <Battery className="h-4 w-4" />
                <span>{device.batteryLevel.toFixed(0)}%</span>
              </div>
              <span className="badge badge-normal">{device.firmwareVersion}</span>
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

      {/* ── Health Metric Cards ── */}
      <div>
        <h2 className="text-base font-semibold mb-3">Health Overview</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {(['heart_rate', 'spo2', 'temperature', 'blood_pressure_systolic'] as Metric[]).map((metric) => {
            const reading = readings[metric];
            const config = METRIC_CONFIGS[metric];
            const status: HealthStatus = reading ? getHealthStatus(metric, reading.value) : 'UNKNOWN';
            const Icon = METRIC_ICONS[metric];

            return (
              <div key={metric} className={`card card-hover rounded-2xl p-5 border ${getStatusBg(status)}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${getStatusColor(status)}`} />
                    <span className="text-xs font-medium" style={{ color: 'var(--muted-fg)' }}>
                      {config.label}
                    </span>
                  </div>
                  <span className={`badge text-[10px] ${status === 'NORMAL' ? 'badge-normal' : status === 'WARNING' ? 'badge-warning' : status === 'CRITICAL' ? 'badge-critical' : 'badge-offline'}`}>
                    {status}
                  </span>
                </div>

                {reading ? (
                  <>
                    <div className="flex items-baseline gap-1.5">
                      <span className="metric-value">{formatValue(metric, reading.value)}</span>
                      <span className="metric-unit">{config.unit}</span>
                    </div>
                    <p className="text-xs mt-2" style={{ color: 'var(--muted-fg)' }}>
                      {formatRelativeTime(reading.timestamp)}
                    </p>
                  </>
                ) : (
                  <div className="mt-2">
                    <p className="text-base font-medium" style={{ color: 'var(--muted-fg)' }}>
                      {scenario === 'offline' ? 'Sensor unavailable' : '—'}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--muted-fg)' }}>
                      {scenario === 'offline' ? 'Device offline' : 'Awaiting data'}
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
          <h2 className="text-base font-semibold">Heart Rate Trend (24h)</h2>
          <Link href="/health" className="btn btn-ghost btn-sm gap-1 text-xs">
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <HealthTrendChart
          data={history.filter((r) => r.metric === 'heart_rate')}
          metric="heart_rate"
          color="#0ea5e9"
        />
      </div>

      {/* ── Bottom grid: Alerts + Device ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Alerts */}
        <div className="card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Recent Alerts</h2>
            <Link href="/alerts" className="btn btn-ghost btn-sm gap-1 text-xs">
              View all <ChevronRight className="h-3.5 w-3.5" />
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
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge text-[10px] ${alert.severity === 'CRITICAL' ? 'badge-critical' : 'badge-warning'}`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs font-medium">{METRIC_CONFIGS[alert.metric]?.label}</span>
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

        {/* Sensor Status */}
        <div className="card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Sensor Status</h2>
            <Link href="/devices" className="btn btn-ghost btn-sm gap-1 text-xs">
              Details <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {DEMO_SENSORS.map((sensor) => {
              const connected = sensor.status === 'CONNECTED' && scenario !== 'offline';
              return (
                <div key={sensor.id} className="flex items-center justify-between rounded-xl p-3"
                  style={{ background: 'var(--muted)' }}>
                  <div>
                    <p className="text-sm font-medium">{sensor.name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-fg)' }}>{sensor.type} · {METRIC_CONFIGS[sensor.metric]?.label}</p>
                  </div>
                  <span className={`badge text-[10px] ${connected ? 'badge-normal' : 'badge-offline'}`}>
                    {connected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Medical Disclaimer ── */}
      <div className="flex items-start gap-2.5 rounded-xl border px-4 py-3 text-xs"
        style={{ background: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--muted-fg)' }}>
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Medical Disclaimer:</strong> SmartHealth Box is an educational health-monitoring system and 
          is not a substitute for professional medical advice, diagnosis, or treatment. All readings shown here 
          are for monitoring and educational purposes only.
        </p>
      </div>
    </div>
  );
}
