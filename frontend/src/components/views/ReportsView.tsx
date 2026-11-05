import React, { useState } from 'react';
import {
  Download,
  CheckCircle2,
  Plus,
  Eye,
  X
} from 'lucide-react';
import { mockReports } from '../../data/mock-data';
import { ReportItem } from '../../types';

interface ReportsViewProps {
  reportsList?: ReportItem[];
  onUpdateReports?: (reports: ReportItem[]) => void;
  brandName?: string;
  geoScore?: number;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reportsList = [],
  onUpdateReports,
  brandName = 'Serpely AI',
  geoScore = 88
}) => {
  const [reports, setReports] = useState<ReportItem[]>(reportsList);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [inspectedReport, setInspectedReport] = useState<ReportItem | null>(null);

  const handleDownload = (rep: ReportItem) => {
    const markdown = `# ${rep.title}\n**Brand**: ${brandName}\n**Period**: ${rep.period}\n**Author**: ${rep.author}\n**Key KPI**: ${rep.keyKpi}\n\n## Executive Summary\n${rep.summary}\n`;
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${rep.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(`Downloaded "${rep.title}".`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleGenerateSnapshotReport = () => {
    const newRep: ReportItem = {
      id: `rep-${Date.now()}`,
      title: `${brandName} Live Multi-Agent & GEO Snapshot`,
      period: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      type: 'Live Snapshot',
      summary: `Current Workspace GEO Score stands at ${geoScore}/100. All 12 specialized AI agents are operational with LinkedIn & Facebook Page OAuth publishing and Human Approval Gate enforcement active.`,
      keyKpi: `${geoScore}/100 Live GEO Visibility Score`,
      author: 'Analytics & Memory Agents'
    };
    const next = [newRep, ...reports];
    setReports(next);
    if (onUpdateReports) onUpdateReports(next);
    setDownloadSuccess(`Synthesized live report for ${brandName}.`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Reports
          </h2>
          <span className="text-xs font-semibold text-emerald-400 tabular-nums">
            {reports.length} Briefings
          </span>
        </div>

        <button
          onClick={handleGenerateSnapshotReport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Synthesize Snapshot</span>
        </button>
      </div>

      {downloadSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{downloadSuccess}</span>
          </div>
          <button onClick={() => setDownloadSuccess(null)} className="text-neutral-400 hover:text-neutral-100">✕</button>
        </div>
      )}

      {/* Clean 3-Point Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reports.map(rep => (
          <div
            key={rep.id}
            className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 flex flex-col justify-between space-y-4 hover:border-neutral-700 transition-all"
          >
            {/* 1. Metadata & Title */}
            <div className="space-y-2">
              <div className="text-xs text-neutral-400">
                <strong className="text-emerald-400 uppercase">{rep.type}</strong> · {rep.period} · {rep.author}
              </div>
              <h3 className="text-base font-bold text-white">{rep.title}</h3>
              <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">{rep.summary}</p>
            </div>

            {/* 2. Key KPI Highlight + 3. Actions */}
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-emerald-400 tabular-nums truncate">
                {rep.keyKpi}
              </span>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setInspectedReport(rep)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Read</span>
                </button>
                <button
                  onClick={() => handleDownload(rep)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Reader Modal */}
      {inspectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase">
                  {inspectedReport.type} · {inspectedReport.period}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{inspectedReport.title}</h3>
              </div>
              <button
                onClick={() => setInspectedReport(null)}
                className="p-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-neutral-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 leading-relaxed">
                {inspectedReport.summary}
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Author: <strong className="text-white">{inspectedReport.author}</strong></span>
                <span className="text-emerald-400 font-bold">{inspectedReport.keyKpi}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setInspectedReport(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => handleDownload(inspectedReport)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download .MD</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
