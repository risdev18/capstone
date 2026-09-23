'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Cpu, Wifi, Database, LayoutDashboard, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';

const PIPELINE_STEPS = [
  {
    id: 'sensors',
    step: '01',
    title: 'Biometric & Ambient Sensing',
    sub: 'MAX30102 & DS18B20 Probes',
    desc: 'Medical-grade optical photoplethysmography captures arterial blood volume changes at 100Hz while waterproof digital probes measure body temperature with ±0.1°C precision.',
    image: '/images/sensors/max30102.svg',
    imageAlt: 'MAX30102 Optical Biometric Sensor',
    badge: '100Hz Sampling',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    specs: ['Red & Infrared LEDs', 'Digital 1-Wire DS18B20', 'Raw I2C Telemetry'],
  },
  {
    id: 'esp32',
    step: '02',
    title: 'ESP32 Edge Microcontroller',
    sub: 'Dual-Core 240MHz Hub',
    desc: 'The onboard ESP32 runs continuous DSP algorithms, filtering motion artifacts, calculating real-time SpO2 ratios, and managing the 15-compartment pillbox weight sensors.',
    image: '/images/sensors/esp32.svg',
    imageAlt: 'ESP32 Microcontroller Hub',
    badge: 'Dual-Core Edge DSP',
    color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-600 dark:text-cyan-400',
    specs: ['Wi-Fi 802.11 b/g/n', 'Device Token Auth', 'Automatic Reconnect'],
  },
  {
    id: 'pillbox',
    step: '03',
    title: '15-Compartment Dispenser',
    sub: 'HX711 Precision Load Cell Matrix',
    desc: 'Equipped with strain gauge weight sensors and optical lid detection, every scheduled medication dose is verified. Missed doses trigger automated alerts to family and caretakers.',
    image: '/images/sensors/smartbox.svg',
    imageAlt: '15-Compartment Smart Pillbox Array',
    badge: 'Gram-Precision Verification',
    color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-600 dark:text-blue-400',
    specs: ['15 Discrete Slots', 'Lid Open/Close Sensors', 'Adherence Tracking'],
  },
  {
    id: 'cloud',
    step: '04',
    title: 'Cloud Telemetry & AI Alerts',
    sub: 'Firestore & Realtime Dashboard',
    desc: 'Telemetry flows into encrypted cloud storage. If vital thresholds breach normal boundaries, the alert engine triggers instant visual warnings and caregiver notifications.',
    image: '/images/sensors/ds18b20.svg',
    imageAlt: 'Clinical Precision Probes',
    badge: 'Sub-Second Anomaly Engine',
    color: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-600 dark:text-indigo-400',
    specs: ['4-Tier RBAC Access', '24h/7d Trend Curves', 'Instant Clinical Alerts'],
  },
];

export function InteractivePipeline() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="architecture" className="relative px-4 py-24 sm:py-32 overflow-hidden border-t border-[var(--border)] bg-[var(--card)]">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full" />
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full" />

      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 text-xs font-semibold mb-4">
            <Cpu className="h-3.5 w-3.5" />
            <span>End-to-End IoT Data Flow</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[var(--heading)] tracking-tight">
            How MediBox Works
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[var(--muted-fg)] leading-relaxed">
            From physical bio-sensors on the human body to an encrypted cloud dashboard —
            here is how real medical telemetry travels through our stack.
          </p>
        </div>

        {/* Step Selector Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-12">
          {PIPELINE_STEPS.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setActiveStep(idx)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                activeStep === idx
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105'
                  : 'bg-[var(--muted)] text-[var(--muted-fg)] hover:text-[var(--heading)] hover:bg-[var(--border)]'
              }`}
            >
              <span className="font-mono opacity-80">{item.step}</span>
              <span>{item.title}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Highlight Card for Selected Step */}
        <div className="card rounded-3xl border border-[var(--border)] overflow-hidden shadow-xl bg-gradient-to-br from-[var(--card)] to-[var(--muted)]/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-12">
            {/* Visual Column */}
            <div className="lg:col-span-6 relative flex items-center justify-center min-h-[280px] sm:min-h-[360px] p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
              <div className="relative w-full h-64 sm:h-80">
                <Image
                  src={PIPELINE_STEPS[activeStep].image}
                  alt={PIPELINE_STEPS[activeStep].imageAlt}
                  fill
                  className="object-contain drop-shadow-xl"
                  priority
                />
              </div>
              <span className="absolute top-4 left-4 badge badge-info text-xs font-mono font-bold">
                {PIPELINE_STEPS[activeStep].badge}
              </span>
            </div>

            {/* Details Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 font-mono font-extrabold text-lg">
                  {PIPELINE_STEPS[activeStep].step}
                </span>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[var(--heading)]">
                    {PIPELINE_STEPS[activeStep].title}
                  </h3>
                  <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 mt-0.5">
                    {PIPELINE_STEPS[activeStep].sub}
                  </p>
                </div>
              </div>

              <p className="text-base text-[var(--muted-fg)] leading-relaxed">
                {PIPELINE_STEPS[activeStep].desc}
              </p>

              {/* Spec Checklist */}
              <div className="space-y-2.5 pt-2">
                {PIPELINE_STEPS[activeStep].specs.map((spec) => (
                  <div key={spec} className="flex items-center gap-2.5 text-sm font-medium text-[var(--heading)]">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>

              {/* Step Navigation CTA */}
              <div className="pt-4 flex items-center gap-4">
                <button
                  onClick={() => setActiveStep((prev) => (prev + 1) % PIPELINE_STEPS.length)}
                  className="btn btn-outline btn-sm font-semibold gap-1.5"
                >
                  Next Architecture Layer
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Step Summary Flow Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {PIPELINE_STEPS.map((s, idx) => (
            <div
              key={s.id}
              onClick={() => setActiveStep(idx)}
              className={`cursor-pointer card p-5 rounded-2xl border transition-all ${
                activeStep === idx
                  ? 'border-blue-500/50 bg-blue-500/5 shadow-md shadow-blue-500/10'
                  : 'hover:border-blue-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold text-[var(--muted-fg)]">{s.step}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.color}`}>
                  {s.badge}
                </span>
              </div>
              <h4 className="font-bold text-sm text-[var(--heading)]">{s.title}</h4>
              <p className="text-xs text-[var(--muted-fg)] mt-1.5 line-clamp-2">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
