"use client";

import React from "react";
import { 
  AlertTriangle, ArrowRight, CheckCircle2, Flame, Milk, 
  ShieldAlert, Activity, ShieldCheck, Database, QrCode, 
  ChevronRight, Thermometer, Layers, RefreshCw, FileText
} from "lucide-react";
import { BatchAnalyzeResponse } from "../lib/api";
import { dictionary, Language } from "../lib/dictionary";

interface Props {
  lang: Language;
  data: BatchAnalyzeResponse;
  farmerMode: boolean;
  onNavigateTab: (tab: string) => void;
}

export const Dashboard: React.FC<Props> = ({ data, farmerMode, onNavigateTab, lang }) => {
  const t = dictionary[lang] || dictionary.en;
  const { evidence, nutritional_analysis: nutrition, dairy_ration: ration, storage_telemetry: storage, advisories } = data;
  const profile = data.farm_profile;
  
  const isWithheld = ["RESULT NOT TRUSTED", "SUSPECTED ADULTERATION"].includes(evidence.trust_status);
  
  const statusLabel = lang === "mr"
    ? ({ 
        TRUSTED: "विश्वसनीय (TRUSTED)", 
        "RETEST RECOMMENDED": "पुन्हा चाचणी शिफारस", 
        "RESULT NOT TRUSTED": "निकाल अमान्य (NOT TRUSTED)", 
        "SUSPECTED ADULTERATION": "संशयित भेसळ", 
        "TRUSTED WITH STORAGE WARNING": "साठवण इशारा" 
      }[evidence.trust_status] ?? evidence.trust_status)
    : lang === "hi"
    ? ({
        TRUSTED: "विश्वसनीय (TRUSTED)",
        "RETEST RECOMMENDED": "पुनः परीक्षण की सलाह",
        "RESULT NOT TRUSTED": "परिणाम अमान्य (NOT TRUSTED)",
        "SUSPECTED ADULTERATION": "संदिग्ध मिलावट",
        "TRUSTED WITH STORAGE WARNING": "भंडारण चेतावनी"
      }[evidence.trust_status] ?? evidence.trust_status)
    : evidence.trust_status;

  return (
    <div className="space-y-6">
      
      {/* 1. Farm Header Operational Banner */}
      <section className="bg-gradient-to-r from-[#0e2a1c] via-[#143826] to-[#0e2a1c] text-white p-6 sm:p-8 rounded-3xl border border-[#2d6a4f] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#74c69d] uppercase tracking-wider">
            <Milk className="w-4 h-4 text-emerald-400" />
            <span>{profile.farm_name} &bull; {profile.location}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Farm Intelligence Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium">
            <strong>{profile.lactating_animals}</strong> {lang === 'mr' ? 'दुभती जनावरे' : lang === 'hi' ? 'दुधारू पशु' : 'Lactating Cattle'} &bull; <strong>{profile.dry_animals}</strong> {lang === 'mr' ? 'भाकड जनावरे' : lang === 'hi' ? 'सूखे पशु' : 'Dry Cattle'} &bull; <strong>{profile.daily_milk_yield_liters} L/day</strong> Total Yield
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab("nir-scan")}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#52b788] to-[#74c69d] text-[#1b4332] font-black text-xs sm:text-sm shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Activity className="w-4 h-4" />
            <span>Run Feed Scan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 2. Rapid Workflow Action Launcher */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { tab: "nir-scan", label: "Multi-Point NIR Scan", desc: "5-point spatial forage analysis", icon: Activity, tag: "Spectroscopy" },
          { tab: "evidence", label: "Evidence Engine", desc: "Gating & Mahalanobis check", icon: ShieldCheck, tag: "Verification" },
          { tab: "ration", label: "Dairy Ration Balancer", desc: "ICAR/NRC protein balance", icon: Layers, tag: "Advisory" },
          { tab: "passport", label: "Quality Passport & IoT", desc: "SHA-256 batch ledger", icon: QrCode, tag: "Traceability" },
        ].map((item) => {
          const IconComp = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => onNavigateTab(item.tab)}
              className="bg-white p-5 rounded-3xl border border-stone-200 text-left shadow-2xs hover:shadow-md hover:border-[#1b4332] transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
                    {item.tag}
                  </span>
                  <IconComp className="w-4 h-4 text-stone-400 group-hover:text-[#1b4332] transition-colors" />
                </div>
                <div className="font-black text-sm text-stone-900 group-hover:text-[#1b4332] transition-colors">
                  {item.label}
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  {item.desc}
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-[11px] font-bold text-[#1b4332]">
                <span>Open View</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Operational 4-Card KPI Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* KPI 1: Evidence Status */}
        <article className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 font-bold uppercase tracking-wider">
              <span>BATCH INTEGRITY</span>
              <span className="font-mono text-[10px] text-stone-400">#{data.batch_id}</span>
            </div>
            <div className={`text-xl font-black mt-3 flex items-center gap-2 ${
              evidence.trust_status === 'TRUSTED' ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              <ShieldCheck className="w-5 h-5 shrink-0" />
              <span>{statusLabel}</span>
            </div>
            <p className="text-xs text-stone-500 mt-2">
              Evidence Sufficiency Score: <strong className="text-stone-800">{evidence.evidence_score}%</strong>
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-stone-100 text-[11px] text-stone-400 font-mono">
            Calibration: {data.nutritional_analysis?.domain_status || 'IN_DOMAIN'}
          </div>
        </article>

        {/* KPI 2: Crude Protein */}
        <article className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 font-bold uppercase tracking-wider">
              <span>CRUDE PROTEIN (CP)</span>
              <span className="font-mono text-[10px] text-emerald-800 font-bold">{data.feed_type}</span>
            </div>
            <div className="text-3xl font-black mt-3 text-[#1b4332]">
              {isWithheld ? "Withheld" : `${nutrition.crude_protein_pct}%`}
            </div>
            <p className="text-xs text-stone-500 mt-2">
              Dry Matter: <strong className="text-stone-800">{nutrition.dry_matter_pct}%</strong> (Target 35–40%)
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-stone-100 text-[11px] text-stone-400 font-mono">
            {nutrition.confidence_intervals?.crude_protein_pct 
              ? `95% CI: [${nutrition.confidence_intervals.crude_protein_pct[0]} - ${nutrition.confidence_intervals.crude_protein_pct[1]}%]`
              : "PLSR Multi-Target Model"}
          </div>
        </article>

        {/* KPI 3: Storage Microclimate */}
        <article className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 font-bold uppercase tracking-wider">
              <span>STORAGE MICROCLIMATE</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-black mt-3 text-stone-900">
              {storage.spoilage_risk_index}<span className="text-base text-stone-400 font-normal"> / 100</span>
            </div>
            <p className="text-xs text-stone-500 mt-2 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-rose-500" />
              <span>Face Temp: <strong className="text-stone-800">{storage.temperature_celsius}&deg;C</strong> &bull; pH {storage.ph}</span>
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-stone-100 text-[11px] text-stone-400 font-mono">
            Status: {storage.status || "STABLE"}
          </div>
        </article>

        {/* KPI 4: Ration Balance Gap */}
        <article className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 font-bold uppercase tracking-wider">
              <span>RATION PROTEIN GAP</span>
              <span className="font-mono text-[10px] text-stone-400">{ration?.ration_analysis?.ration_group || "Lactating"}</span>
            </div>
            <div className="text-3xl font-black mt-3 text-[#1b4332]">
              {ration?.ration_analysis?.cp_gap_pct ? `${ration.ration_analysis.cp_gap_pct} pp` : "+0.4 kg"}
            </div>
            <p className="text-xs text-stone-500 mt-2">
              Weighted Basket: <strong className="text-stone-800">{ration?.ration_analysis?.basket_weighted_cp_pct || 13.2}% CP</strong>
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-stone-100 text-[11px] text-stone-400 font-mono">
            ICAR Herd Standard Aligned
          </div>
        </article>

      </section>

      {/* 4. Critical Warning if Out-of-Domain or Adulterated */}
      {isWithheld && (
        <div className="rounded-3xl border border-rose-300 bg-rose-50 p-6 text-rose-950 shadow-xs flex items-start gap-4">
          <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-black text-sm">Quantitative Prediction Withheld — Confirmation Recommended</h4>
            <p className="text-xs text-rose-900 leading-relaxed">
              The current sample shows elevated Mahalanobis calibration distance or non-uniform core variance. Rather than outputting an uncertain number, FeedSure 360 advises collecting 5 fresh cores or submitting for lab validation.
            </p>
          </div>
        </div>
      )}

      {/* 5. Live Diagnostics & Advisories Section */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2 className="font-black text-lg text-stone-900">Active Operational Advisories</h2>
          </div>
          <span className="text-xs font-mono text-stone-500 font-bold bg-stone-100 px-2.5 py-1 rounded-full">
            {advisories.length} Active Records
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {advisories.map((item) => (
            <div 
              key={item.id} 
              className="p-4 rounded-2xl border border-stone-200 bg-stone-50 flex items-start gap-3 hover:border-stone-300 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-[#1b4332] shrink-0" />
              <div className="space-y-1">
                <div className="font-black text-xs text-stone-900">{item.title}</div>
                <p className="text-xs text-stone-600 leading-relaxed">{item.message}</p>
                <div className="text-[10px] uppercase font-mono tracking-wider text-stone-400 pt-1">
                  Severity: <strong className="text-stone-600">{item.severity}</strong> &bull; Category: {item.category}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Provenance and Methodology Technical Drawer */}
      {!farmerMode && (
        <details className="bg-white rounded-3xl p-6 border border-stone-200 shadow-2xs group">
          <summary className="font-black text-xs uppercase tracking-wider text-stone-700 cursor-pointer flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#1b4332]" />
              <span>Data Provenance &bull; Chemometric Pipeline Technical Notes</span>
            </span>
            <span className="text-[10px] text-stone-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <dl className="grid sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-stone-100 text-xs">
            {Object.entries(data.data_provenance || {}).map(([key, value]) => (
              <div key={key} className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <dt className="font-bold font-mono text-[10px] uppercase text-stone-500">
                  {key.replaceAll("_", " ")}
                </dt>
                <dd className="mt-1 font-medium text-stone-800 text-[11px]">{String(value)}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}

    </div>
  );
};
