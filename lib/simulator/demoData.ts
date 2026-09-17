/**
 * SmartHealth Box — Demo Mode Simulator
 *
 * Generates clearly-labeled DEMO data so the platform can be demonstrated
 * before physical hardware is connected.
 *
 * All readings produced here carry source: "DEMO" and are visually labeled
 * throughout the UI. They must never be presented as real sensor data.
 */

import type { HealthReading } from '@/types/health';
import type { Device, Sensor } from '@/types/device';
import type { Alert } from '@/types/alert';

// ─── Demo Device ──────────────────────────────────────────────────────────────

export const DEMO_DEVICE: Device = {
  id: 'demo-device-001',
  deviceCode: 'SHB-0001',
  name: 'SmartHealth Box #001 (Demo)',
  ownerId: 'demo-user',
  status: 'ONLINE',
  firmwareVersion: '1.2.0',
  batteryLevel: 87,
  wifiSignal: -62,
  lastSeen: new Date().toISOString(),
  uptime: 3 * 24 * 60 * 60, // 3 days in seconds
  isActive: true,
  createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
};

export const DEMO_SENSORS: Sensor[] = [
  {
    id: 'demo-sensor-001',
    deviceId: 'demo-device-001',
    name: 'Heart Rate & SpO₂ Sensor',
    type: 'MAX30102',
    metric: 'heart_rate',
    unit: 'BPM',
    status: 'CONNECTED',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-sensor-002',
    deviceId: 'demo-device-001',
    name: 'SpO₂ Channel',
    type: 'MAX30102',
    metric: 'spo2',
    unit: '%',
    status: 'CONNECTED',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-sensor-003',
    deviceId: 'demo-device-001',
    name: 'Temperature Sensor',
    type: 'DS18B20',
    metric: 'temperature',
    unit: '°C',
    status: 'CONNECTED',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

// ─── Scenario Types ───────────────────────────────────────────────────────────

export type DemoScenario = 'normal' | 'warning' | 'critical' | 'offline';

// ─── Value Generators ─────────────────────────────────────────────────────────

function randomBetween(min: number, max: number, decimals = 0): number {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
}

function addNoise(base: number, noise: number, decimals = 0): number {
  return parseFloat((base + (Math.random() * 2 - 1) * noise).toFixed(decimals));
}

interface ScenarioValues {
  heart_rate: number;
  spo2: number;
  temperature: number;
  blood_pressure_systolic: number;
  blood_pressure_diastolic: number;
}

function getScenarioValues(scenario: DemoScenario): ScenarioValues {
  switch (scenario) {
    case 'normal':
      return {
        heart_rate: randomBetween(65, 90),
        spo2: randomBetween(96, 100, 1),
        temperature: randomBetween(36.1, 37.0, 1),
        blood_pressure_systolic: randomBetween(110, 125),
        blood_pressure_diastolic: randomBetween(65, 80),
      };
    case 'warning':
      return {
        heart_rate: randomBetween(105, 120),
        spo2: randomBetween(91, 94, 1),
        temperature: randomBetween(37.5, 38.4, 1),
        blood_pressure_systolic: randomBetween(135, 150),
        blood_pressure_diastolic: randomBetween(85, 95),
      };
    case 'critical':
      return {
        heart_rate: randomBetween(130, 160),
        spo2: randomBetween(85, 89, 1),
        temperature: randomBetween(38.8, 40.0, 1),
        blood_pressure_systolic: randomBetween(160, 185),
        blood_pressure_diastolic: randomBetween(100, 115),
      };
    case 'offline':
      // Return last-known values (no fresh readings)
      return {
        heart_rate: 72,
        spo2: 97,
        temperature: 36.6,
        blood_pressure_systolic: 118,
        blood_pressure_diastolic: 76,
      };
  }
}

// ─── Single Reading Generator ─────────────────────────────────────────────────

export function generateDemoReading(
  metric: keyof ScenarioValues,
  scenario: DemoScenario,
  userId: string,
  timestamp?: Date
): HealthReading {
  const values = getScenarioValues(scenario);
  const unitMap: Record<keyof ScenarioValues, string> = {
    heart_rate: 'BPM',
    spo2: '%',
    temperature: '°C',
    blood_pressure_systolic: 'mmHg',
    blood_pressure_diastolic: 'mmHg',
  };

  const ts = (timestamp ?? new Date()).toISOString();
  return {
    id: `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    deviceId: DEMO_DEVICE.id,
    userId,
    metric: metric as HealthReading['metric'],
    value: values[metric],
    unit: unitMap[metric],
    quality: 'VALID',
    source: 'DEMO',
    timestamp: ts,
    createdAt: ts,
  };
}

// ─── Historical Data Generator ────────────────────────────────────────────────

/**
 * Generates historical readings for the past N hours, spaced ~30 minutes apart.
 * Produces realistic trend-like data with natural variation.
 */
export function generateDemoHistory(
  userId: string,
  hours = 24,
  scenario: DemoScenario = 'normal'
): HealthReading[] {
  const readings: HealthReading[] = [];
  const now = Date.now();
  const intervalMs = 30 * 60 * 1000; // 30 minutes
  const count = Math.floor((hours * 60 * 60 * 1000) / intervalMs);

  const metrics: Array<keyof ScenarioValues> = [
    'heart_rate', 'spo2', 'temperature', 'blood_pressure_systolic', 'blood_pressure_diastolic',
  ];

  for (let i = count; i >= 0; i--) {
    const ts = new Date(now - i * intervalMs);

    for (const metric of metrics) {
      const base = getScenarioValues(scenario)[metric];
      let noiseAmount = 0;

      switch (metric) {
        case 'heart_rate': noiseAmount = 8; break;
        case 'spo2': noiseAmount = 1.5; break;
        case 'temperature': noiseAmount = 0.3; break;
        case 'blood_pressure_systolic': noiseAmount = 8; break;
        case 'blood_pressure_diastolic': noiseAmount = 5; break;
      }

      const decimals = metric === 'spo2' || metric === 'temperature' ? 1 : 0;
      const value = addNoise(base, noiseAmount, decimals);
      const readingTs = ts.toISOString();

      readings.push({
        id: `demo-hist-${metric}-${i}`,
        deviceId: DEMO_DEVICE.id,
        userId,
        metric: metric as HealthReading['metric'],
        value,
        unit: { heart_rate: 'BPM', spo2: '%', temperature: '°C', blood_pressure_systolic: 'mmHg', blood_pressure_diastolic: 'mmHg' }[metric],
        quality: 'VALID',
        source: 'DEMO',
        timestamp: readingTs,
        createdAt: readingTs,
      });
    }
  }

  return readings;
}

// ─── Demo Alerts ──────────────────────────────────────────────────────────────

export function generateDemoAlerts(userId: string, scenario: DemoScenario): Alert[] {
  if (scenario === 'normal') return [];

  const alerts: Alert[] = [];
  const now = new Date().toISOString();

  if (scenario === 'warning' || scenario === 'critical') {
    alerts.push({
      id: 'demo-alert-001',
      userId,
      deviceId: DEMO_DEVICE.id,
      metric: 'heart_rate',
      value: scenario === 'critical' ? 142 : 112,
      unit: 'BPM',
      threshold: { max: 100, type: 'MAX' },
      severity: scenario === 'critical' ? 'CRITICAL' : 'WARNING',
      status: 'UNACKNOWLEDGED',
      message: `Heart rate reading (${scenario === 'critical' ? 142 : 112} BPM) is outside the configured monitoring range. Please review this reading and consider contacting a healthcare professional if appropriate.`,
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    });
  }

  if (scenario === 'critical') {
    alerts.push({
      id: 'demo-alert-002',
      userId,
      deviceId: DEMO_DEVICE.id,
      metric: 'spo2',
      value: 87,
      unit: '%',
      threshold: { min: 95, type: 'MIN' },
      severity: 'CRITICAL',
      status: 'UNACKNOWLEDGED',
      message: 'SpO₂ reading (87%) requires attention. Please review this reading and consider contacting a healthcare professional if appropriate.',
      createdAt: now,
    });
  }

  return alerts;
}

// ─── Live Tick ────────────────────────────────────────────────────────────────

/**
 * Returns fresh readings for the "Live" monitoring section.
 * Call this on an interval to simulate real-time updates.
 */
export function tickLiveReadings(
  userId: string,
  scenario: DemoScenario
): HealthReading[] {
  if (scenario === 'offline') return [];

  const metrics: Array<keyof ScenarioValues> = [
    'heart_rate', 'spo2', 'temperature',
  ];

  return metrics.map((m) => generateDemoReading(m, scenario, userId));
}
