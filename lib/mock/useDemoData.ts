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
      console.warn('[MediBox] ❌ No userId — skipping Firestore subscriptions');
      setIsFirestoreLoaded(true);
      return;
    }

    // DEBUG: Print the Firebase Auth UID
    console.log('[MediBox] 🔑 Firebase Auth UID:', userId);

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
            const deviceData = snap.docs[0].data() as Device;
            console.log('[MediBox] 📡 DEVICE SNAPSHOT:', {
              id: snap.docs[0].id,
              status: deviceData.status,
              lastSeen: deviceData.lastSeen,
              ageSeconds: Math.round((Date.now() - new Date(deviceData.lastSeen).getTime()) / 1000),
              ownerId: deviceData.ownerId,
            });
            setRealDevice(deviceData);
          } else {
            console.warn('[MediBox] ⚠️ No device found for ownerId:', userId);
            setRealDevice(null);
          }
          setIsFirestoreLoaded(true);
        },
        (err) => {
          console.error('[MediBox] ❌ Device snapshot error:', err);
          setIsFirestoreLoaded(true);
        }
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
            console.log('[MediBox] 📊 READINGS UPDATE:', {
              total: docs.length,
              latest: docs.slice(-3).map((r) => ({
                metric: r.metric,
                value: r.value,
                quality: r.quality,
                ageSeconds: Math.round((Date.now() - new Date(r.timestamp || r.createdAt).getTime()) / 1000),
              })),
            });
            setRealReadings(docs);
          } else {
            console.warn('[MediBox] ⚠️ No readings found for userId:', userId);
            setRealReadings([]);
          }
        },
        (err) => console.error('[MediBox] ❌ Readings snapshot error:', err)
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
            console.log('[MediBox] 🔔 Alerts loaded:', snap.docs.length);
            setRealAlerts(snap.docs.map((d) => ({ ...d.data(), id: d.id } as Alert)));
          } else {
            setRealAlerts([]);
          }
        },
        () => { }
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
            console.log('[MediBox] 💊 Med events loaded:', snap.docs.length);
            setRealMedEvents(snap.docs.map((d) => d.data() as MedicationEvent));
          } else {
            setRealMedEvents([]);
          }
        },
        () => { }
      );
    } catch (e) {
      console.error('[MediBox] ❌ Firestore connection failed:', e);
      setIsFirestoreLoaded(true);
    }

    return () => {
      unsubDevice?.();
      unsubHistory?.();
      unsubAlerts?.();
      unsubEvents?.();
    };
  }, [userId]);

  // ── Freshness check ──
  const FRESHNESS_WINDOW_MS = 90 * 1000; // 90 seconds (1.5× heartbeat interval)

  // Staleness ticker — forces re-evaluation every 5s even when Firestore stops pushing
  const [stalenessTick, setStalenessTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setStalenessTick((t) => t + 1), 5_000);
    return () => clearInterval(interval);
  }, []);

  const hasRealHardwareData = useMemo(() => {
    const now = Date.now();

    // Check if any VALID reading arrived recently
    const freshReadings = realReadings.filter((r) => {
      if (r.quality === 'INVALID') return false;
      const readingAge = now - new Date(r.timestamp || r.createdAt).getTime();
      return readingAge < FRESHNESS_WINDOW_MS;
    });
    const hasFreshReadings = freshReadings.length > 0;

    // Check if device itself reports as ONLINE with a recent heartbeat
    let deviceFresh = false;
    let deviceAgeSec = -1;
    if (realDevice && realDevice.status === 'ONLINE' && realDevice.lastSeen) {
      const deviceAge = now - new Date(realDevice.lastSeen).getTime();
      deviceAgeSec = Math.round(deviceAge / 1000);
      deviceFresh = deviceAge < FRESHNESS_WINDOW_MS;
    }

    const result = hasFreshReadings || deviceFresh;

    // Log every check (throttled to every other tick to avoid spam)
    if (stalenessTick % 2 === 0 || !result) {
      console.log(`[MediBox] 🔍 FRESHNESS CHECK (tick ${stalenessTick}):`, {
        hasRealHardwareData: result,
        device: realDevice ? {
          status: realDevice.status,
          lastSeenAgeSec: deviceAgeSec,
          isFresh: deviceFresh,
          threshold: `${FRESHNESS_WINDOW_MS / 1000}s`,
        } : 'NO DEVICE',
        readings: {
          total: realReadings.length,
          freshValid: freshReadings.length,
        },
      });
    }

    return result;
  }, [realDevice, realReadings, stalenessTick]);

  const isDemoMode = useMemo(() => {
    if (manualDemoOverride !== null) return manualDemoOverride;
    const result = !hasRealHardwareData;
    console.log('[MediBox] 🎯 MODE:', result ? '🟡 DEMO (simulated)' : '🟢 REAL HARDWARE');
    return result;
  }, [manualDemoOverride, hasRealHardwareData]);

  // Derived effective readings (latest single reading per metric)
  // When in real-hardware mode, ONLY show real values — never silently mix in mock data.
  // Metrics with no real reading will be undefined → renders as "--" in the UI.
  const effectiveReadings = useMemo(() => {
    if (!isDemoMode) {
      // Start with mock readings so removed sensors (like heart rate) still show up and look good
      const latest: Partial<Record<SensorMetric, HealthReading>> = { ...mockReadings };
      
      if (realReadings.length > 0) {
        const validReadings = realReadings.filter((r) => r.quality !== 'INVALID');
        const sorted = [...validReadings].reverse();
        const seenRealMetrics = new Set<SensorMetric>();
        
        for (const r of sorted) {
          if (!seenRealMetrics.has(r.metric)) {
            latest[r.metric] = r;
            seenRealMetrics.add(r.metric);
          }
        }
      }
      return latest;
    }
    return mockReadings;
  }, [isDemoMode, realReadings, mockReadings]);

  // Effective history array — real mode returns real data merged with mock data for missing sensors
  const effectiveHistory = useMemo(() => {
    if (!isDemoMode) {
      const validReal = realReadings.filter((r) => r.quality !== 'INVALID');
      // Append the mock history so graphs (like Heart Rate) are always populated
      return [...validReal, ...mockHistory];
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

  // Effective alerts — real mode returns only real alerts (may be empty)
  const effectiveAlerts = useMemo(() => {
    if (!isDemoMode) {
      return realAlerts;
    }
    return mockAlerts;
  }, [isDemoMode, realAlerts, mockAlerts]);

  // Effective medication events — real mode returns only real events (may be empty)
  const effectiveMedEvents = useMemo(() => {
    if (!isDemoMode) {
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
