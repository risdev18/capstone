'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { useDemoData } from '@/lib/mock/useDemoData';
import { isDeviceOnline } from '@/lib/utils/health';
import { Cpu, Wifi, Battery, ChevronRight, Plus, Radio } from 'lucide-react';

export default function DevicesPage() {
  const { profile } = useAuth();
  const { device, isDemoMode } = useDemoData({ userId: profile?.uid });

  const isOnline = device ? isDeviceOnline(device.lastSeen) && device.status === 'ONLINE' : false;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Devices</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-fg)' }}>
            Manage your connected MediBox hardware units, ESP32 microcontrollers, and sensor arrays.
          </p>
        </div>
        <button className="btn btn-primary btn-sm flex items-center gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Pair New Hardware
        </button>
      </div>

      {device && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href={`/devices/${device.id}`} className="block group">
            <div className="card rounded-2xl p-5 card-hover relative h-full flex flex-col justify-between border-2 border-transparent hover:border-sky-500/40 transition-all">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-sky-50 dark:bg-sky-950 rounded-2xl text-sky-500 shadow-inner">
                    <Cpu className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    {isDemoMode && (
                      <span className="badge badge-info text-[10px]">Simulated Hub</span>
                    )}
                    <span className={`badge ${isOnline ? 'badge-online' : 'badge-offline'}`}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-lg mb-1 group-hover:text-sky-500 transition-colors">
                  {device.name}
                </h3>
                <p className="text-xs font-mono text-[var(--muted-fg)]">{device.deviceCode}</p>
                <p className="text-xs text-[var(--muted-fg)] mt-2">
                  Firmware: <span className="font-semibold text-foreground">{device.firmwareVersion}</span>
                </p>
              </div>

              <div
                className="mt-6 pt-4 border-t flex justify-between items-center text-sm"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-4" style={{ color: 'var(--muted-fg)' }}>
                  <div className="flex items-center gap-1.5" title="Battery Level">
                    <Battery className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-semibold">{device.batteryLevel}%</span>
                  </div>
                  <div className="flex items-center gap-1.5" title="Wi-Fi Signal Strength">
                    <Wifi className="h-4 w-4 text-sky-500" />
                    <span className="text-xs font-semibold">{device.wifiSignal} dBm</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-sky-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
