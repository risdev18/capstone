'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Sparkles,
  Heart,
  Droplets,
  Thermometer,
  Shield,
  Activity,
  CheckCircle2,
  Box,
  Wifi,
} from 'lucide-react';
import { BrandLogo } from '@/components/brand/BrandLogo';

export function ParallaxHero() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-36 ambient-mesh">
      {/* Background morphing gradient meshes */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-cyan-500/25 via-blue-600/20 to-emerald-500/20 blur-[110px] rounded-full animate-morph-slow" />
      <div className="pointer-events-none absolute top-1/3 -left-36 w-[450px] h-[450px] bg-gradient-to-tr from-blue-600/25 via-cyan-500/20 to-teal-400/20 blur-[90px] rounded-full animate-morph-alt" />
      <div className="pointer-events-none absolute top-1/4 -right-36 w-[480px] h-[480px] bg-gradient-to-bl from-cyan-500/20 via-blue-500/25 to-emerald-400/20 blur-[100px] rounded-full animate-morph" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Header Badge */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300 text-xs font-semibold backdrop-blur-md shadow-sm mb-6 animate-fade-in card-pop cursor-pointer">
            <span className="live-dot" />
            <span>Next-Gen IoT Health Ecosystem · ESP32 + Firebase</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
              v1.2 LIVE
            </span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[var(--heading)] leading-[1.1] mb-6">
            Intelligent Health Monitoring.{' '}
            <span className="block mt-2 gradient-text">
              Real-Time Care in Every Beat.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl text-lg sm:text-xl text-[var(--muted-fg)] leading-relaxed mb-10">
            MediBox bridges physical medical-grade sensors with instant cloud telemetry.
            Continuous pulse oximetry, body temperature, smart pillbox adherence, and intelligent
            emergency alerts in one cohesive platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link
              href="/register"
              className="btn btn-primary btn-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 text-base btn-pop"
            >
              Get Started Now
              <ArrowRight className="h-4.5 w-4.5 ml-1" />
            </Link>
            <Link
              href="/login?demo=true"
              className="btn btn-outline btn-lg glass-panel text-base font-semibold border-sky-500/30 hover:border-sky-500 text-[var(--heading)] shadow-sm btn-pop"
            >
              <Sparkles className="h-4 w-4 text-cyan-500 mr-1.5" />
              Explore Live Simulator
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm font-medium text-[var(--muted-fg)] mb-16">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>MAX30102 Optical Biometrics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-500" />
              <span>DS18B20 Digital Precision</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
              <span>15-Slot Load Cell Pillbox</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-indigo-500" />
              <span>Sub-second Cloud Alerts</span>
            </div>
          </div>
        </div>

        {/* ─── Parallax Visual Showcase ──────────────────────────────────── */}
        <div className="relative mx-auto max-w-5xl mt-4">
          {/* Main Visual Center Stage */}
          <div
            className="relative rounded-3xl border border-sky-500/20 bg-gradient-to-b from-sky-500/5 via-blue-500/5 to-transparent p-4 sm:p-8 backdrop-blur-xl shadow-2xl shadow-blue-500/10"
            style={{
              transform: `translateY(${Math.min(24, scrollY * 0.04)}px)`,
              transition: 'transform 0.1s ease-out',
            }}
          >
            {/* Inner Dashboard Preview Container */}
            <div className="relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--card)] shadow-inner">
              {/* Top Chrome Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--muted)]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  <span className="text-xs font-mono text-[var(--muted-fg)] ml-2">medibox.hub/live-telemetry</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="live-dot" />
                  <span className="hidden sm:inline">ESP32 STREAM CONNECTED</span>
                </div>
              </div>

              {/* Showcase Content: 3D Cube + Real-time Telemetry Grid */}
              <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* 3D Smart Box Branding Centerpiece */}
                <div className="lg:col-span-5 relative flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-gradient-to-br from-sky-500/10 via-blue-500/5 to-transparent border border-sky-500/25 overflow-hidden card-pop">
                  {/* Organic Morphing Ambient Aura */}
                  <div className="absolute inset-2 bg-gradient-to-tr from-cyan-500/35 via-emerald-500/25 to-blue-600/35 animate-morph filter blur-2xl pointer-events-none opacity-80" />

                  <div className="relative z-10 w-44 h-44 sm:w-52 sm:h-52 animate-float">
                    <Image
                      src="/brand/medibox-icon.png"
                      alt="MediBox 3D Smart Hub"
                      fill
                      sizes="(max-width: 768px) 176px, 208px"
                      className="object-contain drop-shadow-[0_20px_45px_rgba(6,182,212,0.55)]"
                      priority
                    />
                  </div>
                  <h3 className="relative z-10 text-xl font-bold mt-4 text-[var(--heading)]">MediBox Hub #001</h3>
                  <p className="relative z-10 text-xs text-[var(--muted-fg)] mt-1">Dual-Core ESP32 · 15 Compartments</p>
                  <div className="relative z-10 flex items-center gap-3 mt-3">
                    <span className="badge badge-normal text-[11px]">87% Battery</span>
                    <span className="badge badge-info text-[11px]">-62 dBm Wi-Fi</span>
                  </div>
                </div>

                {/* Live Vital Stream Cards */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Heart Rate Card */}
                  <div className="card p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 card-pop">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[var(--muted-fg)] flex items-center gap-1.5">
                        <Heart className="h-4 w-4 text-rose-500 animate-pulse" /> Heart Rate
                      </span>
                      <span className="badge badge-normal text-[10px]">Normal</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-[var(--heading)] font-mono">74</span>
                      <span className="text-xs font-semibold text-[var(--muted-fg)]">BPM</span>
                    </div>
                    {/* SVG ECG Waveform */}
                    <div className="mt-3 h-8 w-full">
                      <svg viewBox="0 0 160 30" className="w-full h-full stroke-rose-500 fill-none" strokeWidth="2">
                        <path d="M 0 15 L 40 15 L 50 5 L 60 25 L 70 10 L 80 18 L 90 15 L 160 15" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>

                  {/* SpO2 Card */}
                  <div className="card p-4 rounded-xl border border-sky-500/20 bg-sky-500/5 hover:border-sky-500/40 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[var(--muted-fg)] flex items-center gap-1.5">
                        <Droplets className="h-4 w-4 text-sky-500" /> Blood Oxygen
                      </span>
                      <span className="badge badge-normal text-[10px]">Optimal</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-[var(--heading)] font-mono">98.4</span>
                      <span className="text-xs font-semibold text-[var(--muted-fg)]">%</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="mt-4 w-full bg-[var(--muted)] h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-sky-400 to-cyan-500 h-full rounded-full" style={{ width: '98.4%' }} />
                    </div>
                  </div>

                  {/* Body Temperature Card */}
                  <div className="card p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[var(--muted-fg)] flex items-center gap-1.5">
                        <Thermometer className="h-4 w-4 text-amber-500" /> Temperature
                      </span>
                      <span className="badge badge-normal text-[10px]">Normal</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-[var(--heading)] font-mono">36.8</span>
                      <span className="text-xs font-semibold text-[var(--muted-fg)]">°C</span>
                    </div>
                    <p className="text-[10px] text-[var(--muted-fg)] mt-3">DS18B20 Digital Precision ±0.1°C</p>
                  </div>

                  {/* Smart Pillbox Status */}
                  <div className="card p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:border-indigo-500/40 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[var(--muted-fg)] flex items-center gap-1.5">
                        <Box className="h-4 w-4 text-indigo-500" /> Pillbox Schedule
                      </span>
                      <span className="badge badge-info text-[10px]">On Track</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-[var(--heading)]">Next: 01:00 PM</span>
                    </div>
                    <p className="text-[10px] text-[var(--muted-fg)] mt-3">Compartment 3 · Vitamin D3 (1000 IU)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Parallax Badges around the hero */}
          <div
            className="hidden md:flex items-center gap-3 absolute -top-8 -left-8 card card-pop p-3.5 rounded-2xl glass-panel shadow-xl border-cyan-500/30 cursor-pointer"
            style={{
              transform: `translateY(${scrollY * -0.06}px)`,
              transition: 'transform 0.15s ease-out',
            }}
          >
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--heading)]">Continuous Telemetry</p>
              <p className="text-[10px] text-[var(--muted-fg)]">100Hz Sensor Sampling Rate</p>
            </div>
          </div>

          <div
            className="hidden md:flex items-center gap-3 absolute -bottom-6 -right-6 card card-pop p-3.5 rounded-2xl glass-panel shadow-xl border-emerald-500/30 cursor-pointer"
            style={{
              transform: `translateY(${scrollY * -0.08}px)`,
              transition: 'transform 0.15s ease-out',
            }}
          >
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--heading)]">Automated Safety</p>
              <p className="text-[10px] text-[var(--muted-fg)]">Instant Patient Threshold Defense</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
