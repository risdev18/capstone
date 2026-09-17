export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'IDLE';

export type SensorStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

export type SensorMetric =
  | 'heart_rate'
  | 'spo2'
  | 'temperature'
  | 'blood_pressure_systolic'
  | 'blood_pressure_diastolic';

export interface Device {
  id: string;
  deviceCode: string; // e.g. SHB-0001
  name: string;
  ownerId: string | null;
  ownerName?: string;
  status: DeviceStatus;
  firmwareVersion: string;
  batteryLevel: number; // 0-100
  wifiSignal?: number; // dBm
  lastSeen: string; // ISO timestamp
  uptime?: number; // seconds
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Sensor {
  id: string;
  deviceId: string;
  name: string;
  type: string; // e.g. MAX30102, DS18B20
  metric: SensorMetric;
  unit: string;
  status: SensorStatus;
  isActive: boolean;
  calibrationData?: Record<string, unknown>;
  lastReading?: number;
  lastReadingAt?: string;
  createdAt: string;
}

export interface DeviceLog {
  id: string;
  deviceId: string;
  event:
    | 'ONLINE'
    | 'OFFLINE'
    | 'BATTERY_LOW'
    | 'SENSOR_ERROR'
    | 'FIRMWARE_UPDATE'
    | 'HEARTBEAT';
  details?: string;
  timestamp: string;
}

export interface HeartbeatPayload {
  deviceId: string;
  token: string;
  battery?: number;
  firmware?: string;
  wifiSignal?: number;
  timestamp: string;
}

export const DEVICE_STATUS_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export const SENSOR_METRIC_LABELS: Record<SensorMetric, string> = {
  heart_rate: 'Heart Rate',
  spo2: 'SpO₂',
  temperature: 'Body Temperature',
  blood_pressure_systolic: 'Blood Pressure (Systolic)',
  blood_pressure_diastolic: 'Blood Pressure (Diastolic)',
};

export const SENSOR_UNITS: Record<SensorMetric, string> = {
  heart_rate: 'BPM',
  spo2: '%',
  temperature: '°C',
  blood_pressure_systolic: 'mmHg',
  blood_pressure_diastolic: 'mmHg',
};
