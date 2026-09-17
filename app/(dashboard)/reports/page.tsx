'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { FileText, Download, Loader2, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/Toaster';

export default function ReportsPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState('7d');

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API delay for report generation
    setTimeout(() => {
       setLoading(false);
       toast({
          title: 'Report Generated',
          description: 'Your health report has been generated successfully.',
          variant: 'success'
       });
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Health Reports</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-fg)' }}>
          Generate, view, and export detailed health monitoring reports.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
         <div className="md:col-span-2 space-y-6">
            <div className="card rounded-2xl p-6">
               <h2 className="text-lg font-semibold mb-6">Generate New Report</h2>
               <form onSubmit={handleGenerateReport} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                     <div>
                        <label className="label">Report Type</label>
                        <select 
                           className="input" 
                           value={reportType}
                           onChange={(e) => setReportType(e.target.value)}
                        >
                           <option value="summary">Health Summary</option>
                           <option value="detailed">Detailed Analysis</option>
                           <option value="alerts">Alerts & Exceptions</option>
                        </select>
                     </div>
                     <div>
                        <label className="label">Date Range</label>
                        <select 
                           className="input"
                           value={dateRange}
                           onChange={(e) => setDateRange(e.target.value)}
                        >
                           <option value="24h">Last 24 Hours</option>
                           <option value="7d">Last 7 Days</option>
                           <option value="30d">Last 30 Days</option>
                           <option value="custom">Custom Range</option>
                        </select>
                     </div>
                  </div>
                  
                  {dateRange === 'custom' && (
                     <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                           <label className="label">Start Date</label>
                           <input type="date" className="input" />
                        </div>
                        <div>
                           <label className="label">End Date</label>
                           <input type="date" className="input" />
                        </div>
                     </div>
                  )}

                  <div className="border-t pt-6 flex justify-end" style={{ borderColor: 'var(--border)' }}>
                     <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={loading}>
                        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><FileText className="h-4 w-4" /> Generate Report</>}
                     </button>
                  </div>
               </form>
            </div>

            <div className="card rounded-2xl p-6">
               <h2 className="text-lg font-semibold mb-4 border-b pb-2" style={{ borderColor: 'var(--border)' }}>Recent Reports</h2>
               <div className="space-y-3">
                  {[1, 2].map((i) => (
                     <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl gap-4" style={{ background: 'var(--muted)' }}>
                        <div className="flex items-start gap-3">
                           <div className="p-2 bg-sky-100 dark:bg-sky-900 rounded-lg text-sky-600 dark:text-sky-400">
                              <FileText className="h-5 w-5" />
                           </div>
                           <div>
                              <p className="font-medium text-sm">Weekly Health Summary</p>
                              <div className="flex items-center gap-2 text-xs mt-1" style={{ color: 'var(--muted-fg)' }}>
                                 <Calendar className="h-3.5 w-3.5" />
                                 Generated: Oct {25 - i}, 2026
                              </div>
                           </div>
                        </div>
                        <button className="btn btn-outline btn-sm">
                           <Download className="h-3.5 w-3.5" /> Download PDF
                        </button>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="space-y-6">
            <div className="card rounded-2xl p-6 bg-sky-50 dark:bg-sky-950 border-sky-200 dark:border-sky-900">
               <h3 className="font-semibold text-sky-800 dark:text-sky-200 mb-2">About Reports</h3>
               <p className="text-sm text-sky-700 dark:text-sky-300 leading-relaxed">
                  Reports provide a comprehensive overview of your monitored health metrics over a specified period. They include statistical analysis (min, max, average), trend charts, and a log of any alerts triggered during the timeframe.
               </p>
               <p className="text-xs text-sky-600 dark:text-sky-400 mt-4 font-medium">
                  Note: Reports are not medical diagnoses.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
