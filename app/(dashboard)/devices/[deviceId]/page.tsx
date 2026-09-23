'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { useDemoData } from '@/lib/mock/useDemoData';
import { isDeviceOnline, formatRelativeTime, formatUptime } from '@/lib/utils/health';
import { Cpu, Wifi, Battery, Activity, ArrowLeft, Clock, ShieldCheck, Power, Scale } from 'lucide-react';
import { METRIC_CONFIGS } from '@/types/health';

export default function DeviceDetailPage() {
  const { profile } = useAuth();
  const { device, sensors, isDemoMode } = useDemoData({ userId: profile?.uid });

  const activeDevice = device;
  const isOnline = activeDevice ? isDeviceOnline(activeDevice.lastSeen) && activeDevice.status === 'ONLINE' : false;

  if (!activeDevice) {
    return (
      <div className="p-8 text-center card rounded-2xl max-w-lg mx-auto">
        <p className="font-semibold">Device Not Found</p>
        <Link href="/devices" className="btn btn-outline btn-sm mt-4">
          Back to Devices
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/devices" className="btn btn-ghost btn-icon">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{activeDevice.name}</h1>
            {isDemoMode && (
              <span className="badge badge-info text-xs">Simulated Telemetry</span>
            )}
          </div>
          <p className="text-sm mt-0.5 font-mono" style={{ color: 'var(--muted-fg)' }}>
            Code: {activeDevice.deviceCode}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={`badge ${isOnline ? 'badge-online' : 'badge-offline'} px-3 py-1 text-xs font-semibold`}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Device Overview */}
        <div className="card rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2" style={{ borderColor: 'var(--border)' }}>
            Device Overview
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2" style={{ color: 'var(--muted-fg)' }}>
                <Clock className="h-4 w-4" />
                <span className="text-sm">Last Seen</span>
              </div>
              <span className="text-sm font-semibold">{formatRelativeTime(activeDevice.lastSeen)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2" style={{ color: 'var(--muted-fg)' }}>
                <Power className="h-4 w-4" />
                <span className="text-sm">Uptime</span>
              </div>
              <span className="text-sm font-semibold">{formatUptime(activeDevice.uptime || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2" style={{ color: 'var(--muted-fg)' }}>
                <ShieldCheck className="h-4 w-4" />
                <span className="text-sm">Firmware Version</span>
              </div>
              <span className="badge badge-info">{activeDevice.firmwareVersion}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2" style={{ color: 'var(--muted-fg)' }}>
                <Battery className="h-4 w-4 text-emerald-500" />
                <span className="text-sm">Battery Level</span>
              </div>
              <span className="text-sm font-semibold">{activeDevice.batteryLevel}%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2" style={{ color: 'var(--muted-fg)' }}>
                <Wifi className="h-4 w-4 text-sky-500" />
                <span className="text-sm">Wi-Fi Signal</span>
              </div>
              <span className="text-sm font-semibold">{activeDevice.wifiSignal} dBm (Strong)</span>
            </div>
          </div>
        </div>

        {/* Sensor Health */}
        <div className="card rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2" style={{ borderColor: 'var(--border)' }}>
            Sensor Health & Calibration
          </h2>
          <div className="space-y-3">
            {sensors.map((sensor) => {
              const connected = sensor.status === 'CONNECTED' && isOnline;
              return (
                <div
                  key={sensor.id}
                  className="flex items-center justify-between rounded-xl p-3"
                  style={{ background: 'var(--muted)' }}
                >
                  <div className="flex items-center gap-3">
                    <Activity className={`h-5 w-5 ${connected ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <div>
                      <p className="text-sm font-semibold">{sensor.name}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-fg)' }}>
                        {sensor.type} · {METRIC_CONFIGS[sensor.metric]?.label ?? sensor.metric}
                      </p>
                    </div>
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
    </div>
  );
}
