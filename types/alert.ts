import type { SensorMetric } from './device';

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertStatus = 'UNACKNOWLEDGED' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface Alert {
  id: string;
  userId: string;
  deviceId: string;
  metric: SensorMetric;
  value: number;
  unit: string;
  threshold: {
    min?: number;
    max?: number;
    type: 'MIN' | 'MAX' | 'RANGE';
  };
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

export interface Threshold {
  id: string;
  metric: SensorMetric;
  minValue?: number;
  maxValue?: number;
  warnMinValue?: number;
  warnMaxValue?: number;
  isEnabled: boolean;
  createdBy: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actor: string; // userId
  actorName: string;
  action: AuditAction;
  target: string; // targetId (userId, deviceId, etc.)
  targetType: 'USER' | 'DEVICE' | 'SENSOR' | 'THRESHOLD' | 'ALERT' | 'REPORT' | 'SYSTEM';
  details?: Record<string, unknown>;
  timestamp: string;
}

export type AuditAction =
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DISABLED'
  | 'USER_ROLE_CHANGED'
  | 'DEVICE_CREATED'
  | 'DEVICE_ASSIGNED'
  | 'DEVICE_UNASSIGNED'
  | 'DEVICE_DEACTIVATED'
  | 'THRESHOLD_CREATED'
  | 'THRESHOLD_UPDATED'
  | 'THRESHOLD_DISABLED'
  | 'ALERT_ACKNOWLEDGED'
  | 'ALERT_RESOLVED'
  | 'REPORT_GENERATED'
  | 'SENSOR_UPDATED';

export interface Notification {
  id: string;
  userId: string;
  type: 'DEVICE_OFFLINE' | 'NEW_WARNING' | 'CRITICAL_READING' | 'REPORT_READY' | 'SYSTEM';
  title: string;
  message: string;
  isRead: boolean;
  alertId?: string;
  deviceId?: string;
  createdAt: string;
}

export const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  INFO: 'Info',
  WARNING: 'Warning',
  CRITICAL: 'Critical',
};

export const SEVERITY_COLORS: Record<AlertSeverity, string> = {
  INFO: 'blue',
  WARNING: 'amber',
  CRITICAL: 'red',
};
