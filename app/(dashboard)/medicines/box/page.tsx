'use client';

import { CheckCircle2, AlertCircle, Cpu, Scale, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { MOCK_MEDICATIONS, MOCK_MEDICATION_SCHEDULES } from '@/lib/mock/mockData';

export default function MedicineBoxPage() {
  // Map 15 hardware compartments
  const compartments = Array.from({ length: 15 }).map((_, i) => {
    const slotNumber = (i + 1).toString();
    const id = `C${String(i + 1).padStart(2, '0')}`;
    const med = MOCK_MEDICATIONS.find((m) => m.compartmentId === slotNumber);
    const schedule = med
      ? MOCK_MEDICATION_SCHEDULES.find((s) => s.medicationId === med.id)
      : null;

    const isActive = Boolean(med);
    const isLowStock = med ? med.quantityRemaining <= med.lowStockThreshold : false;

    // Simulated load cell weight (avg 0.25g to 0.4g per tablet)
    const weight = med ? parseFloat((med.quantityRemaining * 0.32).toFixed(1)) : 0.0;

    return {
      id,
      slotNumber,
      medicine: med ? med.name : 'Empty Slot',
      generic: med?.genericName,
      quantity: med?.quantityRemaining ?? 0,
      dosage: med?.dosage ?? '',
      nextDose: schedule ? schedule.time : '--',
      weight,
      sensorOk: true,
      isActive,
      isLowStock,
    };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/medicines" className="btn btn-ghost btn-icon">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Smart Box Overview</h1>
            <p className="text-muted-foreground mt-1">
              Live hardware telemetry of your 15-compartment MediBox pill dispenser.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-normal flex items-center gap-1.5 py-1 px-3">
            <span className="live-dot" /> Hardware Hub Active
          </span>
        </div>
      </div>

      {/* ── Status Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {compartments.map((comp) => (
          <div
            key={comp.id}
            className={`border rounded-2xl p-4 transition-all flex flex-col justify-between min-h-[170px] card-hover ${
              comp.isActive
                ? comp.isLowStock
                  ? 'bg-red-500/5 border-red-500/30'
                  : 'bg-[var(--card)] border-blue-500/25 shadow-sm'
                : 'bg-[var(--muted)]/40 border-[var(--border)] text-[var(--muted-fg)] opacity-75'
            }`}
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className={`font-mono font-bold text-sm ${comp.isActive ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-400'}`}>
                  {comp.id}
                </span>
                {comp.isActive && (
                  comp.isLowStock ? (
                    <span className="badge badge-critical text-[10px] py-0 px-1.5">Low</span>
                  ) : (
                    <span className="badge badge-normal text-[10px] py-0 px-1.5">Ready</span>
                  )
                )}
              </div>

              <p className={`font-bold text-base truncate ${comp.isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                {comp.medicine}
              </p>
              {comp.isActive && (
                <p className="text-xs text-[var(--muted-fg)] truncate">
                  {comp.dosage} • {comp.quantity} pills
                </p>
              )}
            </div>

            {comp.isActive ? (
              <div className="text-xs space-y-1 pt-3 border-t border-[var(--border)]">
                <div className="flex justify-between text-[var(--muted-fg)]">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Next:
                  </span>
                  <span className="font-semibold text-foreground">{comp.nextDose}</span>
                </div>
                <div className="flex justify-between text-[var(--muted-fg)]">
                  <span className="flex items-center gap-1">
                    <Scale className="h-3 w-3" /> Weight:
                  </span>
                  <span className="font-mono font-medium text-foreground">{comp.weight}g</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground pt-3 border-t border-[var(--border)]">
                Unassigned
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
