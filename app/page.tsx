import type { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';
import {
  Heart,
  Activity,
  Thermometer,
  Droplets,
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
  Sparkles,
  Box,
  Key,
} from 'lucide-react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { ParallaxHero } from '@/components/landing/ParallaxHero';
import { InteractivePipeline } from '@/components/landing/InteractivePipeline';

export const metadata: Metadata = {
  title: 'MediBox — Intelligent Health Monitoring & Smart Pillbox Platform',
  description:
    'Connected IoT health monitoring and automated medication dispensing platform. Real-time MAX30102 and DS18B20 sensor streams, intelligent clinical alerts, and 15-slot smart pillbox adherence.',
};

// ─── Key Capabilities Data ───────────────────────────────────────────────────

const capabilities = [
  {
    icon: Activity,
    title: 'Continuous Biometric Streams',
    desc: 'Real-time arterial photoplethysmography (SpO₂ & Heart Rate) via MAX30102 with live wave monitoring and 100Hz edge telemetry.',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20 hover:border-rose-500/40',
    tag: 'MAX30102',
  },
  {
    icon: Thermometer,
    title: 'Clinical Thermometry',
    desc: 'Stainless steel DS18B20 digital temperature probe calibrated to ±0.1°C precision for early low-grade fever detection.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20 hover:border-amber-500/40',
    tag: 'DS18B20',
  },
  {
    icon: Box,
    title: '15-Compartment Smart Pillbox',
    desc: 'HX711 precision load cell strain gauges detect exact pill weights and lid openings, recording timestamps and verifying adherence.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20 hover:border-blue-500/40',
    tag: 'HX711 Matrix',
  },
  {
    icon: Bell,
    title: 'Intelligent Alert Dispatch',
    desc: 'Multi-severity clinical alerts (INFO, WARNING, CRITICAL) trigger instantly when readings cross safe physiological thresholds.',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20 hover:border-cyan-500/40',
    tag: 'Sub-second',
  },
  {
    icon: BarChart3,
    title: '24-Hour & 7-Day Trend Curves',
    desc: 'Interactive time-series analytics reveal circadian fluctuations, resting vitals, and medication response patterns.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20 hover:border-indigo-500/40',
    tag: 'Interactive',
  },
  {
    icon: FileText,
    title: 'Clinical Summary Reports',
    desc: 'Generate printable physician-ready health reports with automated statistics (Min, Max, Avg, Alert counts) on demand.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20 hover:border-purple-500/40',
    tag: 'PDF Ready',
  },
  {
    icon: Shield,
    title: 'Enterprise 4-Tier RBAC',
    desc: 'Granular role-based security protecting patient privacy across Patients, Family Caretakers, Admins, and Super Admins.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
    tag: 'Firestore Rules',
  },
  {
    icon: Sparkles,
    title: 'Full Hardware Simulator',
    desc: 'Built-in realistic simulation engine allowing seamless demonstration across all pages before physical hardware is linked.',
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20 hover:border-teal-500/40',
    tag: 'Live Demo',
  },
];

const roles = [
  {
    role: 'PATIENT (USER)',
    badge: 'badge-info',
    desc: 'View personal live vitals, 24h history, daily pill schedules, and acknowledge caregiver alerts.',
    features: ['Personal Dashboard', 'Pillbox Intake Confirmations', 'Report Generation'],
  },
  {
    role: 'CARETAKER',
    badge: 'badge-normal',
    desc: 'Monitor assigned family members or patients remotely with immediate alert dispatch notifications.',
    features: ['Multi-Patient Oversight', 'Missed Dose Notifications', 'Threshold Visibility'],
  },
  {
    role: 'ADMIN',
    badge: 'badge-warning',
    desc: 'Manage physical IoT devices, assign hardware tokens, configure alert thresholds, and audit user logs.',
    features: ['Hardware Provisioning', 'Threshold Calibration', 'Sensor Health Diagnostics'],
  },
  {
    role: 'SUPER ADMIN',
    badge: 'badge-critical',
    desc: 'Comprehensive system administration, database security audit logging, and global role privileges.',
    features: ['System-wide Configuration', 'Security Governance', 'Master Telemetry Auditing'],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] selection:bg-blue-500 selection:text-white">
      {/* ── Sticky Navigation Bar ── */}
      <nav className="sticky top-0 z-50 border-b border-[var(--border)] glass-panel backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 sm:h-24 items-center justify-between">
            {/* Official Brand Logo */}
            <BrandLogo size="lg" variant="inline" showTagline={true} href="/" />

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-8">
              {['Features', 'Architecture', 'Security', 'About'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm font-semibold text-[var(--muted-fg)] hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="btn btn-ghost btn-sm font-semibold text-[var(--heading)] hover:text-blue-600"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn btn-primary btn-sm font-semibold shadow-md shadow-blue-500/20"
              >
                Get Started
                <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Parallax Hero Section ── */}
      <ParallaxHero />

      {/* ── Interactive Architecture Pipeline ── */}
      <InteractivePipeline />

      {/* ── Key Capabilities Section ── */}
      <section id="features" className="px-4 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Full Health-Tech Ecosystem</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[var(--heading)] tracking-tight">
              Clinical Power Meets IoT Intelligence
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[var(--muted-fg)] leading-relaxed">
              Every component of MediBox is designed for reliability, immediate clinical visibility,
              and patient medication compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((c) => (
              <div
                key={c.title}
                className={`card card-hover p-6 rounded-2xl border ${c.border} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${c.bg}`}>
                      <c.icon className={`h-6 w-6 ${c.color}`} />
                    </div>
                    <span className="badge badge-info text-[10px] font-mono font-bold">
                      {c.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--heading)] mb-2.5">
                    {c.title}
                  </h3>
                  <p className="text-sm text-[var(--muted-fg)] leading-relaxed">
                    {c.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security & 4-Tier RBAC ── */}
      <section id="security" className="px-4 py-24 sm:py-32 border-t border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Role Cards */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Role-Based Governance</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--heading)] tracking-tight">
                  Granular 4-Tier Security Matrix
                </h2>
                <p className="mt-3 text-base text-[var(--muted-fg)] leading-relaxed">
                  Enforced at the database and API layer via Firestore Security Rules and server-side token validation.
                </p>
              </div>

              <div className="space-y-4">
                {roles.map((r) => (
                  <div
                    key={r.role}
                    className="card p-5 rounded-2xl border hover:border-blue-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-sm text-[var(--heading)]">{r.role}</h4>
                      <span className={`badge ${r.badge} text-[10px]`}>Active Role</span>
                    </div>
                    <p className="text-xs text-[var(--muted-fg)] mb-3 leading-relaxed">{r.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {r.features.map((f) => (
                        <span key={f} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--fg)]">
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Security Safeguards Panel */}
            <div className="lg:col-span-6 card p-8 sm:p-10 rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-500/5 via-blue-500/5 to-transparent shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--heading)]">Data Safety Architecture</h3>
                  <p className="text-xs text-[var(--muted-fg)]">Zero Trust Hardware-to-Cloud Channel</p>
                </div>
              </div>

              <ul className="space-y-4">
                {[
                  {
                    title: 'Firebase Authentication',
                    desc: 'Cryptographically hashed authentication tokens; passwords never stored or logged in plain text.',
                  },
                  {
                    title: 'Database-Level Firestore Rules',
                    desc: 'Patients only query their assigned records. Cross-account data leaks blocked at engine level.',
                  },
                  {
                    title: 'IoT Device Secret Tokens',
                    desc: 'ESP32 ingestion requires preshared hardware tokens verified on every telemetry dispatch.',
                  },
                  {
                    title: 'Zod Input Validation',
                    desc: 'Strict runtime schema validation on every sensor ingest payload prevents buffer or injection attempts.',
                  },
                  {
                    title: 'Audit Logging & Monitoring',
                    desc: 'Critical threshold changes and device reassignments generate immutable event audit trails.',
                  },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-[var(--heading)]">{item.title}</p>
                      <p className="text-xs text-[var(--muted-fg)] mt-0.5">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ready to Explore CTA ── */}
      <section className="px-4 py-24 sm:py-32 relative overflow-hidden text-center">
        <div className="mx-auto max-w-4xl relative z-10">
          <div className="inline-flex items-center justify-center mb-6">
            <BrandLogo size="lg" variant="icon" />
          </div>

          <h2 className="text-4xl sm:text-6xl font-extrabold text-[var(--heading)] tracking-tight mb-6">
            Experience the Future of{' '}
            <span className="gradient-text">Connected Healthcare</span>
          </h2>
          <p className="text-base sm:text-xl text-[var(--muted-fg)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Test the live simulator or link your ESP32 hardware to launch an all-in-one
            health tracking and pillbox adherence center.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="btn btn-primary btn-lg shadow-xl shadow-blue-500/25 text-base font-bold"
            >
              Create Account
              <ArrowRight className="h-4.5 w-4.5 ml-1" />
            </Link>
            <Link
              href="/login?demo=true"
              className="btn btn-outline btn-lg glass-panel text-base font-bold"
            >
              Explore Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ── Medical Disclaimer ── */}
      <section id="about" className="border-t border-[var(--border)] px-4 py-12 bg-[var(--muted)]">
        <div className="mx-auto max-w-4xl">
          <div className="card p-6 sm:p-8 rounded-2xl border border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center gap-2.5 mb-3 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-bold text-sm sm:text-base">Academic Medical Disclaimer</h3>
            </div>
            <p className="text-xs sm:text-sm text-[var(--muted-fg)] leading-relaxed">
              MediBox is an <strong>educational IoT health monitoring platform</strong> developed as an academic capstone project.
              It is <strong>not a medical device certified for clinical diagnosis or treatment</strong>. All readings (heart rate, SpO₂, body temperature)
              are for monitoring and research demonstration only. Always seek the advice of a physician or other qualified health provider with any questions
              regarding a medical condition.
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--border)] px-4 py-12 bg-[var(--card)]">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-[var(--muted-fg)]">
          <BrandLogo size="sm" variant="inline" showTagline={true} />

          <div className="flex items-center gap-6 font-medium text-xs sm:text-sm">
            <Link href="/login" className="hover:text-blue-600 transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-blue-600 transition-colors">Register</Link>
            <Link href="/login?demo=true" className="hover:text-blue-600 transition-colors">Simulator Mode</Link>
          </div>

          <p className="text-xs text-[var(--muted-fg)]">
            © {new Date().getFullYear()} MediBox Platform · Built with ESP32, Next.js & Firebase
          </p>
        </div>
      </footer>
    </div>
  );
}
