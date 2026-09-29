"use client";

import React, { useState } from 'react';
import { 
  AlertTriangle, ShieldAlert, CheckCircle2, HelpCircle, 
  RefreshCw, XCircle, ShieldCheck, Activity, Eye, Sliders,
  Lock, ArrowRight, Layers, Sparkles
} from 'lucide-react';
import { dictionary, Language } from '../lib/dictionary';
import { BatchAnalyzeResponse } from '../lib/api';

interface EvidencePanelProps {
  lang: Language;
  data: BatchAnalyzeResponse;
  farmerMode: boolean;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ lang, data, farmerMode }) => {
  const t = dictionary[lang] || dictionary.en;
  const { evidence } = data;
  const { metrics, trust_status, evidence_level, evidence_score, untrusted_reasons, recommendation } = evidence;

  const [showExplainModal, setShowExplainModal] = useState(false);

  // Status Styling Config
  const getStatusBadge = () => {
    switch (trust_status) {
      case 'TRUSTED':
        return {
          bg: 'bg-emerald-50/90 border-emerald-300 text-emerald-950',
          badge: 'bg-[#1b4332] text-white',
          icon: CheckCircle2,
          label: t.trusted || 'TRUSTED - IN DOMAIN'
        };
      case 'RESULT NOT TRUSTED':
        return {
          bg: 'bg-rose-50/90 border-rose-300 text-rose-950',
          badge: 'bg-rose-600 text-white animate-pulse',
          icon: XCircle,
          label: t.resultNotTrusted || 'RESULT WITHHELD'
        };
      case 'RETEST RECOMMENDED':
        return {
          bg: 'bg-amber-50/90 border-amber-300 text-amber-950',
          badge: 'bg-amber-600 text-white',
          icon: RefreshCw,
          label: t.retestRecommended || 'RETEST RECOMMENDED'
        };
      case 'SUSPECTED ADULTERATION':
        return {
          bg: 'bg-purple-50/90 border-purple-300 text-purple-950',
          badge: 'bg-purple-700 text-white',
          icon: ShieldAlert,
          label: t.suspectedAdulteration || 'SUSPECTED ADULTERATION'
        };
      default:
        return {
          bg: 'bg-amber-50/90 border-amber-300 text-amber-950',
          badge: 'bg-amber-600 text-white',
          icon: AlertTriangle,
          label: t.storageAlert || 'STORAGE WARNING'
        };
    }
  };

  const statusConfig = getStatusBadge();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      
      {/* 1. Primary Trust Status & Gating Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border ${statusConfig.bg} shadow-sm transition-all`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex items-start space-x-4">
            <div className={`p-3.5 rounded-2xl ${statusConfig.badge} shadow-lg shrink-0 mt-1 md:mt-0`}>
              <StatusIcon className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${statusConfig.badge}`}>
                  {statusConfig.label}
                </span>
                <span className="text-xs font-mono font-bold text-stone-600 uppercase tracking-widest">
                  EVIDENCE LEVEL: {evidence_level}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                {trust_status === 'TRUSTED' ? 'Sample Verified & Within Calibration Domain' : 'Evidence Safeguard Gating Triggered'}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-stone-700 max-w-2xl leading-relaxed">
                {recommendation}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowExplainModal(true)}
            className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-white border border-stone-300 font-bold text-xs text-stone-800 hover:bg-stone-50 shadow-xs transition-all shrink-0 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-[#1b4332]" />
            <span>Explain This Result</span>
          </button>

        </div>

        {/* Untrusted Reasons Callout */}
        {untrusted_reasons.length > 0 && (
          <div className="mt-6 pt-4 border-t border-black/10 bg-white/80 p-5 rounded-2xl">
            <div className="text-xs font-black text-rose-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Gating Factors Triggered by Evidence Engine:</span>
            </div>
            <ul className="space-y-1.5 text-xs text-stone-800 font-medium pl-6 list-disc">
              {untrusted_reasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 2. Five Multi-Source Evidence Factor Breakdown */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#1b4332]" />
              <h3 className="text-lg font-black text-stone-900">Multi-Layer Evidence Fusion Checkpoints</h3>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Multi-source evaluation: SNR baseline, 5-point spatial homogeneity, Mahalanobis distance, uncertainty bounds, and CV texture.
            </p>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <div className="text-[10px] text-stone-400 font-mono font-bold uppercase">SUFFICIENCY SCORE</div>
            <div className="text-3xl font-black text-[#1b4332]">{evidence_score} / 100</div>
          </div>
        </div>

        {/* 5 Factor Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="text-[10px] font-mono font-bold text-stone-500 uppercase">1. Spectral Quality</div>
            <div className="text-2xl font-black text-[#1b4332] mt-1">{metrics.spectral_quality}%</div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#1b4332] h-full" style={{ width: `${metrics.spectral_quality}%` }}></div>
            </div>
            <div className="text-[10px] text-stone-500 mt-1">Signal-to-Noise Ratio (SNR)</div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="text-[10px] font-mono font-bold text-stone-500 uppercase">2. Spatial Uniformity</div>
            <div className="text-2xl font-black text-[#1b4332] mt-1">{metrics.sample_consistency}%</div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#52b788] h-full" style={{ width: `${metrics.sample_consistency}%` }}></div>
            </div>
            <div className="text-[10px] text-stone-500 mt-1">5-Point Core Variance</div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="text-[10px] font-mono font-bold text-stone-500 uppercase">3. Calibration Fit</div>
            <div className="text-2xl font-black text-[#1b4332] mt-1">{metrics.calibration_fit}%</div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#2d6a4f] h-full" style={{ width: `${metrics.calibration_fit}%` }}></div>
            </div>
            <div className="text-[10px] text-stone-500 mt-1">Mahalanobis Dist: {metrics.ood_distance.toFixed(2)}</div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="text-[10px] font-mono font-bold text-stone-500 uppercase">4. Certainty Interval</div>
            <div className="text-2xl font-black text-[#1b4332] mt-1">{100 - metrics.prediction_uncertainty}%</div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#74c69d] h-full" style={{ width: `${100 - metrics.prediction_uncertainty}%` }}></div>
            </div>
            <div className="text-[10px] text-stone-500 mt-1">Uncertainty: {metrics.prediction_uncertainty}%</div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="text-[10px] font-mono font-bold text-stone-500 uppercase">5. Visual Concordance</div>
            <div className="text-2xl font-black text-[#1b4332] mt-1">{metrics.visual_agreement}%</div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#d4a373] h-full" style={{ width: `${metrics.visual_agreement}%` }}></div>
            </div>
            <div className="text-[10px] text-stone-500 mt-1">Camera Texture Alignment</div>
          </div>

        </div>

        {/* Rapid Adulteration & Mineral Screening Status */}
        {data.nutritional_analysis?.sand_silica_screening && (
          <div className="pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
              <div>
                <span className="font-bold text-stone-800 block text-sm">Sand / Silica (Acid-Insoluble Ash)</span>
                <span className="text-xs text-stone-500 mt-0.5 block">
                  Estimated AIA: <b>{data.nutritional_analysis.sand_silica_screening.estimated_aia_pct}%</b>
                </span>
              </div>
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                data.nutritional_analysis.sand_silica_screening.badge_color === "EMERALD"
                  ? "bg-emerald-100 text-emerald-800"
                  : data.nutritional_analysis.sand_silica_screening.badge_color === "AMBER"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-rose-100 text-rose-800 animate-pulse"
              }`}>
                {data.nutritional_analysis.sand_silica_screening.risk_label}
              </span>
            </div>

            {data.nutritional_analysis.mineral_balance && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
                <div>
                  <span className="font-bold text-stone-800 block text-sm">Mineral Ratio (Ca:P Balance)</span>
                  <span className="text-xs text-stone-500 mt-0.5 block">
                    Ratio: <b>{data.nutritional_analysis.mineral_balance.ca_to_p_ratio} : 1</b> (Target: 1.5 - 2.0)
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                  data.nutritional_analysis.mineral_balance.badge_color === "EMERALD"
                    ? "bg-emerald-100 text-emerald-800"
                    : data.nutritional_analysis.mineral_balance.badge_color === "BLUE"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-rose-100 text-rose-800"
                }`}>
                  {data.nutritional_analysis.mineral_balance.status_label}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* EXPLAIN THIS MODAL */}
      {showExplainModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative">
            
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center space-x-2 text-[#1b4332]">
                <HelpCircle className="w-5 h-5 text-[#52b788]" />
                <h3 className="text-lg font-black">Evidence Engine Explanation</h3>
              </div>
              <button
                onClick={() => setShowExplainModal(false)}
                className="text-stone-400 hover:text-stone-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs text-stone-700 leading-relaxed">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 font-medium">
                <strong className="text-stone-900 block mb-1">Why did the Evidence Engine evaluate this sample?</strong>
                FeedSure 360 uses multi-source chemometric checks to prevent uncalibrated data from entering your dairy ration. The system evaluates baseline noise, Mahalanobis domain distances, and 5-point core consistency.
              </div>

              <div>
                <strong className="text-stone-900 block mb-1">Recommended Action:</strong>
                <p className="p-3.5 rounded-xl bg-stone-100 font-semibold text-stone-800">
                  {recommendation}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setShowExplainModal(false)}
                className="px-6 py-2.5 rounded-xl bg-[#1b4332] text-white font-bold text-xs hover:bg-[#2d6a4f] transition cursor-pointer"
              >
                Understood
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
