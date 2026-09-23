/**
 * ============================================================================
 * DEMO / MOCK DATA HOOK & CONTROLLER — MediBox Dashboard
 * ============================================================================
 * Provides seamless automatic fallback:
 * - If real hardware is connected and sends Firestore documents, displays REAL data.
 * - If no real device / data exists, displays realistic SIMULATED data.
 * - Allows live toggling of demo scenarios (Normal, Warning, Critical)
 *   and interactive alert acknowledgments.
 *
 * REMOVE OR DISABLE THIS FILE WHEN REAL HARDWARE IS PERMANENTLY LIVE.
 * ============================================================================
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { db } from '@/lib/firebase/client';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  updateDoc,
  doc,
} from 'firebase/firestore';
import type { HealthReading, SensorMetric } from '@/types/health';
import type { Device, Sensor } from '@/types/device';
import type { Alert } from '@/types/alert';
import type { Medication, MedicationSchedule, MedicationEvent } from '@/types/medication';
import {
  MOCK_DEVICE,
  MOCK_SENSORS,
  MOCK_MEDICATIONS,
  MOCK_MEDICATION_SCHEDULES,
  MOCK_MEDICATION_EVENTS,
  generateMockLatestReadings,
  generateMockHistory,
  generateMockAlerts,
  getNextSimulatedReading,
  type DemoScenario,
} from './mockData';

export interface UseDemoDataOptions {
  userId?: string;
  enableLiveTicks?: boolean;
  tickIntervalMs?: number;
}

export function useDemoData(options?: UseDemoDataOptions) {
  const { userId, enableLiveTicks = false, tickIntervalMs = 3000 } = options ?? {};

  // Scenario state ('normal' | 'warning' | 'critical')
  const [demoScenario, setDemoScenario] = useState<DemoScenario>('normal');
  // Manual override toggle (undefined means auto-detect)
  const [manualDemoOverride, setManualDemoOverride] = useState<boolean | null>(null);

  // Real Data states from Firestore
  const [realDevice, setRealDevice] = useState<Device | null>(null);
  const [realReadings, setRealReadings] = useState<HealthReading[]>([]);
  const [realAlerts, setRealAlerts] = useState<Alert[]>([]);
  const [realMedEvents, setRealMedEvents] = useState<MedicationEvent[]>([]);
  const [isFirestoreLoaded, setIsFirestoreLoaded] = useState(false);

  // In-Memory Mock States (so user interactions like acknowledging alerts work live)
  const [mockReadings, setMockReadings] = useState<Partial<Record<SensorMetric, HealthReading>>>(
    () => generateMockLatestReadings(userId, 'normal')
  );
  const [mockHistory, setMockHistory] = useState<HealthReading[]>(
    () => generateMockHistory(userId, 24, 'normal')
  );
  const [mockAlerts, setMockAlerts] = useState<Alert[]>(
    () => generateMockAlerts(userId, 'normal')
  );
  const [mockMedEvents, setMockMedEvents] = useState<MedicationEvent[]>(MOCK_MEDICATION_EVENTS);
  const [mockMedications, setMockMedications] = useState<Medication[]>(MOCK_MEDICATIONS);
  const [mockSchedules] = useState<MedicationSchedule[]>(MOCK_MEDICATION_SCHEDULES);

  // Update mock data when demo scenario changes
  useEffect(() => {
    setMockReadings(generateMockLatestReadings(userId, demoScenario));
    setMockHistory(generateMockHistory(userId, 24, demoScenario));
    setMockAlerts(generateMockAlerts(userId, demoScenario));
  }, [demoScenario, userId]);

  // Real-time sensor live ticking simulation
  useEffect(() => {
    if (!enableLiveTicks) return;

    const interval = setInterval(() => {
      setMockReadings((prev) => {
        const next: Partial<Record<SensorMetric, HealthReading>> = { ...prev };
        const metrics: SensorMetric[] = [
          'heart_rate',
          'spo2',
          'temperature',
          'blood_pressure_systolic',
          'blood_pressure_diastolic',
        ];

        metrics.forEach((m) => {
          const current = prev[m];
          if (current) {
            const nextVal = getNextSimulatedReading(m, current.value, demoScenario);
            next[m] = {
              ...current,
              value: nextVal,
              timestamp: new Date().toISOString(),
            };
          }
        });

        return next;
      });
    }, tickIntervalMs);

    return () => clearInterval(interval);
  }, [enableLiveTicks, tickIntervalMs, demoScenario]);

  // Firestore Subscriptions for real hardware
  useEffect(() => {
    if (!userId) {
      setIsFirestoreLoaded(true);
      return;
    }

    let unsubDevice: (() => void) | undefined;
    let unsubHistory: (() => void) | undefined;
    let unsubAlerts: (() => void) | undefined;
    let unsubEvents: (() => void) | undefined;

    try {
      // 1. Primary Device
      const qDevice = query(collection(db, 'devices'), where('ownerId', '==', userId), limit(1));
      unsubDevice = onSnapshot(
        qDevice,
        (snap) => {
          if (!snap.empty) {
            setRealDevice(snap.docs[0].data() as Device);
          } else {
            setRealDevice(null);
          }
          setIsFirestoreLoaded(true);
        },
        () => setIsFirestoreLoaded(true)
      );

      // 2. Health Readings
      const qHistory = query(
        collection(db, 'readings'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      unsubHistory = onSnapshot(
        qHistory,
        (snap) => {
          if (!snap.empty) {
            const docs = snap.docs.map((d) => d.data() as HealthReading).reverse();
            setRealReadings(docs);
          } else {
            setRealReadings([]);
          }
        },
        () => {}
      );

      // 3. Alerts
      const qAlerts = query(
        collection(db, 'alerts'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      unsubAlerts = onSnapshot(
        qAlerts,
        (snap) => {
          if (!snap.empty) {
            setRealAlerts(snap.docs.map((d) => ({ ...d.data(), id: d.id } as Alert)));
          } else {
            setRealAlerts([]);
          }
        },
        () => {}
      );

      // 4. Medication Events
      const qEvents = query(
        collection(db, 'medicationEvents'),
        where('userId', '==', userId),
        orderBy('scheduledTime', 'desc'),
        limit(10)
      );
      unsubEvents = onSnapshot(
        qEvents,
        (snap) => {
          if (!snap.empty) {
            setRealMedEvents(snap.docs.map((d) => d.data() as MedicationEvent));
          } else {
            setRealMedEvents([]);
          }
        },
        () => {}
      );
    } catch (e) {
      console.warn('Firestore connection not active, defaulting to mock data.', e);
      setIsFirestoreLoaded(true);
    }

    return () => {
      unsubDevice?.();
      unsubHistory?.();
      unsubAlerts?.();
      unsubEvents?.();
    };
  }, [userId]);

  // Automatic preference logic:
  // If real data exists AND user hasn't forced manual mock, use real data.
  const hasRealHardwareData = useMemo(() => {
    return Boolean(realDevice || realReadings.length > 0 || realAlerts.length > 0);
  }, [realDevice, realReadings, realAlerts]);

  const isDemoMode = useMemo(() => {
    if (manualDemoOverride !== null) return manualDemoOverride;
    return !hasRealHardwareData;
  }, [manualDemoOverride, hasRealHardwareData]);

  // Derived effective readings (latest single reading per metric)
  const effectiveReadings = useMemo(() => {
    if (!isDemoMode && realReadings.length > 0) {
      const latest: Partial<Record<SensorMetric, HealthReading>> = {};
      const sorted = [...realReadings].reverse();
      for (const r of sorted) {
        if (!latest[r.metric]) {
          latest[r.metric] = r;
        }
      }
      return latest;
    }
    return mockReadings;
  }, [isDemoMode, realReadings, mockReadings]);

  // Effective history array
  const effectiveHistory = useMemo(() => {
    if (!isDemoMode && realReadings.length > 0) {
      return realReadings;
    }
    return mockHistory;
  }, [isDemoMode, realReadings, mockHistory]);

  // Effective device
  const effectiveDevice: Device | null = useMemo(() => {
    if (!isDemoMode && realDevice) {
      return realDevice;
    }
    return isDemoMode ? MOCK_DEVICE : null;
  }, [isDemoMode, realDevice]);

  // Effective sensors
  const effectiveSensors: Sensor[] = useMemo(() => {
    return MOCK_SENSORS;
  }, []);

  // Effective alerts
  const effectiveAlerts = useMemo(() => {
    if (!isDemoMode && realAlerts.length > 0) {
      return realAlerts;
    }
    return mockAlerts;
  }, [isDemoMode, realAlerts, mockAlerts]);

  // Effective medication events
  const effectiveMedEvents = useMemo(() => {
    if (!isDemoMode && realMedEvents.length > 0) {
      return realMedEvents;
    }
    return mockMedEvents;
  }, [isDemoMode, realMedEvents, mockMedEvents]);

  // Interactive Mock Actions (Seamless whether online or offline)
  const acknowledgeAlert = useCallback(
    async (alertId: string, acknowledgedBy = 'Sarah Jenkins') => {
      if (!isDemoMode && realAlerts.some((a) => a.id === alertId)) {
        try {
          await updateDoc(doc(db, 'alerts', alertId), {
            status: 'ACKNOWLEDGED',
            acknowledgedAt: new Date().toISOString(),
            acknowledgedBy,
          });
          return true;
        } catch (err) {
          console.error('Failed to acknowledge real alert', err);
          return false;
        }
      }

      // Handle in mock state
      setMockAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId
            ? {
                ...alert,
                status: 'ACKNOWLEDGED',
                acknowledgedAt: new Date().toISOString(),
                acknowledgedBy,
              }
            : alert
        )
      );
      return true;
    },
    [isDemoMode, realAlerts]
  );

  return {
    // Mode indicators
    isDemoMode,
    hasRealHardwareData,
    isFirestoreLoaded,
    demoScenario,
    setDemoScenario,
    setManualDemoOverride,
    toggleDemoMode: () => setManualDemoOverride((prev) => (prev === null ? !isDemoMode : !prev)),

    // Data streams
    device: effectiveDevice,
    sensors: effectiveSensors,
    readings: effectiveReadings,
    history: effectiveHistory,
    alerts: effectiveAlerts,
    medEvents: effectiveMedEvents,
    medications: mockMedications,
    schedules: mockSchedules,

    // Actions
    acknowledgeAlert,
  };
}
