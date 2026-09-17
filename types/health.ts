import type { SensorMetric } from './device';
export type { SensorMetric };

export type ReadingQuality = 'VALID' | 'SUSPECT' | 'INVALID';
export type ReadingSource = 'DEVICE' | 'DEMO' | 'MANUAL';

export interface HealthReading {
  id: string;
  deviceId: string;
  userId: string;
  metric: SensorMetric;
  value: number;
  unit: string;
  quality: ReadingQuality;
  source: ReadingSource;
  timestamp: string; // ISO
  createdAt: string;
}

export interface LatestReadings {
  heart_rate?: HealthReading;
  spo2?: HealthReading;
  temperature?: HealthReading;
  blood_pressure_systolic?: HealthReading;
  blood_pressure_diastolic?: HealthReading;
}

export type HealthStatus = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';

export interface MetricConfig {
  metric: SensorMetric;
  label: string;
  unit: string;
  icon: string;
  normalMin: number;
  normalMax: number;
  warnMin?: number;
  warnMax?: number;
  criticalMin?: number;
  criticalMax?: number;
  decimalPlaces: number;
}

export const METRIC_CONFIGS: Record<SensorMetric, MetricConfig> = {
  heart_rate: {
    metric: 'heart_rate',
    label: 'Heart Rate',
    unit: 'BPM',
    icon: 'Heart',
    normalMin: 60,
    normalMax: 100,
    warnMin: 50,
    warnMax: 120,
    criticalMin: 40,
    criticalMax: 150,
    decimalPlaces: 0,
  },
  spo2: {
    metric: 'spo2',
    label: 'SpO₂',
    unit: '%',
    icon: 'Droplets',
    normalMin: 95,
    normalMax: 100,
    warnMin: 90,
    warnMax: 100,
    criticalMin: 85,
    criticalMax: 100,
    decimalPlaces: 1,
  },
  temperature: {
    metric: 'temperature',
    label: 'Body Temperature',
    unit: '°C',
    icon: 'Thermometer',
    normalMin: 36.1,
    normalMax: 37.2,
    warnMin: 35.5,
    warnMax: 38.0,
    criticalMin: 35.0,
    criticalMax: 40.0,
    decimalPlaces: 1,
  },
  blood_pressure_systolic: {
    metric: 'blood_pressure_systolic',
    label: 'Systolic BP',
    unit: 'mmHg',
    icon: 'Activity',
    normalMin: 90,
    normalMax: 120,
    warnMin: 80,
    warnMax: 140,
    criticalMin: 70,
    criticalMax: 180,
    decimalPlaces: 0,
  },
  blood_pressure_diastolic: {
    metric: 'blood_pressure_diastolic',
    label: 'Diastolic BP',
    unit: 'mmHg',
    icon: 'Activity',
    normalMin: 60,
    normalMax: 80,
    warnMin: 50,
    warnMax: 90,
    criticalMin: 40,
    criticalMax: 110,
    decimalPlaces: 0,
  },
};

export type TimeRange = '24h' | '7d' | '30d' | 'custom';

export interface ReadingFilter {
  userId?: string;
  deviceId?: string;
  metric?: SensorMetric;
  startDate?: string;
  endDate?: string;
  quality?: ReadingQuality;
  limit?: number;
  offset?: number;
}

export interface IngestPayload {
  deviceId: string;
  token: string;
  readings: Array<{
    metric: SensorMetric;
    value: number;
    unit: string;
    timestamp?: string;
  }>;
}
