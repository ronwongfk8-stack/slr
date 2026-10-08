import React, { useState } from 'react';
import { 
  BarChart3, 
  FileText, 
  TrendingUp, 
  Eye, 
  Users, 
  DollarSign, 
  Sparkles, 
  Download, 
  CheckCircle,
  Printer,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { ClientReport } from '../types';

interface ReportingSectionProps {
  reports: ClientReport[];
}

export const ReportingSection: React.FC<ReportingSectionProps> = ({ reports }) => {
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || '');
  const [isExportReportOpen, setIsExportReportOpen] = useState(false);

  const activeReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  const handlePrint = () => {
    window.print();
  };

  if (!activeReport) return null;

  return (
    <section id="reporting" className="py-24 bg-slate-900/40 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-400 mb-2">
              <BarChart3 className="w-4 h-4" />
              <span>Automated Client Intelligence & KPI Portal</span>
            </div>
            <h2
              className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white"
              style={{ textWrap: 'balance' }}
            >
              Automated Performance Dashboards
            </h2>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Transparent, real-time ROI attribution. Sapotlokal clients access automated performance reports monitoring video views, creator UGC ROAS, and qualified inbound leads generated.
            </p>
          </div>

          {/* Client Account Switcher & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
              <span className="text-xs text-slate-400">Client View:</span>
              <select
                value={selectedReportId}
                onChange={(e) => setSelectedReportId(e.target.value)}
                className="bg-transparent text-xs font-bold text-amber-300 focus:outline-none cursor-pointer"
              >
                {reports.map((rep) => (
                  <option key={rep.id} value={rep.id} className="bg-slate-950 text-white">
                    {rep.clientName}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsExportReportOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl transition-colors shadow-lg shadow-amber-500/10"
            >
              <FileText className="w-4 h-4" />
              <span>Generate Executive Report</span>
            </button>
          </div>
        </div>

        {/* Client Header Card */}
        <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-mono mb-1">
              <span>{activeReport.industry}</span>
              <span>·</span>
              <span>Reporting Cadence: {activeReport.period}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
              {activeReport.clientName}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{activeReport.brandTagline}</p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Client Stream</span>
            </div>
          </div>
        </div>

        {/* Core KPI Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-slate-500 text-[11px] mb-2">
              <span>TOTAL REACH</span>
              <Eye className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-white tabular-nums">
              {activeReport.kpis.totalImpressions}
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">
              {activeReport.kpis.impressionsGrowth} vs prev
            </span>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-slate-500 text-[11px] mb-2">
              <span>VIDEO VIEWS</span>
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-amber-300 tabular-nums">
              {activeReport.kpis.videoViews}
            </div>
            <span className="text-[10px] text-slate-400">Reels & TikTok</span>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-slate-500 text-[11px] mb-2">
              <span>ENGAGEMENT</span>
              <Sparkles className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-white tabular-nums">
              {activeReport.kpis.engagementRate}
            </div>
            <span className="text-[10px] text-slate-400">Shares & Comments</span>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-slate-500 text-[11px] mb-2">
              <span>INBOUND LEADS</span>
              <Users className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {activeReport.kpis.inboundLeads}
            </div>
            <span className="text-[10px] text-slate-400">Form & WhatsApp</span>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-slate-500 text-[11px] mb-2">
              <span>PAID ROAS</span>
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-white tabular-nums">
              {activeReport.kpis.roas}
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">Meta & TikTok Ad ROI</span>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-slate-500 text-[11px] mb-2">
              <span>PIPELINE VALUE</span>
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-amber-400 tabular-nums">
              {activeReport.kpis.revenuePipeline}
            </div>
            <span className="text-[10px] text-slate-400">Attributed Deals</span>
          </div>
        </div>

        {/* Campaign Breakdown & Qualitative Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Deliverable Campaigns Table */}
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <h4 className="text-sm font-bold font-display text-white mb-4">
              Active Deliverables & Campaign Performance
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-800 pb-2">
                  <tr>
                    <th className="pb-3">Campaign Deliverable</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3 text-right">Reach</th>
                    <th className="pb-3 text-right">Engagement</th>
                    <th className="pb-3 text-right">Leads</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {activeReport.campaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-slate-900/30">
                      <td className="py-3.5 pr-2">
                        <div className="font-semibold text-white">{camp.title}</div>
                        <div className="text-[11px] text-slate-500">{camp.deliverables}</div>
                      </td>
                      <td className="py-3.5 text-slate-400">{camp.type}</td>
                      <td className="py-3.5 text-right font-mono tabular-nums text-white">
                        {camp.impressions}
                      </td>
                      <td className="py-3.5 text-right font-mono tabular-nums text-amber-300">
                        {camp.engagement}
                      </td>
                      <td className="py-3.5 text-right font-mono tabular-nums text-emerald-400 font-semibold">
                        +{camp.leadsGenerated}
                      </td>
                      <td className="py-3.5 text-right">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                            camp.status === 'Live & Scaling'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {camp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strategic Insights & Growth Audit */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Executive Growth Notes</span>
              </div>
              <h4 className="text-sm font-bold font-display text-white mb-4">
                Strategy & Conversion Observations
              </h4>

              <div className="space-y-3.5">
                {activeReport.growthHighlights.map((hl, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Account Manager:</span>
              <span className="text-white font-medium">Sapotlokal Strategy Unit</span>
            </div>
          </div>
        </div>

        {/* Generate / Print Executive Report Modal */}
        {isExportReportOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setIsExportReportOpen(false)}
          >
            <div
              className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <div>
                  <span className="text-xs uppercase font-mono tracking-wider text-amber-400">
                    Sapotlokal Resources Executive Client Summary
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-white mt-1">
                    Monthly Performance Audit: {activeReport.clientName}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / PDF</span>
                  </button>
                  <button
                    onClick={() => setIsExportReportOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Print Sheet Content */}
              <div className="space-y-6 text-xs text-slate-300">
                {/* Agency & Client Lockup */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Consultancy Agency</span>
                    <span className="text-sm font-bold text-white block">Sapotlokal Resources</span>
                    <span className="text-[11px] text-slate-400">50, Jln Budiman 3/2 Taman Putra Budiman , Balakong, 43200 Cheras, Selangor</span>
                    <span className="text-[11px] text-slate-400 block font-mono">0122118111</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Client Enterprise</span>
                    <span className="text-sm font-bold text-white block">{activeReport.clientName}</span>
                    <span className="text-[11px] text-slate-400">{activeReport.brandTagline}</span>
                    <span className="text-[11px] text-amber-400 block font-mono">Period: {activeReport.period}</span>
                  </div>
                </div>

                {/* Scorecard Summary */}
                <div>
                  <h5 className="font-bold text-white mb-2 uppercase text-[11px] tracking-wider text-slate-400">
                    Aggregated Metric Highlights
                  </h5>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-900 rounded-lg">
                      <span className="text-[10px] text-slate-500 block">Total Reach</span>
                      <span className="text-base font-bold font-mono text-white">{activeReport.kpis.totalImpressions}</span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-lg">
                      <span className="text-[10px] text-slate-500 block">Inbound Leads Captured</span>
                      <span className="text-base font-bold font-mono text-emerald-400">+{activeReport.kpis.inboundLeads} Leads</span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-lg">
                      <span className="text-[10px] text-slate-500 block">Pipeline Revenue</span>
                      <span className="text-base font-bold font-mono text-amber-400">{activeReport.kpis.revenuePipeline}</span>
                    </div>
                  </div>
                </div>

                {/* Campaigns */}
                <div>
                  <h5 className="font-bold text-white mb-2 uppercase text-[11px] tracking-wider text-slate-400">
                    Deliverable Status Ledger
                  </h5>
                  <div className="border border-slate-800 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-slate-400 text-[10px]">
                        <tr>
                          <th className="p-2.5">Asset / Campaign</th>
                          <th className="p-2.5">Reach</th>
                          <th className="p-2.5">Engagement</th>
                          <th className="p-2.5">Leads</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {activeReport.campaigns.map((c) => (
                          <tr key={c.id}>
                            <td className="p-2.5">
                              <span className="font-semibold text-white block">{c.title}</span>
                              <span className="text-[10px] text-slate-500">{c.deliverables}</span>
                            </td>
                            <td className="p-2.5 font-mono">{c.impressions}</td>
                            <td className="p-2.5 font-mono text-amber-400">{c.engagement}</td>
                            <td className="p-2.5 font-mono text-emerald-400 font-bold">+{c.leadsGenerated}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Key Insights */}
                <div>
                  <h5 className="font-bold text-white mb-2 uppercase text-[11px] tracking-wider text-slate-400">
                    Strategic Next Steps
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {activeReport.growthHighlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500">
                <span>Generated by Sapotlokal Resources Intelligence Engine</span>
                <button
                  onClick={() => setIsExportReportOpen(false)}
                  className="px-4 py-2 bg-amber-400 text-slate-950 font-semibold rounded-lg"
                >
                  Close Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
