'use client';

import { Check, X, AlertTriangle, RefreshCw, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MedicationHistoryPage() {
  const historyEvents = [
    {
      id: 1,
      date: 'Today',
      time: '08:00 AM',
      medicine: 'Lisinopril 10mg',
      compartment: 'Slot C01',
      expected: 1,
      detected: 1,
      status: 'TAKEN',
      reason: 'Taken on schedule via IR sensor verify',
      icon: <Check size={14} className="text-white" />,
      color: 'bg-emerald-500',
    },
    {
      id: 2,
      date: 'Today',
      time: '08:15 AM',
      medicine: 'Metformin 500mg',
      compartment: 'Slot C02',
      expected: 1,
      detected: 1,
      status: 'TAKEN',
      reason: 'Taken with breakfast',
      icon: <Check size={14} className="text-white" />,
      color: 'bg-emerald-500',
    },
    {
      id: 3,
      date: 'Today',
      time: '01:00 PM',
      medicine: 'Vitamin D3 1000 IU',
      compartment: 'Slot C03',
      expected: 1,
      detected: 1,
      status: 'TAKEN',
      reason: 'Taken at lunch',
      icon: <Check size={14} className="text-white" />,
      color: 'bg-emerald-500',
    },
    {
      id: 4,
      date: 'Yesterday',
      time: '08:00 PM',
      medicine: 'Atorvastatin 20mg',
      compartment: 'Slot C04',
      expected: 1,
      detected: 1,
      status: 'TAKEN',
      reason: 'Taken before bedtime',
      icon: <Check size={14} className="text-white" />,
      color: 'bg-emerald-500',
    },
    {
      id: 5,
      date: 'Yesterday',
      time: '01:00 PM',
      medicine: 'Vitamin D3 1000 IU',
      compartment: 'Slot C03',
      expected: 1,
      detected: 0,
      status: 'MISSED',
      reason: 'Compartment was not opened within schedule window',
      icon: <X size={14} className="text-white" />,
      color: 'bg-red-500',
    },
    {
      id: 6,
      date: '2 days ago',
      time: '08:00 AM',
      medicine: 'Lisinopril 10mg',
      compartment: 'Slot C01',
      expected: 1,
      detected: 1,
      status: 'REPLACEMENT',
      reason: 'First dose dropped; replacement taken immediately',
      icon: <RefreshCw size={14} className="text-white" />,
      color: 'bg-amber-500',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/medicines" className="btn btn-ghost btn-icon">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medication History</h1>
          <p className="text-muted-foreground mt-1">
            Immutable chronological timeline of medication dispense events and sensor detections.
          </p>
        </div>
      </div>

      <div className="card rounded-2xl shadow-sm overflow-hidden">
        <div className="table-wrapper border-none">
          <table className="table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Medicine & Slot</th>
                <th className="text-center">Expected</th>
                <th className="text-center">Detected</th>
                <th>Outcome / Verification Note</th>
              </tr>
            </thead>
            <tbody>
              {historyEvents.map((event) => (
                <tr key={event.id}>
                  <td className="whitespace-nowrap">
                    <div className="font-semibold text-sm">{event.date}</div>
                    <div className="text-xs text-[var(--muted-fg)]">{event.time}</div>
                  </td>
                  <td>
                    <div className="font-bold text-sm">{event.medicine}</div>
                    <span className="text-xs font-mono text-[var(--muted-fg)]">{event.compartment}</span>
                  </td>
                  <td className="text-center font-mono text-sm">{event.expected}</td>
                  <td className="text-center font-mono text-sm">{event.detected}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-full ${event.color}`}>{event.icon}</div>
                      <span
                        className={`text-xs font-medium ${
                          event.status === 'TAKEN'
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : event.status === 'MISSED'
                            ? 'text-red-700 dark:text-red-300'
                            : 'text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {event.reason}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
