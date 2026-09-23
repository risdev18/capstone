'use client';

import React from 'react';
import { Sparkles, Radio, ShieldAlert, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import type { DemoScenario } from '@/lib/mock/mockData';

interface DemoModeBannerProps {
  isDemoMode: boolean;
  hasRealHardwareData: boolean;
  scenario: DemoScenario;
  onSelectScenario: (scenario: DemoScenario) => void;
  onToggleDemoMode?: () => void;
}

export function DemoModeBanner({
  isDemoMode,
  hasRealHardwareData,
  scenario,
  onSelectScenario,
  onToggleDemoMode,
}: DemoModeBannerProps) {
  if (!isDemoMode && hasRealHardwareData) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs">
        <div className="flex items-center gap-2 font-medium">
          <span className="live-dot" />
          <span>Real ESP32 Hardware Active — Live data streaming from physical device</span>
        </div>
        {onToggleDemoMode && (
          <button
            onClick={onToggleDemoMode}
            className="text-[11px] font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            Switch to Simulator Mode
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-emerald-500/10 p-4 backdrop-blur-md shadow-sm transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Mode Title & Info */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-600 dark:text-cyan-400 shadow-inner">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wide uppercase text-blue-700 dark:text-cyan-300">
                Demo Simulation Mode
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-800 dark:text-cyan-200">
                <Radio className="h-2.5 w-2.5 animate-pulse text-cyan-500" /> Auto-detects ESP32
              </span>
            </div>
            <p className="text-xs text-[var(--muted-fg)] mt-0.5">
              Simulating sensor readings, pillbox activities, and alerts. Real hardware will override automatically when connected.
            </p>
          </div>
        </div>

        {/* Right: Scenario Switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <span className="text-xs font-medium text-[var(--muted-fg)] mr-1">Scenario:</span>
          
          <button
            onClick={() => onSelectScenario('normal')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              scenario === 'normal'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'bg-[var(--card)] hover:bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)]'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Normal
          </button>

          <button
            onClick={() => onSelectScenario('warning')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              scenario === 'warning'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                : 'bg-[var(--card)] hover:bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)]'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" /> Warning
          </button>

          <button
            onClick={() => onSelectScenario('critical')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              scenario === 'critical'
                ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                : 'bg-[var(--card)] hover:bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)]'
            }`}
          >
            <AlertCircle className="h-3.5 w-3.5" /> Critical
          </button>

          {onToggleDemoMode && (
            <button
              onClick={onToggleDemoMode}
              title="Force toggle real vs simulated mode"
              className="btn btn-ghost btn-sm text-xs ml-1"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DemoModeBanner;
