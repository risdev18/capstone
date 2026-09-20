'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { db } from '@/lib/firebase/client';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { METRIC_CONFIGS, type HealthReading, type HealthStatus } from '@/types/health';
import { getHealthStatus, getStatusColor, getStatusBg, formatRelativeTime, isDeviceOnline, formatValue } from '@/lib/utils/health';
import type { Alert } from '@/types/alert';
import type { Device } from '@/types/device';
import type { MedicationEvent } from '@/types/medication';
import Link from 'next/link';
import {
  Heart, Droplets, Thermometer, Activity, Wifi, WifiOff,
  Battery, AlertTriangle, AlertCircle, Info, Clock, ChevronRight,
  Shield, CheckCircle2
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
  
  const [device, setDevice] = useState<Device | null>(null);
  const [readings, setReadings] = useState<Partial<Record<Metric, HealthReading>>>({});
  const [history, setHistory] = useState<HealthReading[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [medEvents, setMedEvents] = useState<MedicationEvent[]>([]);

  useEffect(() => {
    if (!profile?.uid) return;

    // 1. Fetch Primary Device
    const qDevice = query(collection(db, 'devices'), where('ownerId', '==', profile.uid), limit(1));
    const unsubDevice = onSnapshot(qDevice, (snap) => {
      if (!snap.empty) {
        setDevice(snap.docs[0].data() as Device);
      } else {
        setDevice(null);
      }
    });

    // 2. Fetch Latest Readings History (for charts)
    const qHistory = query(collection(db, 'readings'), where('userId', '==', profile.uid), orderBy('timestamp', 'desc'), limit(100));
    const unsubHistory = onSnapshot(qHistory, (snap) => {
      const docs = snap.docs.map(d => d.data() as HealthReading).reverse(); // Oldest to newest for charts
      setHistory(docs);
      
      // Extract latest reading for each metric
      const latest: Partial<Record<Metric, HealthReading>> = {};
      const sortedNewest = [...docs].reverse();
      for (const r of sortedNewest) {
        if (!latest[r.metric as Metric]) {
          latest[r.metric as Metric] = r;
        }
      }
      setReadings(latest);
    });

    // 3. Fetch Alerts
    const qAlerts = query(collection(db, 'alerts'), where('userId', '==', profile.uid), orderBy('createdAt', 'desc'), limit(5));
    const unsubAlerts = onSnapshot(qAlerts, (snap) => {
      setAlerts(snap.docs.map(d => d.data() as Alert));
    });

    // 4. Fetch Medication Events (Today's Schedule)
    const qEvents = query(collection(db, 'medicationEvents'), where('userId', '==', profile.uid), orderBy('scheduledTime', 'desc'), limit(10));
    const unsubEvents = onSnapshot(qEvents, (snap) => {
      setMedEvents(snap.docs.map(d => d.data() as MedicationEvent));
    });

    return () => {
      unsubDevice();
      unsubHistory();
      unsubAlerts();
      unsubEvents();
    };
  }, [profile?.uid]);

  const isOnline = device ? isDeviceOnline(device.lastSeen) && device.status === 'ONLINE' : false;

  return (
    <div className="space-y-6">
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
      </div>

      {/* ── Device Status Bar ── */}
      {device ? (
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
                  <span>{device.batteryLevel?.toFixed(0) ?? '--'}%</span>
                </div>
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
          <p className="text-sm text-[var(--muted-fg)] mt-1 mb-4">Please connect your SmartHealth Box hardware.</p>
        </div>
      )}

      {/* ── Medicine Schedule & Next Dose ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Recent Medication Activity</h2>
          <Link href="/medicines/box" className="btn btn-ghost btn-sm gap-1 text-xs">
            View box <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        
        {medEvents.length === 0 ? (
          <div className="card rounded-2xl p-6 text-center">
            <p className="text-sm font-medium" style={{ color: 'var(--muted-fg)' }}>No recent medication events.</p>
          </div>
        ) : (
          <div className="card rounded-2xl p-5 flex flex-col justify-center space-y-4">
            {medEvents.slice(0,3).map(event => (
               <div key={event.id} className="flex items-center justify-between pb-3 border-b border-[var(--border)] last:border-0">
                  <div className="flex items-center gap-3">
                    {event.status === 'TAKEN' ? (
                      <CheckCircle2 className="h-5 w-5 text-[var(--color-success)]" />
                    ) : event.status === 'MISSED' ? (
                      <AlertCircle className="h-5 w-5 text-[var(--color-critical)]" />
                    ) : (
                      <Clock className="h-5 w-5 text-[var(--color-accent)]" />
                    )}
                    <span className="font-medium">Compartment {event.compartmentId}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${event.status === 'TAKEN' ? 'text-[var(--color-success)]' : event.status === 'MISSED' ? 'text-[var(--color-critical)]' : 'text-[var(--color-accent)]'}`}>
                      {event.status}
                    </span>
                    <p className="text-xs text-[var(--muted-fg)]">{formatRelativeTime(event.eventTime)}</p>
                  </div>
               </div>
            ))}
          </div>
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
          <h2 className="text-base font-semibold">Heart Rate Trend</h2>
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
      </div>
    </div>
  );
}
