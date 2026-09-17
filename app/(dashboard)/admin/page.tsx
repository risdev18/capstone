'use client';

import { useAuth } from '@/lib/auth/context';
import { Shield, Users, Cpu, AlertTriangle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminOverviewPage() {
  const { profile } = useAuth();
  
  // Basic guard (layout also guards, but just to be sure)
  if (profile?.role !== 'ADMIN' && profile?.role !== 'SUPER_ADMIN') {
     return <div className="p-8 text-center text-red-500">Access Denied. Admin privileges required.</div>;
  }

  const adminModules = [
    { name: 'User Management', icon: Users, desc: 'Manage patients, caretakers, and system access.', link: '/admin/users' },
    { name: 'Device Management', icon: Cpu, desc: 'Provision and monitor all connected IoT devices.', link: '/admin/devices' },
    { name: 'Global Thresholds', icon: AlertTriangle, desc: 'Configure system-wide alert thresholds and rules.', link: '/admin/alerts' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
         <div className="p-3 bg-red-100 dark:bg-red-900 rounded-xl text-red-600 dark:text-red-400">
            <Shield className="h-6 w-6" />
         </div>
         <div>
            <h1 className="text-2xl font-bold">Administration Overview</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-fg)' }}>
               System management and configuration panel.
            </p>
         </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
         {adminModules.map(mod => (
            <Link key={mod.name} href={mod.link} className="card rounded-2xl p-6 card-hover group block">
               <mod.icon className="h-8 w-8 text-sky-500 mb-4" />
               <h2 className="text-lg font-semibold mb-2">{mod.name}</h2>
               <p className="text-sm mb-4" style={{ color: 'var(--muted-fg)' }}>{mod.desc}</p>
               <div className="flex items-center text-sm font-medium text-sky-500 group-hover:translate-x-1 transition-transform">
                  Manage <ChevronRight className="h-4 w-4 ml-1" />
               </div>
            </Link>
         ))}
      </div>
      
      <div className="card rounded-2xl p-6 mt-8 border-l-4 border-l-red-500">
         <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">Security Notice</h3>
         <p className="text-sm" style={{ color: 'var(--muted-fg)' }}>
            You are currently logged in with <strong>{profile.role}</strong> privileges. 
            All actions taken within the administration panel are logged and audited. 
            Please ensure you follow organizational guidelines when modifying users or global thresholds.
         </p>
      </div>
    </div>
  );
}
