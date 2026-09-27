"use client";

import React from 'react';
import { Milk, ShieldCheck, Flame, Layers, ArrowRight, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { dictionary, Language } from '../lib/dictionary';
import { BatchAnalyzeResponse } from '../lib/api';

interface DashboardProps {
  lang: Language;
  data: BatchAnalyzeResponse;
  farmerMode: boolean;
  onNavigateTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ lang, data, farmerMode, onNavigateTab }) => {
  const t = dictionary[lang];
  const { evidence, nutritional_analysis, dairy_ration, storage_telemetry, advisories, batch_id } = data;

  return (
    <div className="space-y-6">
      
      {/* 1. Farm Overview Banner */}
      <div className="bg-[#1b4332] text-white p-6 sm:p-8 rounded-3xl border border-[#2d6a4f] shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-[#74c69d] uppercase tracking-wider mb-2">
              <Milk className="w-4 h-4 text-[#52b788]" />
              <span>SHIV DAIRY FARM • PUNE REGION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Feed & Dairy Intelligence Center</h1>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1 max-w-xl">
              Active Monitoring: 24 Cattle (17 Lactating / 7 Dry) • Daily Milk Yield: ~260 Liters
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('testing')}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#52b788] to-[#40916c] text-[#1b4332] font-extrabold text-sm shadow-lg hover:scale-105 transition-transform flex items-center space-x-2"
          >
            <span>Test New Feed Batch</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Latest Test Result */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex justify-between items-center text-xs text-stone-500 font-bold mb-2">
            <span>LATEST BATCH #{batch_id}</span>
            <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded font-mono">Maize Silage</span>
          </div>
          <div className="text-2xl font-black text-[#1b4332]">{evidence.trust_status}</div>
          <div className="text-[11px] text-stone-500 mt-1">
            Evidence Certainty: <span className="font-bold text-emerald-700">{evidence.evidence_score}%</span>
          </div>
        </div>

        {/* Crude Protein */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex justify-between items-center text-xs text-stone-500 font-bold mb-2">
            <span>CRUDE PROTEIN (CP)</span>
            <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded font-mono">NIR Scan</span>
          </div>
          <div className="text-2xl font-black text-[#1b4332]">{nutritional_analysis.crude_protein_pct}%</div>
          <div className="text-[11px] text-stone-500 mt-1">
            Dry Matter: <span className="font-bold text-amber-700">{nutritional_analysis.dry_matter_pct}%</span>
          </div>
        </div>

        {/* Silage Telemetry Risk */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex justify-between items-center text-xs text-stone-500 font-bold mb-2">
            <span>STORAGE RISK</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-[#1b4332]">{storage_telemetry.spoilage_risk_index} / 100</div>
          <div className="text-[11px] text-stone-500 mt-1">
            Pit Temp: <span className="font-bold text-stone-800">{storage_telemetry.temperature_celsius}°C</span>
          </div>
        </div>

        {/* Dairy Ration CP Gap */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex justify-between items-center text-xs text-stone-500 font-bold mb-2">
            <span>RATION PROTEIN GAP</span>
            <Milk className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black text-[#1b4332]">{dairy_ration.ration_analysis.cp_gap_pct}%</div>
          <div className="text-[11px] text-stone-500 mt-1">
            Status: <span className="font-bold text-amber-700">{dairy_ration.ration_analysis.cp_status}</span>
          </div>
        </div>

      </div>

      {/* 3. Actionable Advisory Center */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <h3 className="text-lg font-bold text-[#1a1e1b] flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Active Feed & Storage Advisories</span>
          </h3>
          <span className="text-xs font-mono bg-stone-100 text-stone-600 px-2.5 py-1 rounded font-bold">
            {advisories.length} ACTIVE
          </span>
        </div>

        <div className="space-y-3">
          {advisories.map((adv) => (
            <div
              key={adv.id}
              className={`p-4 rounded-xl border flex items-start space-x-3 text-xs ${
                adv.severity === 'CRITICAL'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : adv.severity === 'HIGH'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="p-1 rounded bg-white shadow-sm mt-0.5">
                {adv.severity === 'CRITICAL' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-extrabold text-sm">{adv.title}</div>
                <p className="mt-1 leading-relaxed font-medium">{adv.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
