import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Heart,
  Activity,
  Thermometer,
  Droplets,
  Wifi,
  Shield,
  BarChart3,
  Bell,
  Cpu,
  Smartphone,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Database,
  Lock,
  Zap,
  Users,
  FileText,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'MediBox — Connected Health Monitoring Platform',
  description:
    'An educational IoT health monitoring platform with real-time sensor data, intelligent alerts, and care tracking. Built with ESP32, Next.js, and Firebase.',
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Activity,
    title: 'Real-Time Monitoring',
    desc: 'Live readings from connected sensors streamed directly to your dashboard.',
    color: 'text-sky-500',
    bg: 'bg-sky-50 dark:bg-sky-950',
  },
  {
    icon: BarChart3,
    title: 'Trend Analytics',
    desc: 'Interactive charts showing health trends across 24 hours, 7 days, or 30 days.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-950',
  },
  {
    icon: Bell,
    title: 'Intelligent Alerts',
    desc: 'Configurable threshold monitoring with INFO, WARNING, and CRITICAL severity levels.',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950',
  },
  {
    icon: Cpu,
    title: 'Device Management',
    desc: 'Monitor MediBox status, battery, Wi-Fi signal, and sensor health.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950',
  },
  {
    icon: FileText,
    title: 'Health Reports',
    desc: 'Generate detailed monitoring reports with statistics and trend charts.',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950',
  },
  {
    icon: Shield,
    title: 'Role-Based Security',
    desc: 'Four-tier RBAC with Firebase Auth, Firestore rules, and server-side validation.',
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-950',
  },
  {
    icon: Users,
    title: 'Multi-User Support',
    desc: 'Patients, Caretakers, Admins, and Super Admins with proper authorization.',
    color: 'text-teal-500',
    bg: 'bg-teal-50 dark:bg-teal-950',
  },
  {
    icon: Smartphone,
    title: 'Responsive Design',
    desc: 'Fully responsive dashboard that works on desktop, tablet, and mobile.',
    color: 'text-pink-500',
    bg: 'bg-pink-50 dark:bg-pink-950',
  },
];

const metrics = [
  { icon: Heart, label: 'Heart Rate', unit: 'BPM', color: 'text-red-500', sample: '72' },
  { icon: Droplets, label: 'SpO₂', unit: '%', color: 'text-sky-500', sample: '98' },
  { icon: Thermometer, label: 'Temperature', unit: '°C', color: 'text-amber-500', sample: '36.7' },
  { icon: Activity, label: 'Blood Pressure', unit: 'mmHg', color: 'text-purple-500', sample: '120/80' },
];

const architectureSteps = [
  { icon: Cpu, label: 'Sensors', sub: 'MAX30102 · DS18B20', color: '#0ea5e9' },
  { icon: Wifi, label: 'ESP32', sub: 'Wi-Fi · REST API', color: '#6366f1' },
  { icon: Lock, label: 'Secure API', sub: 'Validated · Authenticated', color: '#8b5cf6' },
  { icon: Database, label: 'Firebase', sub: 'Firestore · Auth', color: '#10b981' },
  { icon: Zap, label: 'Processing', sub: 'Alert Engine · Analytics', color: '#f59e0b' },
  { icon: BarChart3, label: 'Dashboard', sub: 'Real-time · Charts', color: '#ef4444' },
];

const roles = [
  { role: 'USER', desc: 'View own health readings, acknowledge alerts, generate reports', color: 'badge-info' },
  { role: 'CARETAKER', desc: 'Monitor assigned patients, view their readings and alerts', color: 'badge-normal' },
  { role: 'ADMIN', desc: 'Manage users, devices, sensors, and alert thresholds', color: 'badge-warning' },
  { role: 'SUPER_ADMIN', desc: 'Full system access including role assignment and system settings', color: 'badge-critical' },
];

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 border-b" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl hero-gradient shadow-lg shadow-sky-500/20">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="block text-sm font-bold leading-none">MediBox</span>
                <span className="block text-[10px] leading-none" style={{ color: 'var(--muted-fg)' }}>
                  v1.0 · Capstone
                </span>
              </div>
            </div>

            {/* Nav links */}
            <div className="hidden items-center gap-6 md:flex">
              {['Features', 'Architecture', 'Security', 'About'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm font-medium transition-colors hover:text-sky-500"
                  style={{ color: 'var(--muted-fg)' }}
                >
                  {item}
                </a>
              ))}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-3">
              <Link href="/login" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Get Started
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-4 py-24 sm:py-32">
        {/* Background blobs */}
        <div
          className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }}
        />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Text */}
            <div className="animate-fade-in">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium"
                style={{ borderColor: 'rgba(14,165,233,0.3)', color: '#0ea5e9', background: 'rgba(14,165,233,0.08)' }}>
                <span className="live-dot" />
                Academic Capstone Project · IoT + Healthcare
              </div>

              <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl">
                <span className="gradient-text">MediBox</span>
                <br />
                <span>Box</span>
              </h1>

              <p className="mb-8 text-xl leading-relaxed" style={{ color: 'var(--muted-fg)' }}>
                Connected health monitoring, intelligent tracking, and real-time care insights — 
                powered by ESP32 sensors and cloud analytics.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/register" className="btn btn-primary btn-lg">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/login" className="btn btn-outline btn-lg">
                  View Demo Dashboard
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" style={{ color: 'var(--muted-fg)' }}>
                {['Firebase Auth', 'Real-time Firestore', 'ESP32 Ready', 'Role-Based Access'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard mockup */}
            <div className="animate-float">
              <div className="card rounded-2xl p-6 shadow-2xl shadow-sky-500/10">
                {/* Mock header */}
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs" style={{ color: 'var(--muted-fg)' }}>Good morning</p>
                    <p className="text-base font-semibold">Health Overview</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                    style={{ background: '#d1fae5', color: '#065f46' }}>
                    <span className="live-dot" style={{ width: 6, height: 6 }} />
                    Online
                  </div>
                </div>

                {/* Metric cards */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {metrics.map((m) => (
                    <div
                      key={m.label}
                      className="card-hover card rounded-xl p-4"
                      style={{ background: 'var(--muted)' }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <m.icon className={`h-4 w-4 ${m.color}`} />
                        <span className="text-xs font-medium" style={{ color: 'var(--muted-fg)' }}>
                          {m.label}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">{m.sample}</span>
                        <span className="text-xs" style={{ color: 'var(--muted-fg)' }}>{m.unit}</span>
                      </div>
                      <span className="badge badge-normal mt-2" style={{ fontSize: '10px' }}>Normal</span>
                    </div>
                  ))}
                </div>

                {/* Demo banner */}
                <div className="demo-banner rounded-lg">
                  <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                  Demo Mode — readings are simulated
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Metrics section ── */}
      <section className="border-y px-4 py-16" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-3">What is MediBox?</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--muted-fg)' }}>
              A connected IoT device that collects health readings from supported sensors 
              and streams them to a secure, real-time web dashboard.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {metrics.map((m) => (
              <div key={m.label} className="card card-hover rounded-2xl p-6 text-center">
                <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl`}
                  style={{ background: 'var(--muted)' }}>
                  <m.icon className={`h-6 w-6 ${m.color}`} />
                </div>
                <p className="font-semibold text-base">{m.label}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--muted-fg)' }}>Measured in {m.unit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="architecture" className="px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-lg" style={{ color: 'var(--muted-fg)' }}>
              From physical sensors to your web dashboard — a complete data pipeline.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {architectureSteps.map((step, i) => (
              <React.Fragment key={step.label}>
                <div className="card card-hover rounded-2xl p-6 text-center w-36">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ background: `${step.color}20` }}>
                    <step.icon className="h-6 w-6" style={{ color: step.color }} />
                  </div>
                  <p className="font-semibold text-sm">{step.label}</p>
                  <p className="text-xs mt-1 leading-tight" style={{ color: 'var(--muted-fg)' }}>{step.sub}</p>
                </div>
                {i < architectureSteps.length - 1 && (
                  <ChevronRight className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--muted-fg)' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="px-4 py-20" style={{ background: 'var(--card)' }}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold mb-3">Key Capabilities</h2>
            <p className="text-lg" style={{ color: 'var(--muted-fg)' }}>
              Everything needed for a complete health monitoring platform.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="card card-hover rounded-2xl p-6">
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${f.bg}`}>
                  <f.icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-fg)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security & Roles ── */}
      <section id="security" className="px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Role-Based Access Control</h2>
              <p className="text-lg mb-8" style={{ color: 'var(--muted-fg)' }}>
                Four-tier authorization enforced server-side via Firebase Auth and 
                Firestore Security Rules — never dependent on UI alone.
              </p>
              <div className="space-y-3">
                {roles.map((r) => (
                  <div key={r.role} className="card rounded-xl p-4 flex items-start gap-4">
                    <span className={`badge ${r.color} flex-shrink-0 mt-0.5`}>{r.role}</span>
                    <p className="text-sm" style={{ color: 'var(--muted-fg)' }}>{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="card rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950">
                  <Shield className="h-5 w-5 text-sky-500" />
                </div>
                <h3 className="font-semibold text-lg">Security Architecture</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Firebase Authentication — no passwords stored manually',
                  'Firestore Security Rules — enforced at database level',
                  'Server-side validation with Zod schemas',
                  'Device token authentication for IoT ingestion',
                  'Audit logs for all admin actions',
                  'Environment variables — secrets never in frontend',
                  'Input sanitization and rate limiting',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--muted-fg)' }}>
                    <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Demo Mode ── */}
      <section className="px-4 py-20" style={{ background: 'var(--card)' }}>
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
            style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b' }}>
            <AlertTriangle className="h-4 w-4" />
            Demo Mode Available
          </div>
          <h2 className="text-3xl font-bold mb-4">Works Without Physical Hardware</h2>
          <p className="text-lg mb-8" style={{ color: 'var(--muted-fg)' }}>
            MediBox includes a built-in simulator that generates clearly labeled 
            demo readings — perfect for presentations and demonstrations before hardware is connected.
          </p>
          <div className="grid gap-4 sm:grid-cols-3 text-left">
            {[
              { label: 'Normal Scenario', desc: 'All readings within healthy range', color: 'badge-normal' },
              { label: 'Warning Scenario', desc: 'Elevated readings triggering WARNING alerts', color: 'badge-warning' },
              { label: 'Critical Scenario', desc: 'Out-of-range readings triggering CRITICAL alerts', color: 'badge-critical' },
            ].map((s) => (
              <div key={s.label} className="card rounded-xl p-5">
                <span className={`badge ${s.color} mb-3`}>{s.label}</span>
                <p className="text-sm" style={{ color: 'var(--muted-fg)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-extrabold mb-6">
            Ready to explore{' '}
            <span className="gradient-text">MediBox</span>?
          </h2>
          <p className="text-lg mb-10" style={{ color: 'var(--muted-fg)' }}>
            Create an account to access the full dashboard, or sign in to explore the demo.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="btn btn-primary btn-lg">
              Create Account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="btn btn-outline btn-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Medical Disclaimer ── */}
      <section id="about" className="border-t px-4 py-12" style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}>
        <div className="mx-auto max-w-4xl text-center">
          <div className="rounded-2xl border p-6" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-base">Medical Disclaimer</h3>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-fg)' }}>
              MediBox is an <strong>educational health-monitoring system</strong> developed as 
              an academic capstone project. It is <strong>not a substitute for professional medical advice, 
              diagnosis, or treatment</strong>. All readings are for monitoring and educational purposes only. 
              Always consult a qualified healthcare professional for medical concerns. 
              Never disregard professional medical advice based on information from this system.
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t px-4 py-8" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: 'var(--muted-fg)' }}>
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            <span>MediBox · Academic Capstone Project</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-sky-500 transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-sky-500 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Need React for Fragment
import React from 'react';
