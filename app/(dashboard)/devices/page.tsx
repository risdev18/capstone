'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { db } from '@/lib/firebase/client';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { isDeviceOnline } from '@/lib/utils/health';
import { Cpu, Wifi, Battery, ChevronRight } from 'lucide-react';
import type { Device } from '@/types/device';

export default function DevicesPage() {
  const { profile } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    if (!profile?.uid) return;

    const q = query(collection(db, 'devices'), where('ownerId', '==', profile.uid));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => d.data() as Device);
      setDevices(docs);
    });
    return () => unsub();
  }, [profile?.uid]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Devices</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-fg)' }}>
          Manage your connected MediBox devices.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {devices.length === 0 && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200 rounded-xl">
             No devices connected. Requires Physical Hardware.
          </div>
        )}
        {devices.map(device => {
           const isOnline = isDeviceOnline(device.lastSeen);
           return (
             <Link key={device.id} href={`/devices/${device.id}`} className="block group">
                <div className="card rounded-2xl p-5 card-hover relative h-full flex flex-col">
                   <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-sky-50 dark:bg-sky-950 rounded-xl text-sky-500">
                         <Cpu className="h-6 w-6" />
                      </div>
                      <span className={`badge ${isOnline ? 'badge-online' : 'badge-offline'}`}>
                         {isOnline ? 'Online' : 'Offline'}
                      </span>
                   </div>
                   <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{device.name}</h3>
                      <p className="text-sm font-mono" style={{ color: 'var(--muted-fg)' }}>{device.deviceCode}</p>
                   </div>
                   
                   <div className="mt-6 pt-4 border-t flex justify-between items-center text-sm" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-4" style={{ color: 'var(--muted-fg)' }}>
                         <div className="flex items-center gap-1.5" title="Battery">
                            <Battery className="h-4 w-4" />
                            <span>{device.batteryLevel}%</span>
                         </div>
                         <div className="flex items-center gap-1.5" title="Wi-Fi Signal">
                            <Wifi className="h-4 w-4" />
                            <span>{device.wifiSignal} dBm</span>
                         </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                </div>
             </Link>
           );
        })}
      </div>
    </div>
  );
}
