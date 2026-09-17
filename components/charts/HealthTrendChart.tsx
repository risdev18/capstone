'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';
import { type HealthReading, METRIC_CONFIGS, type MetricConfig } from '@/types/health';

interface ChartProps {
  data: HealthReading[];
  metric: keyof typeof METRIC_CONFIGS;
  color?: string;
  height?: number;
}

export function HealthTrendChart({ data, metric, color = '#0ea5e9', height = 300 }: ChartProps) {
  const config = METRIC_CONFIGS[metric] as MetricConfig | undefined;

  const chartData = useMemo(() => {
    return [...data]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((d) => ({
        time: new Date(d.timestamp),
        value: d.value,
        timestamp: d.timestamp,
      }));
  }, [data]);

  if (!chartData.length) {
    return (
      <div
        className="flex items-center justify-center text-sm font-medium"
        style={{ height, color: 'var(--muted-fg)' }}
      >
        No data available for this period.
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
          <XAxis
            dataKey="time"
            tickFormatter={(time) => format(new Date(time), 'HH:mm')}
            stroke="var(--muted-fg)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />
          <YAxis
            stroke="var(--muted-fg)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
            domain={['auto', 'auto']}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="card shadow-lg p-3 rounded-lg border text-sm z-50 bg-card">
                    <p className="font-semibold mb-1">{format(new Date(label), 'dd MMM, HH:mm')}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                      <span style={{ color: 'var(--muted-fg)' }}>{config?.label}:</span>
                      <span className="font-bold">
                        {payload[0].value} {config?.unit}
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          
          {/* Configurable Threshold Lines */}
          {config?.criticalMax && (
            <ReferenceLine
              y={config.criticalMax}
              stroke="#ef4444"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
          )}
          {config?.criticalMin && (
            <ReferenceLine
              y={config.criticalMin}
              stroke="#ef4444"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
          )}

          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: color, strokeWidth: 0 }}
            animationDuration={500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
