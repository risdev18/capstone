"use client";

import { Check, X, AlertTriangle, RefreshCw } from "lucide-react";

export default function MedicationHistoryPage() {
  const historyEvents = [
    {
      id: 1,
      date: "02 Sep",
      time: "08:00 AM",
      medicine: "Paracetamol",
      expected: 1,
      detected: 1,
      status: "TAKEN",
      reason: "✓ Taken",
      icon: <Check size={16} className="text-white" />,
      color: "bg-green-500"
    },
    {
      id: 2,
      date: "02 Sep",
      time: "01:00 PM",
      medicine: "Amoxicillin",
      expected: 1,
      detected: 0,
      status: "MISSED",
      reason: "✕ Missed",
      icon: <X size={16} className="text-white" />,
      color: "bg-red-500"
    },
    {
      id: 3,
      date: "03 Sep",
      time: "08:00 AM",
      medicine: "Paracetamol",
      expected: 1,
      detected: 1,
      status: "REPLACEMENT",
      reason: "⚠ First tablet discarded, replacement taken",
      icon: <RefreshCw size={16} className="text-white" />,
      color: "bg-amber-500"
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Medication History</h1>
        <p className="text-muted-foreground mt-2">Immutable timeline of your medication events and sensor detections.</p>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Date & Time</th>
                <th className="px-6 py-4 font-medium">Medicine</th>
                <th className="px-6 py-4 font-medium text-center">Expected</th>
                <th className="px-6 py-4 font-medium text-center">Detected</th>
                <th className="px-6 py-4 font-medium">Result / Reason</th>
              </tr>
            </thead>
            <tbody>
              {historyEvents.map((event) => (
                <tr key={event.id} className="border-b hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{event.date}</div>
                    <div className="text-gray-500">{event.time}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {event.medicine}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">
                    {event.expected}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">
                    {event.detected}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-full ${event.color}`}>
                        {event.icon}
                      </div>
                      <span className={`font-medium ${
                        event.status === 'TAKEN' ? 'text-green-700' : 
                        event.status === 'MISSED' ? 'text-red-700' : 'text-amber-700'
                      }`}>
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
