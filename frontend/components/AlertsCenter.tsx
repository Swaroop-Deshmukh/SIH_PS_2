"use client";

import React, { useState } from "react";
import { AlertOctagon, AlertTriangle, Info, CheckCircle2, ShieldAlert, ArrowRight, BellRing, Filter } from "lucide-react";
import { BatchAnalyzeResponse } from "../lib/api";
import { Language } from "../lib/dictionary";

interface AlertsCenterProps {
  lang: Language;
  data: BatchAnalyzeResponse;
  onNavigateTab: (tab: string) => void;
}

export const AlertsCenter: React.FC<AlertsCenterProps> = ({
  lang,
  data,
  onNavigateTab,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  const advisories = data.advisories || [];

  const filtered = advisories.filter((a) => {
    if (filterSeverity === "all") return true;
    return a.severity?.toLowerCase() === filterSeverity.toLowerCase();
  });

  const getSeverityStyle = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case "CRITICAL":
        return {
          badgeBg: "bg-rose-100 text-rose-800 border-rose-200",
          cardBorder: "border-l-4 border-l-rose-500 border-rose-200 bg-rose-50/20",
          icon: <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
          label: "CRITICAL ALERT",
        };
      case "WARNING":
        return {
          badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
          cardBorder: "border-l-4 border-l-amber-500 border-amber-200 bg-amber-50/20",
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
          label: "WARNING",
        };
      case "CAUTION":
        return {
          badgeBg: "bg-yellow-100 text-yellow-800 border-yellow-800/20",
          cardBorder: "border-l-4 border-l-yellow-500 border-yellow-200 bg-yellow-50/20",
          icon: <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />,
          label: "CAUTION",
        };
      default:
        return {
          badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
          cardBorder: "border-l-4 border-l-emerald-500 border-stone-200 bg-white",
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
          label: "INFORMATIONAL",
        };
    }
  };

  const counts = {
    all: advisories.length,
    critical: advisories.filter((a) => a.severity === "CRITICAL").length,
    warning: advisories.filter((a) => a.severity === "WARNING").length,
    caution: advisories.filter((a) => a.severity === "CAUTION").length,
    info: advisories.filter((a) => a.severity === "INFO" || a.severity === "OK").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#2d6a4f] uppercase tracking-wider">
            <BellRing className="w-4 h-4" />
            <span>Farm Safety & Advisory Engine</span>
          </div>
          <h2 className="text-2xl font-black text-stone-900 mt-1">Active Alerts & Notifications</h2>
          <p className="text-xs text-stone-600 mt-1">
            Real-time multi-tier advisories generated from NIR chemometrics, computer vision screening, and trough telemetry for Batch {data.batch_id}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {counts.critical > 0 && (
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-rose-600 text-white animate-pulse">
              {counts.critical} Critical
            </span>
          )}
          {counts.warning > 0 && (
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500 text-white">
              {counts.warning} Warnings
            </span>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterSeverity("all")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            filterSeverity === "all" ? "bg-[#1b4332] text-white" : "bg-white border border-stone-200 text-stone-700"
          }`}
        >
          <span>All Advisories</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-black/10">{counts.all}</span>
        </button>
        <button
          onClick={() => setFilterSeverity("CRITICAL")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            filterSeverity === "CRITICAL" ? "bg-rose-600 text-white" : "bg-white border border-stone-200 text-rose-700"
          }`}
        >
          <span>Critical</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-rose-100 text-rose-800">{counts.critical}</span>
        </button>
        <button
          onClick={() => setFilterSeverity("WARNING")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            filterSeverity === "WARNING" ? "bg-amber-600 text-white" : "bg-white border border-stone-200 text-amber-700"
          }`}
        >
          <span>Warning</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-amber-100 text-amber-800">{counts.warning}</span>
        </button>
        <button
          onClick={() => setFilterSeverity("CAUTION")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            filterSeverity === "CAUTION" ? "bg-yellow-600 text-white" : "bg-white border border-stone-200 text-yellow-800"
          }`}
        >
          <span>Caution</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-yellow-100 text-yellow-800">{counts.caution}</span>
        </button>
        <button
          onClick={() => setFilterSeverity("INFO")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            filterSeverity === "INFO" ? "bg-emerald-700 text-white" : "bg-white border border-stone-200 text-emerald-800"
          }`}
        >
          <span>Normal / Info</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-emerald-100 text-emerald-800">{counts.info}</span>
        </button>
      </div>

      {/* Advisory Cards List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200">
            No advisories match the selected severity filter.
          </div>
        ) : (
          filtered.map((item, idx) => {
            const style = getSeverityStyle(item.severity);
            const isCritical = item.severity === "CRITICAL";

            return (
              <div
                key={item.id || idx}
                className={`p-5 rounded-2xl border ${style.cardBorder} shadow-sm transition hover:shadow-md`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {style.icon}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${style.badgeBg}`}>
                          {style.label}
                        </span>
                        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">
                          {item.category || "General"}
                        </span>
                        <span className="text-[10px] font-mono text-stone-400">
                          ID: {item.id}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-stone-900 mt-2">{item.title}</h3>
                      <p className="text-xs text-stone-700 mt-1.5 leading-relaxed max-w-3xl">
                        {item.message}
                      </p>
                    </div>
                  </div>

                  {item.verification_required && (
                    <span className="shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-bold bg-amber-500/10 text-amber-800 border border-amber-300">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      Physical Verification Required
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="text-[11px] text-stone-500">
                    {isCritical
                      ? "Escalation: Immediate trough inspection and veterinary consultation recommended before herd feeding."
                      : "Status: Automated decision-support guidance generated for dairy farmer."}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigateTab("testing")}
                      className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-bold inline-flex items-center gap-1"
                    >
                      <span>Inspect Evidence</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onNavigateTab("ration")}
                      className="px-3 py-1.5 rounded-lg bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-[11px] font-bold inline-flex items-center gap-1"
                    >
                      <span>Review Ration</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
