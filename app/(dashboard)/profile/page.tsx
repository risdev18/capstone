'use client';

import { useAuth } from '@/lib/auth/context';
import { Mail, Phone, Calendar, HeartPulse } from 'lucide-react';

export default function ProfilePage() {
  const { profile } = useAuth();

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-fg)' }}>
          View and manage your personal health profile.
        </p>
      </div>

      <div className="card p-6">
        <div className="flex items-start gap-6">
          <div className="h-24 w-24 rounded-2xl hero-gradient flex items-center justify-center text-white text-3xl font-bold shadow-lg shrink-0">
            {profile?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold">{profile?.name || 'Loading...'}</h2>
              <span className="badge badge-info mt-1 text-[10px]">{profile?.role || 'USER'}</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" style={{ color: 'var(--muted-fg)' }} />
                <span className="text-sm">{profile?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" style={{ color: 'var(--muted-fg)' }} />
                <span className="text-sm">{profile?.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" style={{ color: 'var(--muted-fg)' }} />
                <span className="text-sm">DOB: {profile?.dateOfBirth || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartPulse className="h-4 w-4" style={{ color: 'var(--muted-fg)' }} />
                <span className="text-sm">Blood: {profile?.bloodGroup || 'Not provided'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid sm:grid-cols-2 gap-6">
         <div className="card p-6">
            <h3 className="font-semibold mb-4 border-b pb-2" style={{ borderColor: 'var(--border)' }}>Physical Details</h3>
            <div className="space-y-2 text-sm">
               <p><span className="w-24 inline-block" style={{ color: 'var(--muted-fg)' }}>Height:</span> {profile?.height ? `${profile.height} cm` : '-'}</p>
               <p><span className="w-24 inline-block" style={{ color: 'var(--muted-fg)' }}>Weight:</span> {profile?.weight ? `${profile.weight} kg` : '-'}</p>
               <p><span className="w-24 inline-block" style={{ color: 'var(--muted-fg)' }}>Gender:</span> {profile?.gender || '-'}</p>
            </div>
         </div>
         <div className="card p-6">
            <h3 className="font-semibold mb-4 border-b pb-2" style={{ borderColor: 'var(--border)' }}>Emergency Contact</h3>
            <div className="space-y-2 text-sm">
               <p><span className="w-24 inline-block" style={{ color: 'var(--muted-fg)' }}>Name:</span> {profile?.emergencyContact?.name || '-'}</p>
               <p><span className="w-24 inline-block" style={{ color: 'var(--muted-fg)' }}>Phone:</span> {profile?.emergencyContact?.phone || '-'}</p>
            </div>
         </div>
      </div>
    </div>
  );
}
