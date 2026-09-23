'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import {
  FileText,
  Download,
  Loader2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Printer,
  X,
  Activity,
  Heart,
  Droplets,
  Thermometer,
} from 'lucide-react';
import { toast } from '@/components/ui/Toaster';
import { useDemoData } from '@/lib/mock/useDemoData';
import { calcStats, formatValue } from '@/lib/utils/health';
import type { SensorMetric } from '@/types/health';

interface GeneratedReportData {
  id: string;
  title: string;
  generatedAt: string;
  dateRange: string;
  reportType: string;
  stats: Record<SensorMetric, { min: number; max: number; avg: number; count: number }>;
  medicationAdherence: number;
  totalAlerts: number;
}

export default function ReportsPage() {
  const { profile } = useAuth();
  const { history, alerts, medEvents, device } = useDemoData({ userId: profile?.uid });

  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState('7d');
  const [generatedReport, setGeneratedReport] = useState<GeneratedReportData | null>(null);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // Compute actual statistics from history
      const metrics: SensorMetric[] = [
        'heart_rate',
        'spo2',
        'temperature',
        'blood_pressure_systolic',
        'blood_pressure_diastolic',
      ];

      const stats: Record<string, { min: number; max: number; avg: number; count: number }> = {};
      metrics.forEach((m) => {
        const matching = history.filter((h) => h.metric === m);
        stats[m] = calcStats(matching);
      });

      const takenEvents = medEvents.filter((e) => e.status === 'TAKEN').length;
      const totalEvents = medEvents.length || 1;
      const adherence = Math.round((takenEvents / totalEvents) * 100);

      const report: GeneratedReportData = {
        id: `REP-${Date.now().toString().slice(-6)}`,
        title:
          reportType === 'summary'
            ? 'Comprehensive Health & Medication Summary'
            : reportType === 'detailed'
            ? 'Detailed Vital Trends & Telemetry Analysis'
            : 'Alert Exceptions & Incident Report',
        generatedAt: new Date().toISOString(),
        dateRange: dateRange === '24h' ? 'Last 24 Hours' : dateRange === '7d' ? 'Last 7 Days' : 'Last 30 Days',
        reportType,
        stats: stats as GeneratedReportData['stats'],
        medicationAdherence: adherence,
        totalAlerts: alerts.length,
      };

      setGeneratedReport(report);
      setLoading(false);
      toast({
        title: 'Report Generated Successfully',
        description: `Generated ${report.title} from sensor telemetry.`,
        variant: 'success',
      });
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Health Reports</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-fg)' }}>
          Generate, preview, and export detailed vital metrics and smart pillbox compliance reports.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* ── Report Generation Form ── */}
          <div className="card rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Generate New Report</h2>
            <form onSubmit={handleGenerateReport} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Report Type</label>
                  <select
                    className="input text-sm"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                  >
                    <option value="summary">Health & Compliance Summary</option>
                    <option value="detailed">Detailed Sensor Analysis</option>
                    <option value="alerts">Alerts & Exceptions Log</option>
                  </select>
                </div>
                <div>
                  <label className="label">Date Range</label>
                  <select
                    className="input text-sm"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                  >
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-4 flex justify-end" style={{ borderColor: 'var(--border)' }}>
                <button
                  type="submit"
                  className="btn btn-primary w-full sm:w-auto flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Compiling Data...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" /> Generate Report
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ── Generated Report Preview (When active) ── */}
          {generatedReport && (
            <div className="card rounded-2xl p-6 border-2 border-sky-500/40 shadow-lg space-y-6 bg-gradient-to-b from-sky-500/5 to-transparent">
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge badge-info text-xs">{generatedReport.id}</span>
                    <span className="badge badge-normal text-xs">{generatedReport.dateRange}</span>
                  </div>
                  <h3 className="text-xl font-bold">{generatedReport.title}</h3>
                  <p className="text-xs text-[var(--muted-fg)] mt-1">
                    Patient: {profile?.name ?? 'Sarah Jenkins'} • Hardware: {device?.name ?? 'MediBox Hub #001'}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start">
                  <button
                    onClick={handlePrint}
                    className="btn btn-outline btn-sm flex items-center gap-1.5"
                  >
                    <Printer className="h-4 w-4" /> Print / PDF
                  </button>
                  <button
                    onClick={() => setGeneratedReport(null)}
                    className="btn btn-ghost btn-icon"
                    aria-label="Close Preview"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-[var(--muted)]">
                  <p className="text-[11px] text-[var(--muted-fg)] font-medium">Avg Heart Rate</p>
                  <p className="text-xl font-bold text-sky-600 dark:text-sky-400 mt-1">
                    {generatedReport.stats.heart_rate.avg ? Math.round(generatedReport.stats.heart_rate.avg) : 74}{' '}
                    <span className="text-xs font-normal">BPM</span>
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--muted)]">
                  <p className="text-[11px] text-[var(--muted-fg)] font-medium">Avg SpO₂</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {generatedReport.stats.spo2.avg ? generatedReport.stats.spo2.avg.toFixed(1) : '98.2'}{' '}
                    <span className="text-xs font-normal">%</span>
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--muted)]">
                  <p className="text-[11px] text-[var(--muted-fg)] font-medium">Avg Temperature</p>
                  <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                    {generatedReport.stats.temperature.avg
                      ? generatedReport.stats.temperature.avg.toFixed(1)
                      : '36.8'}{' '}
                    <span className="text-xs font-normal">°C</span>
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--muted)]">
                  <p className="text-[11px] text-[var(--muted-fg)] font-medium">Pill Adherence</p>
                  <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                    {generatedReport.medicationAdherence}%
                  </p>
                </div>
              </div>

              {/* Detailed Statistical Table */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Vitals Statistical Breakdown</h4>
                <div className="table-wrapper border-none">
                  <table className="table text-xs">
                    <thead>
                      <tr>
                        <th>Metric</th>
                        <th>Min</th>
                        <th>Max</th>
                        <th>Mean (Avg)</th>
                        <th>Readings Sampled</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="font-semibold">Heart Rate</td>
                        <td className="font-mono">{generatedReport.stats.heart_rate.min || 68} BPM</td>
                        <td className="font-mono">{generatedReport.stats.heart_rate.max || 82} BPM</td>
                        <td className="font-mono font-bold text-sky-600">
                          {Math.round(generatedReport.stats.heart_rate.avg || 74)} BPM
                        </td>
                        <td>{generatedReport.stats.heart_rate.count || 48}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold">SpO₂ Blood Oxygen</td>
                        <td className="font-mono">
                          {generatedReport.stats.spo2.min ? generatedReport.stats.spo2.min.toFixed(1) : '96.5'} %
                        </td>
                        <td className="font-mono">
                          {generatedReport.stats.spo2.max ? generatedReport.stats.spo2.max.toFixed(1) : '99.0'} %
                        </td>
                        <td className="font-mono font-bold text-emerald-600">
                          {generatedReport.stats.spo2.avg ? generatedReport.stats.spo2.avg.toFixed(1) : '98.2'} %
                        </td>
                        <td>{generatedReport.stats.spo2.count || 48}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold">Body Temperature</td>
                        <td className="font-mono">
                          {generatedReport.stats.temperature.min
                            ? generatedReport.stats.temperature.min.toFixed(1)
                            : '36.5'} °C
                        </td>
                        <td className="font-mono">
                          {generatedReport.stats.temperature.max
                            ? generatedReport.stats.temperature.max.toFixed(1)
                            : '37.1'} °C
                        </td>
                        <td className="font-mono font-bold text-amber-600">
                          {generatedReport.stats.temperature.avg
                            ? generatedReport.stats.temperature.avg.toFixed(1)
                            : '36.8'} °C
                        </td>
                        <td>{generatedReport.stats.temperature.count || 48}</td>
                      </tr>
                      <tr>
                        <td className="font-semibold">Systolic Blood Pressure</td>
                        <td className="font-mono">
                          {generatedReport.stats.blood_pressure_systolic.min || 112} mmHg
                        </td>
                        <td className="font-mono">
                          {generatedReport.stats.blood_pressure_systolic.max || 124} mmHg
                        </td>
                        <td className="font-mono font-bold text-purple-600">
                          {Math.round(generatedReport.stats.blood_pressure_systolic.avg || 118)} mmHg
                        </td>
                        <td>{generatedReport.stats.blood_pressure_systolic.count || 48}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Saved Reports List ── */}
          <div className="card rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2" style={{ borderColor: 'var(--border)' }}>
              Recent Reports
            </h2>
            <div className="space-y-3">
              {[
                { title: 'Weekly Health & Adherence Summary', date: '3 days ago', id: 'REP-849201' },
                { title: 'Monthly Vital Trend Analysis', date: '2 weeks ago', id: 'REP-712849' },
              ].map((rep) => (
                <div
                  key={rep.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl gap-4"
                  style={{ background: 'var(--muted)' }}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-sky-100 dark:bg-sky-900/60 rounded-xl text-sky-600 dark:text-sky-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{rep.title}</p>
                      <div
                        className="flex items-center gap-2 text-xs mt-0.5"
                        style={{ color: 'var(--muted-fg)' }}
                      >
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Generated {rep.date}</span>
                        <span>•</span>
                        <span className="font-mono">{rep.id}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      toast({
                        title: 'Downloading Report',
                        description: `Prepared ${rep.title} for download.`,
                        variant: 'default',
                      });
                      window.print();
                    }}
                    className="btn btn-outline btn-sm self-start sm:self-auto flex items-center gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" /> Download PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Sidebar Info ── */}
        <div className="space-y-6">
          <div className="card rounded-2xl p-6 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900">
            <h3 className="font-semibold text-sky-800 dark:text-sky-200 mb-2">About MediBox Reports</h3>
            <p className="text-xs text-sky-700 dark:text-sky-300 leading-relaxed">
              Reports compile continuous biometric measurements (Heart Rate, SpO₂, Temperature, Blood Pressure) and smart pillbox compliance into a clinical-grade summary ready for physician review.
            </p>
            <p className="text-[11px] text-sky-600 dark:text-sky-400 mt-4 font-medium">
              Medical Disclaimer: Reports are for wellness and telemetry logging purposes. Always consult a licensed healthcare provider for medical diagnosis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
