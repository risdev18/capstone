"use client";

import { useState, useEffect } from "react";
import { Plus, Pill, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import type { Medication, MedicationSchedule } from "@/types/medication";

export default function MedicinesPage() {
  const { profile } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.uid) return;

    const fetchMedications = async () => {
      try {
        const res = await fetch(`/api/medications?userId=${profile.uid}`);
        const data = await res.json();
        if (data.success) {
          setMedications(data.data.medications);
          setSchedules(data.data.schedules);
        }
      } catch (error) {
        console.error("Failed to fetch medications", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedications();
  }, [profile?.uid]);

  const getNextDose = (medId: string) => {
    const medSchedules = schedules.filter((s) => s.medicationId === medId && s.enabled);
    if (medSchedules.length === 0) return "Not scheduled";
    // Sort schedules by time
    medSchedules.sort((a, b) => a.time.localeCompare(b.time));
    // For simplicity, just showing the first schedule time
    return medSchedules[0].time;
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medicines</h1>
          <p className="text-muted-foreground mt-2">Manage your smart medication and track adherence.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
          <Plus size={18} />
          Add Medicine
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin text-blue-500 h-8 w-8" />
        </div>
      ) : medications.length === 0 ? (
        <div className="text-center py-12 bg-white border rounded-xl shadow-sm">
          <Pill size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No medicines added</h3>
          <p className="text-gray-500 mb-6">You haven't added any medications to your smart box yet.</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors">
            <Plus size={18} />
            Add Your First Medicine
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {medications.map((med) => {
            const isLowStock = med.quantityRemaining <= (med.lowStockThreshold || 5);
            
            return (
              <div 
                key={med.id} 
                className={`bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${
                  isLowStock ? 'border-red-200' : ''
                }`}
              >
                {isLowStock && (
                  <div className="absolute top-0 right-0 p-2 text-red-500">
                    <AlertTriangle size={20} />
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-lg ${isLowStock ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                    <Pill size={24} />
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    isLowStock ? 'bg-red-100 text-red-700 mr-6' : 'bg-green-100 text-green-700'
                  }`}>
                    {isLowStock ? 'Low Stock' : 'Active'}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold mb-1">{med.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{med.dosage} • {med.form}</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1.5"><Clock size={14} /> Next Dose</span>
                    <span className="font-medium">{getNextDose(med.id)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={isLowStock ? 'text-red-500 font-medium' : 'text-gray-500'}>Remaining</span>
                    <span className={`font-medium ${isLowStock ? 'text-red-600 font-bold' : 'text-amber-600'}`}>
                      {med.quantityRemaining} {med.unit || med.form.toLowerCase()}s
                    </span>
                  </div>
                </div>
                
                <div className="mt-5 pt-4 border-t flex justify-between items-center">
                  <span className="text-sm text-gray-500">Compartment {med.compartmentId}</span>
                  <button className="text-blue-600 text-sm font-medium hover:underline">
                    {isLowStock ? 'Refill Now' : 'View Details'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
