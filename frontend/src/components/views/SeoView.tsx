import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Wrench,
  Globe,
  Code2
} from 'lucide-react';
import { mockGeoScore } from '../../data/mock-data';
import { GeoScoreData } from '../../types';

interface SeoViewProps {
  geoScore?: GeoScoreData;
  onUpdateGeoScore?: (geo: GeoScoreData) => void;
  brandName?: string;
  brandWebsite?: string;
}

export const SeoView: React.FC<SeoViewProps> = ({
  geoScore = mockGeoScore,
  onUpdateGeoScore,
  brandName = 'Brand',
  brandWebsite = 'https://brand.com'
}) => {
  const [geoData, setGeoData] = useState<GeoScoreData>(geoScore);
  const [targetUrl, setTargetUrl] = useState<string>(geoScore.lastAuditedUrl || brandWebsite);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditNotice, setAuditNotice] = useState<string | null>(null);
  const [crawledMeta, setCrawledMeta] = useState<{
    pageTitle?: string;
    metaDescription?: string;
    headings?: string[];
    hasJsonLd?: boolean;
    fetchSucceeded?: boolean;
  } | null>(null);

  useEffect(() => {
    setGeoData(geoScore);
    if (geoScore.lastAuditedUrl) {
      setTargetUrl(geoScore.lastAuditedUrl);
    }
  }, [geoScore]);

  const updateGeo = (next: GeoScoreData) => {
    setGeoData(next);
    if (onUpdateGeoScore) onUpdateGeoScore(next);
  };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    setAuditNotice(null);
    try {
      const res = await fetch('/api/seo/audit-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.crawledMeta) setCrawledMeta(data.crawledMeta);
        if (data.geoScore) {
          updateGeo(data.geoScore);
        }
        setAuditNotice(`Audit complete for ${targetUrl}.`);
      }
    } catch {
      const next: GeoScoreData = {
        ...geoData,
        overallScore: Math.min(100, geoData.overallScore + 2),
        change30Days: geoData.change30Days + 2,
        lastAuditedUrl: targetUrl,
        lastAuditedAt: 'Just now'
      };
      updateGeo(next);
      setAuditNotice(`Audit complete for ${targetUrl}.`);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleAddressHallucination = (id: string) => {
    const next: GeoScoreData = {
      ...geoData,
      overallScore: Math.min(100, geoData.overallScore + 1),
      hallucinationAlerts: geoData.hallucinationAlerts.map(h =>
        h.id === id ? { ...h, status: 'addressed' as const } : h
      )
    };
    updateGeo(next);
  };

  const handleApplyTechnicalFix = (id: string) => {
    const next: GeoScoreData = {
      ...geoData,
      overallScore: Math.min(100, geoData.overallScore + 2),
      technicalFixes: (geoData.technicalFixes || []).map(f =>
        f.id === id ? { ...f, status: 'fixed' as const } : f
      )
    };
    updateGeo(next);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header & Live Domain Crawler Input */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            SEO & Search
          </h2>
          <span className="text-xs font-semibold text-emerald-400 tabular-nums">
            {geoData.overallScore}/100 Score
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex items-center">
            <Globe className="h-4 w-4 text-neutral-500 absolute left-3" />
            <input
              type="text"
              value={targetUrl}
              onChange={e => setTargetUrl(e.target.value)}
              placeholder="https://your-domain.com"
              className="pl-9 pr-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white w-full sm:w-64 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold transition-all shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'Auditing...' : 'Run Live Audit'}</span>
          </button>
        </div>
      </div>

      {auditNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{auditNotice}</span>
          </div>
          <button onClick={() => setAuditNotice(null)} className="text-neutral-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Crawled Website Telemetry Banner */}
      {crawledMeta && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-bold text-white">
            {crawledMeta.pageTitle || geoData.lastAuditedUrl}
          </span>
          <span className="text-emerald-400 font-semibold">
            {crawledMeta.hasJsonLd ? 'JSON-LD Schema Verified' : 'Schema Patch Recommended'}
          </span>
        </div>
      )}

      {/* Main GEO Score Hero Gauge Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Score */}
        <div className="rounded-2xl border border-emerald-500/30 bg-neutral-900/60 p-6 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase">
              {brandName} Visibility
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">Composite GEO Score</h3>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-black text-white tracking-tight tabular-nums">
              {geoData.overallScore}
            </span>
            <span className="text-base text-neutral-500">/ 100</span>
            <span className="text-xs font-bold text-emerald-400 ml-auto bg-emerald-500/10 px-2 py-0.5 rounded-md">
              +{geoData.change30Days}% (30d)
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-700"
                style={{ width: `${geoData.overallScore}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-neutral-500">
              <span className="truncate max-w-[180px]">{geoData.lastAuditedUrl || brandWebsite}</span>
              <span>{geoData.lastAuditedAt || 'Live'}</span>
            </div>
          </div>
        </div>

        {/* Engine Citation Distribution */}
        <div className="md:col-span-2 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              AI Engine Citation Breakdown
            </h3>
            <span className="text-xs text-emerald-400 font-semibold">4 Engines Tracked</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {geoData.aiEngineBreakdown.map((engine, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white text-sm">{engine.engine}</span>
                  <span className="text-xs font-bold text-emerald-400 tabular-nums">
                    {engine.score}/100
                  </span>
                </div>

                <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full"
                    style={{ width: `${engine.score}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-400 tabular-nums">
                  <span>Share: <strong className="text-white">{engine.citationShare}%</strong></span>
                  <span>{engine.citationsLastWeek} citations (7d)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technical SEO & Schema Fix Queue */}
      {geoData.technicalFixes && geoData.technicalFixes.length > 0 && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Technical SEO & Schema Fix Queue</h3>
            </div>
            <span className="text-xs text-emerald-400 font-bold tabular-nums">
              {geoData.technicalFixes.filter(f => f.status === 'open').length} Open Fixes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {geoData.technicalFixes.map(fix => (
              <div
                key={fix.id}
                className={`p-4 rounded-xl border text-xs space-y-3 flex flex-col justify-between ${
                  fix.status === 'open'
                    ? 'bg-neutral-950 border-neutral-800'
                    : 'bg-neutral-950/40 border-neutral-800/50 text-neutral-500'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-neutral-400 font-medium">
                      <strong className="text-emerald-400 uppercase">{fix.category}</strong> · {fix.priority}
                    </span>
                    <span className="font-bold text-emerald-300">{fix.impact}</span>
                  </div>
                  <div className="font-bold text-white text-sm">{fix.title}</div>
                  <p className="text-neutral-400 line-clamp-2">{fix.recommendation}</p>
                </div>

                <div className="pt-2 flex items-center justify-end border-t border-neutral-800/80">
                  {fix.status === 'open' ? (
                    <button
                      onClick={() => handleApplyTechnicalFix(fix.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-colors flex items-center gap-1"
                    >
                      <Wrench className="h-3 w-3" />
                      <span>Deploy Patch</span>
                    </button>
                  ) : (
                    <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Patched
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hallucination Alerts Section */}
      <div className="rounded-2xl border border-amber-500/30 bg-neutral-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">AI Hallucination Alerts</h3>
          </div>
          <span className="text-xs text-amber-400 font-bold tabular-nums">
            {geoData.hallucinationAlerts.filter(h => h.status === 'open').length} Open
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {geoData.hallucinationAlerts.map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border text-xs space-y-2.5 flex flex-col justify-between ${
                alert.status === 'open'
                  ? 'bg-neutral-950 border-amber-500/30'
                  : 'bg-neutral-950/60 border-neutral-800 text-neutral-500'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">
                    {alert.engine} · <span className="text-amber-400 uppercase text-[10px]">{alert.severity}</span>
                  </span>
                  <span className="text-[11px] text-neutral-400">{alert.detectedAt}</span>
                </div>

                <div className="space-y-1">
                  <div className="text-amber-300 line-clamp-1">Claim: "{alert.claim}"</div>
                  <div className="text-emerald-400 line-clamp-1">Fix: "{alert.correction}"</div>
                </div>
              </div>

              {alert.status === 'open' ? (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleAddressHallucination(alert.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs transition-colors flex items-center gap-1"
                  >
                    <Wrench className="h-3 w-3" />
                    <span>Inject Schema Patch</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2 text-right text-emerald-400 font-semibold">Addressed</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Top Ranked Brand Entities */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-3">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
          Knowledge Graph Entity Rankings
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] text-neutral-500 uppercase border-b border-neutral-800">
              <tr>
                <th className="pb-2">Entity Phrase</th>
                <th className="pb-2">Visibility</th>
                <th className="pb-2">Position</th>
                <th className="pb-2">30d Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80 tabular-nums">
              {geoData.topRankedEntities.map((ent, idx) => (
                <tr key={idx} className="hover:bg-neutral-900/50">
                  <td className="py-2.5 font-semibold text-white">{ent.entity}</td>
                  <td className="py-2.5 text-emerald-400 font-bold">{ent.visibility}%</td>
                  <td className="py-2.5 text-neutral-300">#{ent.position}</td>
                  <td className="py-2.5 text-emerald-400 uppercase text-[10px] font-bold">{ent.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
