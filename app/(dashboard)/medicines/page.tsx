'use client';

import { useState, useEffect } from 'react';
import { Plus, Pill, Clock, AlertTriangle, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import type { Medication, MedicationSchedule } from '@/types/medication';
import { MOCK_MEDICATIONS, MOCK_MEDICATION_SCHEDULES } from '@/lib/mock/mockData';
import Link from 'next/link';

export default function MedicinesPage() {
  const { profile } = useAuth();
  const [medications, setMedications] = useState<Medication[]>(MOCK_MEDICATIONS);
  const [schedules, setSchedules] = useState<MedicationSchedule[]>(MOCK_MEDICATION_SCHEDULES);
  const [loading, setLoading] = useState(true);
  const [isUsingDemoData, setIsUsingDemoData] = useState(false);

  useEffect(() => {
    if (!profile?.uid) {
      setLoading(false);
      return;
    }

    const fetchMedications = async () => {
      try {
        const res = await fetch(`/api/medications?userId=${profile.uid}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.medications?.length > 0) {
            setMedications(data.data.medications);
            setSchedules(data.data.schedules ?? []);
            setIsUsingDemoData(false);
            return;
          }
        }
        // Fallback to rich mock medications when no DB records exist
        setMedications(MOCK_MEDICATIONS);
        setSchedules(MOCK_MEDICATION_SCHEDULES);
        setIsUsingDemoData(true);
      } catch {
        setMedications(MOCK_MEDICATIONS);
        setSchedules(MOCK_MEDICATION_SCHEDULES);
        setIsUsingDemoData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMedications();
  }, [profile?.uid]);

  const getNextDose = (medId: string) => {
    const medSchedules = schedules.filter((s) => s.medicationId === medId && s.enabled);
    if (medSchedules.length === 0) return 'Not scheduled';
    medSchedules.sort((a, b) => a.time.localeCompare(b.time));
    return medSchedules[0].time;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medicines</h1>
          <p className="text-muted-foreground mt-1">
            Manage your smart pillbox medications, dosage schedules, and track adherence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/medicines/box" className="btn btn-outline btn-sm">
            View Smart Box
          </Link>
          <button className="btn btn-primary btn-sm flex items-center gap-2">
            <Plus size={16} />
            Add Medicine
          </button>
        </div>
      </div>

      {/* ── Demo Notice Pill if using mock data ── */}
      {isUsingDemoData && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 text-xs">
          <Sparkles className="h-4 w-4 flex-shrink-0 text-sky-500" />
          <span>
            Displaying simulated medication regimens linked to MediBox Smart Hub compartments. Adding real medicines will store them to your hardware profile.
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin text-sky-500 h-8 w-8" />
        </div>
      ) : medications.length === 0 ? (
        <div className="text-center py-12 card rounded-2xl">
          <Pill size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium mb-2">No medicines added</h3>
          <p className="text-muted-foreground mb-6">You haven&apos;t added any medications to your smart box yet.</p>
          <button className="btn btn-primary inline-flex items-center gap-2">
            <Plus size={16} />
            Add Your First Medicine
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {medications.map((med) => {
            const isLowStock = med.quantityRemaining <= (med.lowStockThreshold || 5);

            return (
              <div
                key={med.id}
                className={`card card-hover rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between ${
                  isLowStock ? 'border-red-300 dark:border-red-800' : ''
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className={`p-3 rounded-xl ${
                        isLowStock
                          ? 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400'
                          : 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400'
                      }`}
                    >
                      <Pill size={22} />
                    </div>
                    <span
                      className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                        isLowStock
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {isLowStock ? 'Low Stock' : 'Active'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold mb-0.5">{med.name}</h3>
                  <p className="text-xs text-[var(--muted-fg)] mb-3">
                    {med.genericName ?? med.name}
                  </p>
                  <p className="text-xs font-medium text-foreground bg-[var(--muted)] px-2 py-1 rounded-lg w-fit mb-4">
                    {med.dosage} • {med.form}
                  </p>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-fg)] flex items-center gap-1.5">
                        <Clock size={13} /> Next Dose:
                      </span>
                      <span className="font-semibold">{getNextDose(med.id)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-fg)]">Remaining:</span>
                      <span className={`font-bold ${isLowStock ? 'text-red-500' : 'text-foreground'}`}>
                        {med.quantityRemaining} {med.unit}s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-fg)]">Instructions:</span>
                      <span className="font-medium text-right text-[11px] max-w-[150px] truncate" title={med.instructions}>
                        {med.instructions}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t flex justify-between items-center text-xs" style={{ borderColor: 'var(--border)' }}>
                  <span className="font-semibold text-sky-600 dark:text-sky-400">
                    Slot #{med.compartmentId}
                  </span>
                  <Link
                    href="/medicines/box"
                    className="text-xs font-semibold hover:underline"
                    style={{ color: isLowStock ? 'var(--color-critical)' : 'var(--color-primary)' }}
                  >
                    {isLowStock ? 'Refill Needed' : 'View Slot'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
