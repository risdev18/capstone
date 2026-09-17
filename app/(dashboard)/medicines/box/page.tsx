"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";

export default function MedicineBoxPage() {
  // Generate 15 placeholder compartments
  const compartments = Array.from({ length: 15 }).map((_, i) => {
    const id = `C${String(i + 1).padStart(2, '0')}`;
    // Mock data for demo purposes
    const isActive = i === 0 || i === 3;
    return {
      id,
      medicine: isActive ? (i === 0 ? "Paracetamol" : "Amoxicillin") : "Empty",
      quantity: isActive ? (i === 0 ? 12 : 3) : 0,
      nextDose: isActive ? (i === 0 ? "08:00 AM" : "01:00 PM") : "--",
      weight: isActive ? (i === 0 ? 6.2 : 1.5) : 0.0,
      sensorOk: true,
      isActive,
      isLowStock: i === 3
    };
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Smart Box Overview</h1>
        <p className="text-muted-foreground mt-2">Live hardware status of your 15-compartment SmartHealth Box.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {compartments.map((comp) => (
          <div 
            key={comp.id} 
            className={`border rounded-xl p-4 transition-all ${
              comp.isActive 
                ? (comp.isLowStock ? 'bg-red-50/50 border-red-200' : 'bg-white border-blue-100 shadow-sm') 
                : 'bg-gray-50/50 border-gray-100 text-gray-400'
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <span className={`font-bold text-lg ${comp.isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                {comp.id}
              </span>
              {comp.isActive && (
                comp.isLowStock ? 
                  <AlertCircle size={18} className="text-red-500" /> : 
                  <CheckCircle2 size={18} className="text-green-500" />
              )}
            </div>
            
            <div className="space-y-1 mb-4">
              <p className={`font-semibold truncate ${!comp.isActive && 'text-gray-400'}`}>
                {comp.medicine}
              </p>
              {comp.isActive && (
                <p className={`text-sm ${comp.isLowStock ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                  {comp.quantity} units
                </p>
              )}
            </div>

            {comp.isActive && (
              <div className="text-xs space-y-1.5 pt-3 border-t">
                <div className="flex justify-between text-gray-500">
                  <span>Next:</span>
                  <span className="font-medium text-gray-700">{comp.nextDose}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Weight:</span>
                  <span className="font-medium text-gray-700">{comp.weight.toFixed(1)}g</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
