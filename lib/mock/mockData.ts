/**
 * ============================================================================
 * DEMO / MOCK DATA SERVICE — MediBox Dashboard
 * ============================================================================
 * This file provides realistic simulated data for dashboard demonstration
 * when physical ESP32 hardware is not yet connected.
 *
 * REMOVE OR DISABLE THIS FILE WHEN REAL HARDWARE IS PERMANENTLY LIVE.
 * All data shapes strictly conform to @/types schemas without alterations.
 * ============================================================================
 */

import type { HealthReading, SensorMetric } from '@/types/health';
import type { Device, Sensor } from '@/types/device';
import type { Alert } from '@/types/alert';
import type { Medication, MedicationSchedule, MedicationEvent } from '@/types/medication';

// ─── Demo Constants ─────────────────────────────────────────────────────────

export const DEMO_DEVICE_ID = 'demobox-esp32-001';
export const DEMO_USER_ID = 'demo-user-001';

// ─── Mock Device & Sensors ──────────────────────────────────────────────────

export const MOCK_DEVICE: Device = {
  id: DEMO_DEVICE_ID,
  deviceCode: 'SHB-0001',
  name: 'MediBox Smart Hub #001',
  ownerId: DEMO_USER_ID,
  ownerName: 'Sarah Jenkins',
  status: 'ONLINE',
  firmwareVersion: 'v1.2.0',
  batteryLevel: 87,
  wifiSignal: -62, // Strong Wi-Fi
  lastSeen: new Date().toISOString(),
  uptime: 3 * 86400 + 14 * 3600 + 22 * 60, // 3d 14h 22m in seconds
  isActive: true,
  createdAt: new Date(Date.now() - 30 * 86400 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
};

export const MOCK_SENSORS: Sensor[] = [
  {
    id: 'sensor-max30102-hr',
    deviceId: DEMO_DEVICE_ID,
    name: 'Pulse Oximeter & Heart Rate',
    type: 'MAX30102 (Optical)',
    metric: 'heart_rate',
    unit: 'BPM',
    status: 'CONNECTED',
    isActive: true,
    lastReading: 74,
    lastReadingAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 30 * 86400 * 1000).toISOString(),
  },
  {
    id: 'sensor-max30102-spo2',
    deviceId: DEMO_DEVICE_ID,
    name: 'SpO₂ Blood Oxygen Sensor',
    type: 'MAX30102 (IR Channel)',
    metric: 'spo2',
    unit: '%',
    status: 'CONNECTED',
    isActive: true,
    lastReading: 98.2,
    lastReadingAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 30 * 86400 * 1000).toISOString(),
  },
  {
    id: 'sensor-ds18b20-temp',
    deviceId: DEMO_DEVICE_ID,
    name: 'Body Temperature Sensor',
    type: 'DS18B20 (Digital Thermistor)',
    metric: 'temperature',
    unit: '°C',
    status: 'CONNECTED',
    isActive: true,
    lastReading: 36.8,
    lastReadingAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 30 * 86400 * 1000).toISOString(),
  },
  {
    id: 'sensor-bp-systolic',
    deviceId: DEMO_DEVICE_ID,
    name: 'Blood Pressure Monitor (Systolic)',
    type: 'Oscillometric Cuff Interface',
    metric: 'blood_pressure_systolic',
    unit: 'mmHg',
    status: 'CONNECTED',
    isActive: true,
    lastReading: 118,
    lastReadingAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 30 * 86400 * 1000).toISOString(),
  },
  {
    id: 'sensor-bp-diastolic',
    deviceId: DEMO_DEVICE_ID,
    name: 'Blood Pressure Monitor (Diastolic)',
    type: 'Oscillometric Cuff Interface',
    metric: 'blood_pressure_diastolic',
    unit: 'mmHg',
    status: 'CONNECTED',
    isActive: true,
    lastReading: 76,
    lastReadingAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 30 * 86400 * 1000).toISOString(),
  },
];

// ─── Scenario Definitions ───────────────────────────────────────────────────

export type DemoScenario = 'normal' | 'warning' | 'critical';

export interface ScenarioValues {
  heart_rate: number;
  spo2: number;
  temperature: number;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
}

export function getScenarioValues(scenario: DemoScenario): ScenarioValues {
  switch (scenario) {
    case 'normal':
      return {
        heart_rate: 74,
        spo2: 98.4,
        temperature: 36.8,
        blood_pressure_systolic: 118,
        blood_pressure_diastolic: 76,
      };
    case 'warning':
      return {
        heart_rate: 112,
        spo2: 92.5,
        temperature: 37.9,
        blood_pressure_systolic: 138,
        blood_pressure_diastolic: 88,
      };
    case 'critical':
      return {
        heart_rate: 142,
        spo2: 87.8,
        temperature: 39.2,
        blood_pressure_systolic: 168,
        blood_pressure_diastolic: 106,
      };
  }
}

// ─── Mock Latest Health Readings ────────────────────────────────────────────

export function generateMockLatestReadings(
  userId: string = DEMO_USER_ID,
  scenario: DemoScenario = 'normal'
): Partial<Record<SensorMetric, HealthReading>> {
  const values = getScenarioValues(scenario);
  const now = new Date().toISOString();

  return {
    heart_rate: {
      id: `demo-reading-hr-${Date.now()}`,
      deviceId: DEMO_DEVICE_ID,
      userId,
      metric: 'heart_rate',
      value: values.heart_rate,
      unit: 'BPM',
      quality: 'VALID',
      source: 'DEMO',
      timestamp: now,
      createdAt: now,
    },
    spo2: {
      id: `demo-reading-spo2-${Date.now()}`,
      deviceId: DEMO_DEVICE_ID,
      userId,
      metric: 'spo2',
      value: values.spo2,
      unit: '%',
      quality: 'VALID',
      source: 'DEMO',
      timestamp: now,
      createdAt: now,
    },
    temperature: {
      id: `demo-reading-temp-${Date.now()}`,
      deviceId: DEMO_DEVICE_ID,
      userId,
      metric: 'temperature',
      value: values.temperature,
      unit: '°C',
      quality: 'VALID',
      source: 'DEMO',
      timestamp: now,
      createdAt: now,
    },
    blood_pressure_systolic: {
      id: `demo-reading-bps-${Date.now()}`,
      deviceId: DEMO_DEVICE_ID,
      userId,
      metric: 'blood_pressure_systolic',
      value: values.blood_pressure_systolic,
      unit: 'mmHg',
      quality: 'VALID',
      source: 'DEMO',
      timestamp: now,
      createdAt: now,
    },
    blood_pressure_diastolic: {
      id: `demo-reading-bpd-${Date.now()}`,
      deviceId: DEMO_DEVICE_ID,
      userId,
      metric: 'blood_pressure_diastolic',
      value: values.blood_pressure_diastolic,
      unit: 'mmHg',
      quality: 'VALID',
      source: 'DEMO',
      timestamp: now,
      createdAt: now,
    },
  };
}

// ─── Historical Readings Generator (24h / 7d) ───────────────────────────────

export function generateMockHistory(
  userId: string = DEMO_USER_ID,
  hours = 24,
  scenario: DemoScenario = 'normal'
): HealthReading[] {
  const readings: HealthReading[] = [];
  const now = Date.now();
  // 30 minute intervals
  const intervalMs = 30 * 60 * 1000;
  const count = Math.floor((hours * 60 * 60 * 1000) / intervalMs);
  const baseValues = getScenarioValues(scenario);

  const metrics: SensorMetric[] = [
    'heart_rate',
    'spo2',
    'temperature',
    'blood_pressure_systolic',
    'blood_pressure_diastolic',
  ];

  const unitMap: Record<SensorMetric, string> = {
    heart_rate: 'BPM',
    spo2: '%',
    temperature: '°C',
    blood_pressure_systolic: 'mmHg',
    blood_pressure_diastolic: 'mmHg',
  };

  for (let i = count; i >= 0; i--) {
    const timestamp = new Date(now - i * intervalMs);
    const timeRatio = i / count; // 1 down to 0
    // Subtle circadian rhythm wave
    const wave = Math.sin((timestamp.getHours() / 24) * 2 * Math.PI);

    for (const metric of metrics) {
      let noise = 0;
      let val = baseValues[metric as keyof ScenarioValues];

      switch (metric) {
        case 'heart_rate':
          // Circadian dip at night, slight variance
          noise = (Math.random() * 8 - 4) + wave * 5;
          val = Math.round(val + noise);
          break;
        case 'spo2':
          noise = (Math.random() * 1.2 - 0.6) + wave * 0.3;
          val = parseFloat(Math.min(100, Math.max(84, val + noise)).toFixed(1));
          break;
        case 'temperature':
          noise = (Math.random() * 0.3 - 0.15) + wave * 0.2;
          val = parseFloat((val + noise).toFixed(1));
          break;
        case 'blood_pressure_systolic':
          noise = (Math.random() * 8 - 4) + wave * 4;
          val = Math.round(val + noise);
          break;
        case 'blood_pressure_diastolic':
          noise = (Math.random() * 6 - 3) + wave * 3;
          val = Math.round(val + noise);
          break;
      }

      const iso = timestamp.toISOString();
      readings.push({
        id: `mock-hist-${metric}-${i}`,
        deviceId: DEMO_DEVICE_ID,
        userId,
        metric,
        value: val,
        unit: unitMap[metric],
        quality: 'VALID',
        source: 'DEMO',
        timestamp: iso,
        createdAt: iso,
      });
    }
  }

  return readings;
}

// ─── Mock Medications & Pillbox ─────────────────────────────────────────────

export const MOCK_MEDICATIONS: Medication[] = [
  {
    id: 'med-001',
    userId: DEMO_USER_ID,
    deviceId: DEMO_DEVICE_ID,
    name: 'Lisinopril',
    genericName: 'Lisinopril (Blood Pressure)',
    dosage: '10mg',
    unit: 'tablet',
    form: 'Oral Tablet',
    compartmentId: '1',
    quantityRemaining: 24,
    initialQuantity: 30,
    lowStockThreshold: 7,
    instructions: 'Take 1 tablet every morning with water before breakfast.',
    foodTiming: 'BEFORE_FOOD',
    startDate: new Date(Date.now() - 14 * 86400 * 1000).toISOString(),
    isActive: true,
    createdAt: new Date(Date.now() - 14 * 86400 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'med-002',
    userId: DEMO_USER_ID,
    deviceId: DEMO_DEVICE_ID,
    name: 'Metformin',
    genericName: 'Metformin HCl (Glycemic Control)',
    dosage: '500mg',
    unit: 'tablet',
    form: 'Oral Tablet',
    compartmentId: '2',
    quantityRemaining: 18,
    initialQuantity: 30,
    lowStockThreshold: 5,
    instructions: 'Take 1 tablet with meals twice daily.',
    foodTiming: 'WITH_FOOD',
    startDate: new Date(Date.now() - 20 * 86400 * 1000).toISOString(),
    isActive: true,
    createdAt: new Date(Date.now() - 20 * 86400 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'med-003',
    userId: DEMO_USER_ID,
    deviceId: DEMO_DEVICE_ID,
    name: 'Vitamin D3',
    genericName: 'Cholecalciferol',
    dosage: '1000 IU',
    unit: 'capsule',
    form: 'Softgel Capsule',
    compartmentId: '3',
    quantityRemaining: 3, // LOW STOCK TRIGGER
    initialQuantity: 30,
    lowStockThreshold: 5,
    instructions: 'Take 1 capsule at lunchtime with food.',
    foodTiming: 'WITH_FOOD',
    startDate: new Date(Date.now() - 27 * 86400 * 1000).toISOString(),
    isActive: true,
    createdAt: new Date(Date.now() - 27 * 86400 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'med-004',
    userId: DEMO_USER_ID,
    deviceId: DEMO_DEVICE_ID,
    name: 'Atorvastatin',
    genericName: 'Atorvastatin Calcium (Cholesterol)',
    dosage: '20mg',
    unit: 'tablet',
    form: 'Film-coated Tablet',
    compartmentId: '4',
    quantityRemaining: 26,
    initialQuantity: 30,
    lowStockThreshold: 6,
    instructions: 'Take 1 tablet at bedtime.',
    foodTiming: 'ANYTIME',
    startDate: new Date(Date.now() - 10 * 86400 * 1000).toISOString(),
    isActive: true,
    createdAt: new Date(Date.now() - 10 * 86400 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_MEDICATION_SCHEDULES: MedicationSchedule[] = [
  {
    id: 'sched-001',
    medicationId: 'med-001',
    userId: DEMO_USER_ID,
    time: '08:00',
    quantity: 1,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sched-002',
    medicationId: 'med-002',
    userId: DEMO_USER_ID,
    time: '08:15',
    quantity: 1,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sched-003',
    medicationId: 'med-003',
    userId: DEMO_USER_ID,
    time: '13:00',
    quantity: 1,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sched-004',
    medicationId: 'med-004',
    userId: DEMO_USER_ID,
    time: '20:00',
    quantity: 1,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_MEDICATION_EVENTS: MedicationEvent[] = [
  {
    id: 'event-001',
    userId: DEMO_USER_ID,
    deviceId: DEMO_DEVICE_ID,
    medicationId: 'med-001',
    compartmentId: '1',
    scheduledTime: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    eventTime: new Date(Date.now() - 3.9 * 3600 * 1000).toISOString(),
    expectedQuantity: 1,
    detectedQuantity: 1,
    status: 'TAKEN',
    source: 'DEMO',
    reason: 'Taken on schedule (Lisinopril 10mg)',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: 'event-002',
    userId: DEMO_USER_ID,
    deviceId: DEMO_DEVICE_ID,
    medicationId: 'med-002',
    compartmentId: '2',
    scheduledTime: new Date(Date.now() - 3.8 * 3600 * 1000).toISOString(),
    eventTime: new Date(Date.now() - 3.7 * 3600 * 1000).toISOString(),
    expectedQuantity: 1,
    detectedQuantity: 1,
    status: 'TAKEN',
    source: 'DEMO',
    reason: 'Taken on schedule (Metformin 500mg)',
    createdAt: new Date(Date.now() - 3.8 * 3600 * 1000).toISOString(),
  },
  {
    id: 'event-003',
    userId: DEMO_USER_ID,
    deviceId: DEMO_DEVICE_ID,
    medicationId: 'med-003',
    compartmentId: '3',
    scheduledTime: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(),
    eventTime: new Date(Date.now() - 1.2 * 3600 * 1000).toISOString(),
    expectedQuantity: 1,
    detectedQuantity: 1,
    status: 'TAKEN',
    source: 'DEMO',
    reason: 'Taken with lunch (Vitamin D3)',
    createdAt: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'event-004',
    userId: DEMO_USER_ID,
    deviceId: DEMO_DEVICE_ID,
    medicationId: 'med-004',
    compartmentId: '4',
    scheduledTime: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
    expectedQuantity: 1,
    status: 'SCHEDULED',
    source: 'DEMO',
    reason: 'Upcoming evening dose (Atorvastatin 20mg)',
    createdAt: new Date().toISOString(),
  },
];

// ─── Mock Alerts (Info / Warning / Critical) ─────────────────────────────────

export function generateMockAlerts(
  userId: string = DEMO_USER_ID,
  scenario: DemoScenario = 'normal'
): Alert[] {
  const alerts: Alert[] = [];
  const now = Date.now();

  // Active Alert for Warning / Critical
  if (scenario === 'critical') {
    alerts.push({
      id: 'mock-alert-crit-1',
      userId,
      deviceId: DEMO_DEVICE_ID,
      metric: 'spo2',
      value: 87.8,
      unit: '%',
      threshold: { min: 90, type: 'MIN' },
      severity: 'CRITICAL',
      status: 'UNACKNOWLEDGED',
      message: 'SpO₂ reading (87.8%) is critically below the configured safety threshold (min: 90%). Emergency caregiver alert dispatched.',
      createdAt: new Date(now - 12 * 60 * 1000).toISOString(),
    });
    alerts.push({
      id: 'mock-alert-crit-2',
      userId,
      deviceId: DEMO_DEVICE_ID,
      metric: 'heart_rate',
      value: 142,
      unit: 'BPM',
      threshold: { max: 130, type: 'MAX' },
      severity: 'CRITICAL',
      status: 'UNACKNOWLEDGED',
      message: 'Severe Tachycardia: Heart rate reading of 142 BPM exceeds critical limit (max: 130 BPM).',
      createdAt: new Date(now - 25 * 60 * 1000).toISOString(),
    });
  } else if (scenario === 'warning') {
    alerts.push({
      id: 'mock-alert-warn-1',
      userId,
      deviceId: DEMO_DEVICE_ID,
      metric: 'heart_rate',
      value: 112,
      unit: 'BPM',
      threshold: { max: 100, type: 'MAX' },
      severity: 'WARNING',
      status: 'UNACKNOWLEDGED',
      message: 'Resting heart rate reading (112 BPM) is elevated above normal threshold (max: 100 BPM). Patient advised to rest.',
      createdAt: new Date(now - 18 * 60 * 1000).toISOString(),
    });
    alerts.push({
      id: 'mock-alert-warn-2',
      userId,
      deviceId: DEMO_DEVICE_ID,
      metric: 'temperature',
      value: 37.9,
      unit: '°C',
      threshold: { max: 37.5, type: 'MAX' },
      severity: 'WARNING',
      status: 'UNACKNOWLEDGED',
      message: 'Low-grade fever detected (37.9 °C). Monitoring body temperature trend.',
      createdAt: new Date(now - 45 * 60 * 1000).toISOString(),
    });
  }

  // Common Past Alerts for all modes so the user sees a rich alert history
  alerts.push(
    {
      id: 'mock-alert-past-1',
      userId,
      deviceId: DEMO_DEVICE_ID,
      metric: 'heart_rate',
      value: 104,
      unit: 'BPM',
      threshold: { max: 100, type: 'MAX' },
      severity: 'WARNING',
      status: 'ACKNOWLEDGED',
      message: 'Slightly elevated heart rate during morning medication routine.',
      createdAt: new Date(now - 6 * 3600 * 1000).toISOString(),
      acknowledgedAt: new Date(now - 5.5 * 3600 * 1000).toISOString(),
      acknowledgedBy: 'Sarah Jenkins',
    },
    {
      id: 'mock-alert-past-2',
      userId,
      deviceId: DEMO_DEVICE_ID,
      metric: 'temperature',
      value: 36.8,
      unit: '°C',
      threshold: { min: 36.0, max: 37.2, type: 'RANGE' },
      severity: 'INFO',
      status: 'RESOLVED',
      message: 'MediBox sensor calibration verified successfully. MAX30102 and DS18B20 online.',
      createdAt: new Date(now - 24 * 3600 * 1000).toISOString(),
      acknowledgedAt: new Date(now - 23.5 * 3600 * 1000).toISOString(),
      acknowledgedBy: 'System Auto-check',
    }
  );

  return alerts;
}

// ─── Live Sensor Fluctuations (Simulates Real Hardware Stream) ───────────────

export function getNextSimulatedReading(
  metric: SensorMetric,
  currentValue: number,
  scenario: DemoScenario = 'normal'
): number {
  const base = getScenarioValues(scenario)[metric as keyof ScenarioValues] ?? currentValue;
  let jitter = 0;

  switch (metric) {
    case 'heart_rate':
      // ±1 to 3 bpm fluctuation around base
      jitter = (Math.random() * 4 - 2);
      return Math.round(Math.max(45, Math.min(180, base + jitter)));
    case 'spo2':
      // ±0.2% fluctuation around base
      jitter = (Math.random() * 0.4 - 0.2);
      return parseFloat(Math.min(100, Math.max(80, base + jitter)).toFixed(1));
    case 'temperature':
      // ±0.1°C fluctuation
      jitter = (Math.random() * 0.2 - 0.1);
      return parseFloat((base + jitter).toFixed(1));
    case 'blood_pressure_systolic':
      jitter = (Math.random() * 3 - 1.5);
      return Math.round(base + jitter);
    case 'blood_pressure_diastolic':
      jitter = (Math.random() * 2 - 1);
      return Math.round(base + jitter);
    default:
      return currentValue;
  }
}
