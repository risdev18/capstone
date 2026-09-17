import type { SensorMetric } from '@/types/device';
import type { HealthReading, HealthStatus, MetricConfig } from '@/types/health';
import { METRIC_CONFIGS } from '@/types/health';

// ─── Status Calculation ───────────────────────────────────────────────────────

export function getHealthStatus(metric: SensorMetric, value: number): HealthStatus {
  const config = METRIC_CONFIGS[metric];
  if (!config) return 'UNKNOWN';

  if (config.criticalMin !== undefined && value < config.criticalMin) return 'CRITICAL';
  if (config.criticalMax !== undefined && value > config.criticalMax) return 'CRITICAL';
  if (config.warnMin !== undefined && value < config.warnMin) return 'WARNING';
  if (config.warnMax !== undefined && value > config.warnMax) return 'WARNING';
  if (value < config.normalMin || value > config.normalMax) return 'WARNING';
  return 'NORMAL';
}

export function getStatusColor(status: HealthStatus): string {
  switch (status) {
    case 'NORMAL': return 'text-emerald-600 dark:text-emerald-400';
    case 'WARNING': return 'text-amber-600 dark:text-amber-400';
    case 'CRITICAL': return 'text-red-600 dark:text-red-400';
    default: return 'text-muted-foreground';
  }
}

export function getStatusBg(status: HealthStatus): string {
  switch (status) {
    case 'NORMAL': return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800';
    case 'WARNING': return 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800';
    case 'CRITICAL': return 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
    default: return 'bg-muted border-border';
  }
}

export function getStatusDotColor(status: HealthStatus): string {
  switch (status) {
    case 'NORMAL': return 'bg-emerald-500';
    case 'WARNING': return 'bg-amber-500';
    case 'CRITICAL': return 'bg-red-500';
    default: return 'bg-slate-400';
  }
}

// ─── Formatting ───────────────────────────────────────────────────────────────

export function formatValue(metric: SensorMetric, value: number): string {
  const config = METRIC_CONFIGS[metric];
  return value.toFixed(config?.decimalPlaces ?? 0);
}

export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── Device Online Detection ──────────────────────────────────────────────────

export function isDeviceOnline(lastSeen: string, timeoutMs = 5 * 60 * 1000): boolean {
  const diff = Date.now() - new Date(lastSeen).getTime();
  return diff < timeoutMs;
}

// ─── Statistics ───────────────────────────────────────────────────────────────

export interface ReadingStats {
  min: number;
  max: number;
  avg: number;
  count: number;
}

export function calcStats(readings: HealthReading[]): ReadingStats {
  if (readings.length === 0) return { min: 0, max: 0, avg: 0, count: 0 };
  const values = readings.map((r) => r.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return { min, max, avg, count: readings.length };
}

// ─── Alert Message Generator ──────────────────────────────────────────────────

export function buildAlertMessage(
  metric: SensorMetric,
  value: number,
  unit: string,
  thresholdType: 'MIN' | 'MAX' | 'RANGE',
  threshold: number
): string {
  const config = METRIC_CONFIGS[metric];
  const label = config?.label ?? metric;
  const formattedValue = formatValue(metric, value);
  const direction = thresholdType === 'MIN' ? 'below' : 'above';

  return (
    `${label} reading (${formattedValue} ${unit}) is ${direction} the configured monitoring range ` +
    `(threshold: ${threshold} ${unit}). ` +
    `Please review this reading and consider contacting a healthcare professional if appropriate.`
  );
}

// ─── Time Range Helpers ───────────────────────────────────────────────────────

export function getTimeRangeStart(range: '24h' | '7d' | '30d'): Date {
  const now = new Date();
  switch (range) {
    case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hrs = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}
