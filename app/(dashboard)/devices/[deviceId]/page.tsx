'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { isDeviceOnline, formatRelativeTime, formatUptime } from '@/lib/utils/health';
import { Cpu, Wifi, Battery, Activity, ArrowLeft, Clock, ShieldCheck, Power, Search } from 'lucide-react';
import { METRIC_CONFIGS } from '@/types/health';
import type { Device, Sensor } from '@/types/device';

export default function DeviceDetailPage() {
  const { deviceId } = useParams();
  
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Real sensor implementation requires a separate subcollection or array on the device.
  // We'll leave it empty for now until real sensor provisioning is added.
  const [sensors] = useState<Sensor[]>([]);

  useEffect(() => {
    if (!deviceId) return;
    
    async function fetchDevice() {
      try {
        const docRef = doc(db, 'devices', deviceId as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDevice(docSnap.data() as Device);
        }
      } catch (err) {
        console.error("Failed to fetch device", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDevice();
  }, [deviceId]);
  
  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading device details...</div>;
  }

  if (!device) {
    return (
       <div className="p-8 max-w-lg mx-auto text-center space-y-4">
          <div className="bg-red-50 text-red-600 p-4 rounded-xl">Device not found</div>
          <Link href="/devices" className="btn btn-outline">Back to Devices</Link>
       </div>
    );
  }

  const isOnline = isDeviceOnline(device.lastSeen);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
         <Link href="/devices" className="btn btn-ghost btn-icon">
            <ArrowLeft className="h-5 w-5" />
         </Link>
         <div>
           <h1 className="text-2xl font-bold">{device.name}</h1>
           <p className="text-sm mt-1" style={{ color: 'var(--muted-fg)' }}>
             Device Code: {device.deviceCode}
           </p>
         </div>
         <div className="ml-auto flex items-center gap-2">
            <span className={`badge ${isOnline ? 'badge-online' : 'badge-offline'} px-3 py-1 text-sm`}>
               {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
         </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         {/* Device Overview */}
         <div className="card rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2" style={{ borderColor: 'var(--border)' }}>Device Overview</h2>
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2" style={{ color: 'var(--muted-fg)' }}>
                     <Clock className="h-4 w-4" />
                     <span className="text-sm">Last Seen</span>
                  </div>
                  <span className="text-sm font-medium">{formatRelativeTime(device.lastSeen)}</span>
               </div>
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2" style={{ color: 'var(--muted-fg)' }}>
                     <Power className="h-4 w-4" />
                     <span className="text-sm">Uptime</span>
                  </div>
                  <span className="text-sm font-medium">{formatUptime(device.uptime || 0)}</span>
               </div>
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2" style={{ color: 'var(--muted-fg)' }}>
                     <ShieldCheck className="h-4 w-4" />
                     <span className="text-sm">Firmware Version</span>
                  </div>
                  <span className="badge badge-info">{device.firmwareVersion}</span>
               </div>
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2" style={{ color: 'var(--muted-fg)' }}>
                     <Battery className="h-4 w-4" />
                     <span className="text-sm">Battery Level</span>
                  </div>
                  <span className="text-sm font-medium">{device.batteryLevel}%</span>
               </div>
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2" style={{ color: 'var(--muted-fg)' }}>
                     <Wifi className="h-4 w-4" />
                     <span className="text-sm">Wi-Fi Signal</span>
                  </div>
                  <span className="text-sm font-medium">{device.wifiSignal} dBm</span>
               </div>
            </div>
         </div>

         {/* Sensor Health */}
         <div className="card rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2" style={{ borderColor: 'var(--border)' }}>Sensor Health</h2>
            {sensors.length === 0 ? (
               <div className="text-sm" style={{ color: 'var(--muted-fg)' }}>No sensors provisioned for this device. Requires physical test.</div>
            ) : (
            <div className="space-y-3">
               {sensors.map((sensor) => {
                  const connected = sensor.status === 'CONNECTED' && isOnline;
                  return (
                     <div key={sensor.id} className="flex items-center justify-between rounded-xl p-3"
                        style={{ background: 'var(--muted)' }}>
                        <div className="flex items-center gap-3">
                           <Activity className={`h-5 w-5 ${connected ? 'text-emerald-500' : 'text-slate-400'}`} />
                           <div>
                              <p className="text-sm font-medium">{sensor.name}</p>
                              <p className="text-xs" style={{ color: 'var(--muted-fg)' }}>
                                 {sensor.type} · {METRIC_CONFIGS[sensor.metric]?.label}
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
            )}
         </div>
      </div>
    </div>
  );
}
