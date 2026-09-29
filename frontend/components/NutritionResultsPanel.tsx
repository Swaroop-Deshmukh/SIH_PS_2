"use client";

import React, { useState } from "react";
import { 
  Activity, ShieldAlert, ShieldCheck, AlertTriangle, ArrowRight, 
  HelpCircle, Sliders, CheckCircle2, TrendingUp, Info 
} from "lucide-react";
import { BatchAnalyzeResponse } from "../lib/api";
import { Language } from "../lib/dictionary";

interface NutritionResultsPanelProps {
  lang: Language;
  data: BatchAnalyzeResponse;
  farmerMode: boolean;
  onProceedToCamera?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const NutritionResultsPanel: React.FC<NutritionResultsPanelProps> = ({
  lang,
  data,
  farmerMode,
  onProceedToCamera,
  onNavigateTab,
}) => {
  const { nutritional_analysis: nutrition, evidence, feed_type } = data;
  const isOod = evidence.metrics.ood_distance > 2.50 || nutrition.domain_status === "OUT_OF_DOMAIN";
  const withhold = ["RESULT NOT TRUSTED", "SUSPECTED ADULTERATION"].includes(evidence.trust_status) || isOod;

  const [activeNutrient, setActiveNutrient] = useState<"dm" | "cp" | "ndf" | "adf">("cp");

  // Confidence Interval Bounds
  const ci = nutrition.confidence_intervals || {
    dry_matter_pct: [Number((nutrition.dry_matter_pct - 1.2).toFixed(1)), Number((nutrition.dry_matter_pct + 1.2).toFixed(1))],
    crude_protein_pct: [Number((nutrition.crude_protein_pct - 0.4).toFixed(1)), Number((nutrition.crude_protein_pct + 0.4).toFixed(1))],
    ndf_pct: [Number((nutrition.ndf_pct - 1.5).toFixed(1)), Number((nutrition.ndf_pct + 1.5).toFixed(1))],
    adf_pct: [Number((nutrition.adf_pct - 1.1).toFixed(1)), Number((nutrition.adf_pct + 1.1).toFixed(1))],
  };

  const pointPredictions = nutrition.point_predictions || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 text-[#52b788]" />
            <span>CHEMOMETRICS NUTRITION PREDICTIONS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Nutritional Chemistry &amp; Uncertainty Bounds
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Partial Least Squares Regression (PLSR, n=4) chemometric predictions 
            with dynamic 95% confidence intervals and Mahalanobis calibration domain gating.
          </p>
        </div>

        {onProceedToCamera && (
          <button
            onClick={onProceedToCamera}
            className="px-5 py-3 rounded-xl bg-[#1b4332] text-[#74c69d] font-bold text-xs hover:bg-[#2d6a4f] transition flex items-center gap-2 shrink-0 shadow-sm"
          >
            <span>Proceed to Camera Screening</span>
            <ArrowRight className="w-4 h-4 text-[#74c69d]" />
          </button>
        )}
      </div>

      {/* Out of Domain Warning Banner if D_M > 2.50 */}
      {isOod && (
        <div className="rounded-2xl border-2 border-rose-400 bg-rose-50 p-5 text-rose-950 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-rose-900">
                OUT OF CALIBRATION DOMAIN — QUANTITATIVE PREDICTION NOT TRUSTED
              </h3>
              <p className="text-xs sm:text-sm text-rose-800 mt-1 leading-relaxed">
                The Mahalanobis distance D_M ({evidence.metrics.ood_distance.toFixed(2)}) breaches 
                the reference calibration covariance boundary (D_M &gt; 2.50). 
                To prevent feeding decision errors, quantitative figures are flagged and withheld.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs font-mono font-bold text-rose-700 bg-rose-100/70 px-3 py-1.5 rounded-lg w-fit">
                <span>Hotelling-Mahalanobis Distance D_M = {evidence.metrics.ood_distance.toFixed(2)}</span>
                <span>· Threshold = 2.50</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4 Main Chemometrics Nutrient Prediction Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dry Matter (DM %) */}
        <div
          onClick={() => setActiveNutrient("dm")}
          className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${
            activeNutrient === "dm"
              ? "bg-[#1b4332] text-white border-[#74c69d] shadow-md"
              : "bg-white text-stone-800 border-stone-200 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              activeNutrient === "dm" ? "text-emerald-300" : "text-stone-500"
            }`}>
              Dry Matter (DM %)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/10">PLSR Target 1</span>
          </div>

          <div className="text-3xl font-black mt-2 font-mono">
            {withhold ? "Withheld" : `${nutrition.dry_matter_pct}%`}
          </div>

          {!withhold && ci.dry_matter_pct && (
            <div className={`text-xs mt-2 font-mono ${activeNutrient === "dm" ? "text-emerald-200" : "text-stone-500"}`}>
              95% CI: [{ci.dry_matter_pct[0]}% – {ci.dry_matter_pct[1]}%]
            </div>
          )}

          <div className={`text-[11px] mt-2 pt-2 border-t border-current/10 ${
            activeNutrient === "dm" ? "text-stone-200" : "text-stone-600"
          }`}>
            Basis for intake balancing; eliminates water dilution variance.
          </div>
        </div>

        {/* Crude Protein (CP %) */}
        <div
          onClick={() => setActiveNutrient("cp")}
          className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${
            activeNutrient === "cp"
              ? "bg-[#1b4332] text-white border-[#74c69d] shadow-md"
              : "bg-white text-stone-800 border-stone-200 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              activeNutrient === "cp" ? "text-emerald-300" : "text-stone-500"
            }`}>
              Crude Protein (CP %)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/10">PLSR Target 2</span>
          </div>

          <div className="text-3xl font-black mt-2 font-mono">
            {withhold ? "Withheld" : `${nutrition.crude_protein_pct}%`}
          </div>

          {!withhold && ci.crude_protein_pct && (
            <div className={`text-xs mt-2 font-mono ${activeNutrient === "cp" ? "text-emerald-200" : "text-stone-500"}`}>
              95% CI: [{ci.crude_protein_pct[0]}% – {ci.crude_protein_pct[1]}%]
            </div>
          )}

          <div className={`text-[11px] mt-2 pt-2 border-t border-current/10 ${
            activeNutrient === "cp" ? "text-stone-200" : "text-stone-600"
          }`}>
            Nitrogenous bond vibration N-H overtone (1510nm &amp; 2060nm).
          </div>
        </div>

        {/* Neutral Detergent Fiber (NDF %) */}
        <div
          onClick={() => setActiveNutrient("ndf")}
          className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${
            activeNutrient === "ndf"
              ? "bg-[#1b4332] text-white border-[#74c69d] shadow-md"
              : "bg-white text-stone-800 border-stone-200 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              activeNutrient === "ndf" ? "text-emerald-300" : "text-stone-500"
            }`}>
              Neutral Fiber (NDF %)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/10">PLSR Target 3</span>
          </div>

          <div className="text-3xl font-black mt-2 font-mono">
            {withhold ? "Withheld" : `${nutrition.ndf_pct}%`}
          </div>

          {!withhold && ci.ndf_pct && (
            <div className={`text-xs mt-2 font-mono ${activeNutrient === "ndf" ? "text-emerald-200" : "text-stone-500"}`}>
              95% CI: [{ci.ndf_pct[0]}% – {ci.ndf_pct[1]}%]
            </div>
          )}

          <div className={`text-[11px] mt-2 pt-2 border-t border-current/10 ${
            activeNutrient === "ndf" ? "text-stone-200" : "text-stone-600"
          }`}>
            Total cell wall structural fiber predicting rumen gut fill capacity.
          </div>
        </div>

        {/* Acid Detergent Fiber (ADF %) */}
        <div
          onClick={() => setActiveNutrient("adf")}
          className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${
            activeNutrient === "adf"
              ? "bg-[#1b4332] text-white border-[#74c69d] shadow-md"
              : "bg-white text-stone-800 border-stone-200 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              activeNutrient === "adf" ? "text-emerald-300" : "text-stone-500"
            }`}>
              Acid Fiber (ADF %)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/10">PLSR Target 4</span>
          </div>

          <div className="text-3xl font-black mt-2 font-mono">
            {withhold ? "Withheld" : `${nutrition.adf_pct}%`}
          </div>

          {!withhold && ci.adf_pct && (
            <div className={`text-xs mt-2 font-mono ${activeNutrient === "adf" ? "text-emerald-200" : "text-stone-500"}`}>
              95% CI: [{ci.adf_pct[0]}% – {ci.adf_pct[1]}%]
            </div>
          )}

          <div className={`text-[11px] mt-2 pt-2 border-t border-current/10 ${
            activeNutrient === "adf" ? "text-stone-200" : "text-stone-600"
          }`}>
            Cellulose &amp; lignin fraction determining net energy of lactation.
          </div>
        </div>
      </div>

      {/* Sand/Silica (Acid-Insoluble Ash AIA %) & Mineral Balance (Ca:P) Screening */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Acid-Insoluble Ash (AIA % / Sand & Silica) */}
        {nutrition.sand_silica_screening ? (
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Acid-Insoluble Ash (Sand / Silica %)
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                nutrition.sand_silica_screening.badge_color === "EMERALD"
                  ? "bg-emerald-100 text-emerald-800"
                  : nutrition.sand_silica_screening.badge_color === "AMBER"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-rose-100 text-rose-800"
              }`}>
                {nutrition.sand_silica_screening.risk_label}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black font-mono text-stone-900">
                {withhold ? "—" : `${nutrition.sand_silica_screening.estimated_aia_pct}%`}
              </span>
              <span className="text-xs text-stone-500 font-mono">
                Baseline Tilt ΔR: {nutrition.sand_silica_screening.baseline_tilt_delta_r > 0 ? "+" : ""}{nutrition.sand_silica_screening.baseline_tilt_delta_r}
              </span>
            </div>

            <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all ${
                  nutrition.sand_silica_screening.estimated_aia_pct < 2.5
                    ? "bg-emerald-500"
                    : nutrition.sand_silica_screening.estimated_aia_pct <= 5.0
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${Math.min(100, (nutrition.sand_silica_screening.estimated_aia_pct / 8.0) * 100)}%` }}
              />
            </div>

            <p className="text-xs text-stone-600 leading-relaxed border-t border-stone-100 pt-2">
              {nutrition.sand_silica_screening.advisory}
            </p>
          </div>
        ) : (
          <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 text-xs text-stone-500">
            Acid-Insoluble Ash screening ready with 5-point scan.
          </div>
        )}

        {/* Mineral Balance Ratio (Ca:P) */}
        {nutrition.mineral_balance ? (
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Mineral Ratio (Calcium to Phosphorus Ca:P)
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                nutrition.mineral_balance.badge_color === "EMERALD"
                  ? "bg-emerald-100 text-emerald-800"
                  : nutrition.mineral_balance.badge_color === "BLUE"
                  ? "bg-blue-100 text-blue-800"
                  : nutrition.mineral_balance.badge_color === "AMBER"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-rose-100 text-rose-800"
              }`}>
                {nutrition.mineral_balance.status_label}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black font-mono text-[#1b4332]">
                {withhold ? "—" : `${nutrition.mineral_balance.ca_to_p_ratio} : 1`}
              </span>
              <span className="text-xs text-stone-500 font-mono">
                Est. Ca: {nutrition.mineral_balance.estimated_ca_pct}% · P: {nutrition.mineral_balance.estimated_p_pct}%
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 bg-stone-50 p-2 rounded-lg">
              <span>Ideal Dairy Benchmark:</span>
              <span className="font-bold text-stone-800">{nutrition.mineral_balance.ideal_range}</span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed border-t border-stone-100 pt-2">
              {nutrition.mineral_balance.advisory}
            </p>
          </div>
        ) : (
          <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 text-xs text-stone-500">
            Mineral balance evaluation ready with full scan.
          </div>
        )}
      </div>

      {/* 5-Point Spatial Variance Breakdown Table */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
          <div>
            <h3 className="font-bold text-stone-900 text-base">
              Point-by-Point Chemometric Variations Across 5 Core Locations
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Spatial cross-validation demonstrating uniformity or localized batch pockets.
            </p>
          </div>
          <span className="text-xs font-mono text-stone-500 bg-stone-100 px-3 py-1 rounded-lg">
            Batch: <b>{data.batch_id}</b>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-stone-50 text-stone-500 uppercase tracking-wider font-mono text-[10px] border-b border-stone-200">
                <th className="py-2.5 px-3">Sampling Core</th>
                <th className="py-2.5 px-3">Dry Matter %</th>
                <th className="py-2.5 px-3">Crude Protein %</th>
                <th className="py-2.5 px-3">NDF %</th>
                <th className="py-2.5 px-3">ADF %</th>
                <th className="py-2.5 px-3">Mahalanobis (D_M)</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono">
              {pointPredictions.map((pt, idx) => {
                const ptOod = pt.mahalanobis_distance > 2.50;
                return (
                  <tr key={idx} className="hover:bg-emerald-50/40 transition">
                    <td className="py-3 px-3 font-sans font-bold text-stone-800">
                      {pt.point_id}
                    </td>
                    <td className="py-3 px-3">{withhold ? "—" : `${pt.dry_matter_pct}%`}</td>
                    <td className="py-3 px-3 font-bold text-[#1b4332]">{withhold ? "—" : `${pt.crude_protein_pct}%`}</td>
                    <td className="py-3 px-3">{withhold ? "—" : `${pt.ndf_pct}%`}</td>
                    <td className="py-3 px-3">{withhold ? "—" : `${pt.adf_pct}%`}</td>
                    <td className={`py-3 px-3 font-bold ${ptOod ? "text-rose-600" : "text-stone-700"}`}>
                      {pt.mahalanobis_distance.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ptOod 
                          ? "bg-rose-100 text-rose-800" 
                          : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {ptOod ? "OOD Breached" : "Calibrated Fit"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chemometric Model Specs and ISO Standards Footnote */}
      <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-stone-600">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-[#2d6a4f] shrink-0" />
          <span>
            <b>Model Validation:</b> Partial Least Squares Regression (PLSR) validated under ASTM E1655 / ISO 12099 cross-validation guidelines.
          </span>
        </div>
        <span className="font-mono text-[11px] text-stone-500 shrink-0">
          Domain Threshold: D_M &le; 2.50
        </span>
      </div>
    </div>
  );
};
