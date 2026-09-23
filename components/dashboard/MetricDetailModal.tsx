'use client';

import React, { useEffect } from 'react';
import { 
  X, 
  Activity, 
  Heart, 
  Thermometer, 
  Droplet, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Info,
  Radio,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { METRIC_CONFIGS, type SensorMetric, type HealthReading, type HealthStatus } from '@/types/health';
import { getHealthStatus, formatValue } from '@/lib/utils/health';

interface MetricDetailModalProps {
  metric: SensorMetric | null;
  reading?: HealthReading;
  isOpen: boolean;
  onClose: () => void;
}

const HARDWARE_SPECS: Record<SensorMetric, {
  sensorName: string;
  interfaceBus: string;
  gpioPins: string;
  description: string;
  samplingRate: string;
  normalRange: string;
}> = {
  heart_rate: {
    sensorName: 'MAX30102 Pulse Oximeter & Heart Rate Module',
    interfaceBus: 'I2C (Address 0x57)',
    gpioPins: 'SDA: GPIO 21, SCL: GPIO 22, INT: GPIO 19',
    description: 'Measures arterial blood volume changes using dual optical photoplethysmography (Red 660nm & Infrared 880nm LEDs).',
    samplingRate: '100 Hz PPG Sample Buffer',
    normalRange: '60 – 100 BPM (Resting)',
  },
  spo2: {
    sensorName: 'MAX30102 Optical Oxygen Transducer',
    interfaceBus: 'I2C (Address 0x57)',
    gpioPins: 'SDA: GPIO 21, SCL: GPIO 22',
    description: 'Calculates oxygenated vs deoxygenated hemoglobin ratio via ratio-of-ratios optical absorption algorithm.',
    samplingRate: '100 Hz continuous pulse window',
    normalRange: '95% – 100% Saturation',
  },
  temperature: {
    sensorName: 'DS18B20 Digital Thermometer Probe',
    interfaceBus: 'Dallas 1-Wire Protocol',
    gpioPins: 'Data: GPIO 4 (with 4.7kΩ pull-up resistor)',
    description: 'Provides calibrated 12-bit Celsius readings with direct digital conversion on the probe head.',
    samplingRate: '750ms conversion interval',
    normalRange: '36.1°C – 37.2°C (97.0°F – 99.0°F)',
  },
  blood_pressure_systolic: {
    sensorName: 'Oscillometric Pressure Transducer',
    interfaceBus: 'Analog / Digital Ingestion',
    gpioPins: 'ADC Pin 34 + Solenoid Valve Pin 25',
    description: 'Detects peak arterial oscillations during cuff deflation cycle using calibrated pressure transducer.',
    samplingRate: 'Automated measurement interval',
    normalRange: '90 – 120 mmHg',
  },
  blood_pressure_diastolic: {
    sensorName: 'Oscillometric Pressure Transducer',
    interfaceBus: 'Analog / Digital Ingestion',
    gpioPins: 'ADC Pin 34 + Solenoid Valve Pin 25',
    description: 'Identifies minimum arterial pressure between ventricular heart contractions.',
    samplingRate: 'Automated measurement interval',
    normalRange: '60 – 80 mmHg',
  },
};

const METRIC_ICONS = {
  heart_rate: Heart,
  spo2: Droplet,
  temperature: Thermometer,
  blood_pressure_systolic: Activity,
  blood_pressure_diastolic: Activity,
};

export default function MetricDetailModal({
  metric,
  reading,
  isOpen,
  onClose,
}: MetricDetailModalProps) {
  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !metric) return null;

  const config = METRIC_CONFIGS[metric];
  const specs = HARDWARE_SPECS[metric];
  const Icon = METRIC_ICONS[metric];
  const status: HealthStatus = reading ? getHealthStatus(metric, reading.value) : 'UNKNOWN';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Pop-up Surface */}
      <div className="relative w-full max-w-lg glass-modal rounded-3xl p-6 sm:p-8 text-white z-10 animate-popup border border-white/15 overflow-hidden">
        {/* Morphing ambient aura in background */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-emerald-500/20 rounded-full blur-3xl animate-morph pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gradient-to-tr from-blue-600/20 via-cyan-500/15 to-purple-600/20 rounded-full blur-3xl animate-morph-alt pointer-events-none" />

        {/* Header bar */}
        <div className="relative flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 rounded-2xl bg-white/10 border border-white/15 text-cyan-400">
              <Icon className="h-6 w-6 animate-pulse" />
              <div className="absolute inset-0 rounded-2xl bg-cyan-400/20 animate-ping opacity-25 pointer-events-none" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">{config.label}</h2>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
                Live ESP32 Hardware Telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors btn-pop"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Value Display */}
        <div className="relative my-6 p-5 rounded-2xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Current Reading
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-extrabold tracking-tight text-white font-mono">
                {reading ? formatValue(metric, reading.value) : '--'}
              </span>
              <span className="text-base font-semibold text-slate-400">{config.unit}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block mb-1">Status</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              status === 'NORMAL' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : status === 'WARNING'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : status === 'CRITICAL'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-slate-700/50 text-slate-300'
            }`}>
              {status === 'NORMAL' && <CheckCircle2 className="h-3.5 w-3.5" />}
              {status === 'WARNING' && <AlertTriangle className="h-3.5 w-3.5" />}
              {status === 'CRITICAL' && <AlertOctagon className="h-3.5 w-3.5" />}
              {status}
            </span>
          </div>
        </div>

        {/* Sensor & Hardware Specifications */}
        <div className="space-y-3.5 text-xs text-slate-300 mb-6">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5">
            <Cpu className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-white">Hardware Sensor: </span>
              <span>{specs.sensorName}</span>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">{specs.gpioPins}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block font-medium mb-1">Target Range</span>
              <span className="font-semibold text-white font-mono">{specs.normalRange}</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block font-medium mb-1">Bus Protocol</span>
              <span className="font-semibold text-cyan-300 font-mono">{specs.interfaceBus}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {specs.description}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Link
            href="/health"
            onClick={onClose}
            className="flex-1 btn btn-primary py-2.5 text-xs font-semibold flex items-center justify-center gap-2 btn-pop"
          >
            <span>Live Sensor Stream</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={onClose}
            className="btn btn-secondary py-2.5 px-5 text-xs font-medium text-slate-300 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
