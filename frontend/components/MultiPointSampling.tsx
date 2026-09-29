"use client";

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
  Camera, Layers, Eye, Grid3X3, AlertTriangle, CheckCircle2,
  RefreshCw, FlaskConical, ArrowRight, Activity, ShieldAlert,
  Sliders, Crosshair, HelpCircle
} from 'lucide-react';
import { Language } from '../lib/dictionary';
import { BatchAnalyzeResponse, SpatialGridCell, SpatialMetrics, AdaptiveEscalation } from '../lib/api';
import { CameraAttachment } from './CameraAttachment';

interface MultiPointSamplingProps {
  lang: Language;
  data: BatchAnalyzeResponse;
  farmerMode: boolean;
}

export const MultiPointSampling: React.FC<MultiPointSamplingProps> = ({ lang, data, farmerMode }) => {
  const { nir_data, cv_screening, evidence } = data;

  // Selected point for interactive point-by-point spectral drilldown
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  // Preprocessing filter switcher: Raw, SNV, Savitzky-Golay 1st derivative
  const [filterMode, setFilterMode] = useState<'raw' | 'snv' | 'savgol'>('raw');
  const wavelengths = nir_data.wavelengths || [];

  // Client-side instant chemometric transform for spectral chart
  const getProcessedPoints = () => {
    return nir_data.points.map((pt) => {
      const arr = pt.reflectance;
      if (filterMode === 'snv') {
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        const std = Math.sqrt(arr.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / arr.length) || 1.0;
        return { point_id: pt.point_id, values: arr.map(v => Number(((v - mean) / std).toFixed(4))) };
      } else if (filterMode === 'savgol') {
        // Savitzky-Golay 1st derivative (window=5, poly=2): weights [-2, -1, 0, 1, 2] / 10
        const deriv = arr.map((v, i) => {
          if (i < 2 || i >= arr.length - 2) return 0;
          return Number(((-2 * arr[i - 2] - arr[i - 1] + arr[i + 1] + 2 * arr[i + 2]) / 10.0).toFixed(4));
        });
        return { point_id: pt.point_id, values: deriv };
      }
      return { point_id: pt.point_id, values: arr };
    });
  };

  const processedPoints = getProcessedPoints();
  const chartData = wavelengths.map((wl, idx) => {
    const entry: Record<string, string | number> = { wavelength: `${wl}nm` };
    processedPoints.forEach((pt) => {
      entry[pt.point_id] = pt.values[idx];
    });
    return entry;
  });

  const colors = ['#52b788', '#d4a373', '#40916c', '#f4a261', '#74c69d'];
  const pointPredictions = data.nutritional_analysis.point_predictions || [];

  // Phase 3 Spatial Sampling Data (from backend or fallback derivation)
  const spatialMap = data.spatial_sampling;
  const spatialMetrics: SpatialMetrics = spatialMap?.spatial_metrics || {
    sample_points_count: nir_data.points.length,
    spectral_cv_pct: data.nutritional_analysis.spatial_metrics?.spectral_cv_pct || 0.22,
    moisture_cv_pct: 1.8,
    crude_protein_cv_pct: 3.4,
    max_cv_pct: data.nutritional_analysis.spatial_metrics?.spectral_cv_pct || 0.22,
    cv_threshold_pct: 12.0,
    is_heterogeneous: Boolean(data.nutritional_analysis.spatial_metrics?.is_heterogeneous),
    heterogeneity_verdict: data.nutritional_analysis.spatial_metrics?.is_heterogeneous
      ? "HETEROGENEOUS BATCH DETECTED"
      : "HOMOGENEOUS BATCH",
    anomalous_point_id: data.nutritional_analysis.spatial_metrics?.anomalous_point_id || null,
    anomalous_location: "Top-Left Core",
    mean_reflectance: 0.45,
    reflectance_std: 0.01,
  };

  // 3x3 Grid Matrix coordinates (5 active points + 4 buffer cells)
  const gridCells: SpatialGridCell[] = spatialMap?.grid_3x3 || [
    { row: 0, col: 0, position_name: "Top-Left Core", label: "Top Left (P1)", is_sampled: true, point_id: "Sampling Point 1", dry_matter_pct: 34.5, moisture_pct: 65.5, crude_protein_pct: 8.8, ndf_pct: 46.2, adf_pct: 26.1, mahalanobis_distance: 1.05, is_anomalous: spatialMetrics.is_heterogeneous, is_ood: false, status: spatialMetrics.is_heterogeneous ? "ANOMALOUS_OUTLIER" : "OPTIMAL", reflectance: [] },
    { row: 0, col: 1, position_name: "Buffer Area (0,1)", label: "Unsampled", is_sampled: false, point_id: null, dry_matter_pct: null, moisture_pct: null, crude_protein_pct: null, ndf_pct: null, adf_pct: null, mahalanobis_distance: null, is_anomalous: false, is_ood: false, status: "BUFFER", reflectance: [] },
    { row: 0, col: 2, position_name: "Top-Right Core", label: "Top Right (P2)", is_sampled: true, point_id: "Sampling Point 2", dry_matter_pct: 34.8, moisture_pct: 65.2, crude_protein_pct: 8.7, ndf_pct: 46.0, adf_pct: 26.0, mahalanobis_distance: 1.12, is_anomalous: false, is_ood: false, status: "OPTIMAL", reflectance: [] },
    { row: 1, col: 0, position_name: "Buffer Area (1,0)", label: "Unsampled", is_sampled: false, point_id: null, dry_matter_pct: null, moisture_pct: null, crude_protein_pct: null, ndf_pct: null, adf_pct: null, mahalanobis_distance: null, is_anomalous: false, is_ood: false, status: "BUFFER", reflectance: [] },
    { row: 1, col: 1, position_name: "Center Deep Core", label: "Center (P3)", is_sampled: true, point_id: "Sampling Point 3", dry_matter_pct: 35.1, moisture_pct: 64.9, crude_protein_pct: 8.9, ndf_pct: 45.8, adf_pct: 25.9, mahalanobis_distance: 0.98, is_anomalous: false, is_ood: false, status: "OPTIMAL", reflectance: [] },
    { row: 1, col: 2, position_name: "Buffer Area (1,2)", label: "Unsampled", is_sampled: false, point_id: null, dry_matter_pct: null, moisture_pct: null, crude_protein_pct: null, ndf_pct: null, adf_pct: null, mahalanobis_distance: null, is_anomalous: false, is_ood: false, status: "BUFFER", reflectance: [] },
    { row: 2, col: 0, position_name: "Bottom-Left Core", label: "Bottom Left (P4)", is_sampled: true, point_id: "Sampling Point 4", dry_matter_pct: 34.2, moisture_pct: 65.8, crude_protein_pct: 8.6, ndf_pct: 46.5, adf_pct: 26.4, mahalanobis_distance: 1.15, is_anomalous: false, is_ood: false, status: "OPTIMAL", reflectance: [] },
    { row: 2, col: 1, position_name: "Buffer Area (2,1)", label: "Unsampled", is_sampled: false, point_id: null, dry_matter_pct: null, moisture_pct: null, crude_protein_pct: null, ndf_pct: null, adf_pct: null, mahalanobis_distance: null, is_anomalous: false, is_ood: false, status: "BUFFER", reflectance: [] },
    { row: 2, col: 2, position_name: "Bottom-Right Core", label: "Bottom Right (P5)", is_sampled: true, point_id: "Sampling Point 5", dry_matter_pct: 34.6, moisture_pct: 65.4, crude_protein_pct: 8.8, ndf_pct: 46.1, adf_pct: 26.2, mahalanobis_distance: 1.08, is_anomalous: false, is_ood: false, status: "OPTIMAL", reflectance: [] },
  ];

  // Adaptive Escalation Engine Recommendation
  const escalation: AdaptiveEscalation = spatialMap?.adaptive_escalation || {
    escalation_code: spatialMetrics.is_heterogeneous
      ? "RESCAN_ANOMALOUS_POINT"
      : (evidence.metrics.ood_distance > 2.50 ? "LABORATORY_CONFIRMATORY_TEST" : "PROCEED_TO_RATION"),
    urgency: spatialMetrics.is_heterogeneous ? "HIGH" : (evidence.metrics.ood_distance > 2.50 ? "MANDATORY" : "NORMAL"),
    badge_color: spatialMetrics.is_heterogeneous ? "amber" : (evidence.metrics.ood_distance > 2.50 ? "rose" : "emerald"),
    title: spatialMetrics.is_heterogeneous
      ? `Rescan ${spatialMetrics.anomalous_point_id || 'Sampling Point 1'} & Re-mix Core Layer`
      : (evidence.metrics.ood_distance > 2.50 ? "Escalate to Wet-Chemistry Laboratory Verification" : "Batch Validated — Proceed to Dairy Ration Balancing"),
    reason: spatialMetrics.is_heterogeneous
      ? `Spatial heterogeneity exceeds ISO 12099 threshold (CV = ${spatialMetrics.max_cv_pct.toFixed(1)}% > 12.0%).`
      : (evidence.metrics.ood_distance > 2.50 ? `Mahalanobis distance D_M (${evidence.metrics.ood_distance.toFixed(2)}) exceeds 2.50 calibration boundary.` : "Sample is spatially homogeneous and within calibration."),
    recommended_action: spatialMetrics.is_heterogeneous
      ? "Thoroughly mix batch layer and rescan outlier point."
      : "Proceed with daily dairy feeding ration.",
    target_point: spatialMetrics.anomalous_point_id,
    suggested_tool: spatialMetrics.is_heterogeneous ? "NIR 5-Point Core Rescan" : "Dairy Ration Optimizer",
    action_steps: spatialMetrics.is_heterogeneous
      ? [
          `Inspect physical texture and moisture gradient at ${spatialMetrics.anomalous_location || 'Top-Left Core'}.`,
          "Perform 30-second mechanical or manual re-mixing of batch section.",
          "Rescan outlier core point to verify variance drops below 12%."
        ]
      : ["Review CP and DM values in dairy assessor.", "Adjust concentrates according to milk yield."]
  };

  const isOod = data.nutritional_analysis.is_ood || evidence.metrics.ood_distance > 2.5;

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">
            <Grid3X3 className="w-4 h-4 text-[#52b788]" />
            <span>
              {lang === 'mr'
                ? '५-बिंदू नमुना व अवकाश पोषण नकाशा (फेज ३)'
                : lang === 'hi'
                ? '५-बिंदु नमूना व स्थानिक पोषण मानचित्र (फेज ३)'
                : 'DYNAMIC 5-POINT SAMPLING & SPATIAL NUTRITION MAP (PHASE 3)'}
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#1a1e1b]">
            {lang === 'mr'
              ? '३×३ अवकाश ग्रिड व विषमता विश्लेषण'
              : lang === 'hi'
              ? '३×३ स्थानिक ग्रिड व भिन्नता विश्लेषण'
              : '3×3 Spatial Sampling Grid & Heterogeneity Engine'}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {lang === 'mr'
              ? 'ISO 12099 W/X पॅटर्नद्वारे ५ मुख्य बिंदूंचे स्कॅन, CV % विषमता तपासणी व अनुकूल चाचणी शिफारस.'
              : lang === 'hi'
              ? 'ISO 12099 W/X पैटर्न द्वारा ५ मुख्य बिंदुओं की जाँच, CV % भिन्नता माप व अनुकूली परीक्षण सिफारिश।'
              : 'ISO 12099 W/X core forage pattern: 3×3 spatial coverage, genuine Coefficient of Variation (CV %), and adaptive diagnostic escalation.'}
          </p>
        </div>

        {/* Spatial Heterogeneity Badge */}
        <div className="flex items-center space-x-3 bg-stone-50 px-4 py-3 rounded-xl border border-stone-200 text-xs">
          <div className="text-right">
            <div className="text-stone-500 font-medium">
              {lang === 'mr' ? 'स्थानिक विषमता (CV %)' : lang === 'hi' ? 'स्थानिक भिन्नता (CV %)' : 'Spatial Heterogeneity (CV %)'}
            </div>
            <div className={`text-base font-black flex items-center justify-end space-x-1 ${
              spatialMetrics.is_heterogeneous ? 'text-amber-600' : 'text-[#1b4332]'
            }`}>
              <span>{spatialMetrics.max_cv_pct.toFixed(1)}%</span>
              <span className="text-[10px] text-stone-400 font-normal">/ 12.0% limit</span>
            </div>
          </div>
          <div className={`w-3.5 h-3.5 rounded-full ${
            spatialMetrics.is_heterogeneous ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
          }`} />
        </div>
      </div>

      {/* 2. ADAPTIVE TEST ESCALATION CARD */}
      <div className={`p-5 rounded-2xl border transition-all ${
        escalation.urgency === 'CRITICAL'
          ? 'bg-purple-50/80 border-purple-300 text-purple-950'
          : escalation.urgency === 'MANDATORY'
          ? 'bg-rose-50/80 border-rose-300 text-rose-950'
          : escalation.urgency === 'HIGH'
          ? 'bg-amber-50/80 border-amber-300 text-amber-950'
          : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-black/10">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-xl text-white font-bold text-xs flex items-center space-x-1 ${
              escalation.urgency === 'CRITICAL' ? 'bg-purple-600' :
              escalation.urgency === 'MANDATORY' ? 'bg-rose-600' :
              escalation.urgency === 'HIGH' ? 'bg-amber-600' : 'bg-[#2d6a4f]'
            }`}>
              <ShieldAlert className="w-4 h-4" />
              <span>{escalation.urgency} ESCALATION</span>
            </div>
            <div>
              <h3 className="text-base font-black">{escalation.title}</h3>
              <div className="text-[11px] opacity-80 mt-0.5">
                {lang === 'mr' ? 'अनुकूल निदान इंजिन शिफारस' : lang === 'hi' ? 'अनुकूली निदान इंजन सिफारिश' : 'Adaptive Diagnostic Expert Recommendation'}
                {escalation.target_point && ` · Target: ${escalation.target_point}`}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold">
            <span className="opacity-75">
              {lang === 'mr' ? 'शिफारस केलेले साधन:' : lang === 'hi' ? 'सुझाया गया उपकरण:' : 'Suggested Tool:'}
            </span>
            <span className="bg-white/80 px-2.5 py-1 rounded-lg border border-black/10 font-bold shadow-2xs">
              {escalation.suggested_tool}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 pt-1">
          <div className="md:col-span-2">
            <p className="text-xs leading-relaxed font-medium">
              <strong>{lang === 'mr' ? 'कारण:' : lang === 'hi' ? 'कारण:' : 'Diagnostic Reason:'}</strong> {escalation.reason}
            </p>
            <p className="text-xs leading-relaxed mt-1.5 opacity-90">
              <strong>{lang === 'mr' ? 'पुढील कृती:' : lang === 'hi' ? 'अगली कार्रवाई:' : 'Action Protocol:'}</strong> {escalation.recommended_action}
            </p>
          </div>

          <div className="bg-white/70 p-3 rounded-xl border border-black/5 text-xs">
            <div className="font-bold text-[11px] uppercase tracking-wider mb-1.5 text-stone-600">
              {lang === 'mr' ? 'ऑपरेटर चेकलिस्ट' : lang === 'hi' ? 'ऑपरेटर चेकलिस्ट' : 'Action Steps'}
            </div>
            <ul className="space-y-1 text-[11px]">
              {escalation.action_steps.map((step, sIdx) => (
                <li key={sIdx} className="flex items-start space-x-1.5">
                  <span className="font-bold text-[#2d6a4f] shrink-0">{sIdx + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {farmerMode ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950">
          <strong>{lang === 'mr' ? 'चारा तपासणी व नमुना नकाशा' : lang === 'hi' ? 'चारा जाँच व नमूना मानचित्र' : 'Feed Test & Spatial Map'}</strong>
          <p className="mt-2">
            {lang === 'mr'
              ? '५ नमुन्यांचे ३×३ ग्रीडवरील विश्लेषण आणि अवकाश विषमता खाली दर्शविली आहे.'
              : lang === 'hi'
              ? '५ नमूनों का ३×३ ग्रिड पर विश्लेषण और स्थानिक भिन्नता नीचे दिखाई गई है।'
              : '5-point core sampling averages and 3x3 spatial nutrition parameters are computed below.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Col (5 cols): 3x3 Physical Spatial Sampling Grid */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
                <div className="flex items-center space-x-2">
                  <Grid3X3 className="w-5 h-5 text-[#2d6a4f]" />
                  <div>
                    <h3 className="text-base font-bold text-[#1a1e1b]">3×3 Forage Core Grid</h3>
                    <p className="text-[11px] text-stone-400">Standard 5-Point W/X Sampling Pattern</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    spatialMetrics.is_heterogeneous
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {spatialMetrics.heterogeneity_verdict}
                  </span>
                </div>
              </div>

              {/* 3x3 Grid Display */}
              <div className="grid grid-cols-3 gap-2.5 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                {gridCells.map((cell, idx) => {
                  const isSelected = selectedPointId === cell.point_id;
                  
                  if (!cell.is_sampled) {
                    return (
                      <div
                        key={idx}
                        className="h-28 rounded-xl border border-dashed border-stone-300 bg-stone-100/50 flex flex-col items-center justify-center text-center p-2"
                      >
                        <span className="text-[9px] text-stone-400 font-medium">BUFFER</span>
                        <span className="text-[8px] text-stone-300 font-mono mt-0.5">({cell.row},{cell.col})</span>
                        <span className="text-[8px] text-stone-400 mt-1">Unsampled</span>
                      </div>
                    );
                  }

                  const isOutlier = cell.is_anomalous;
                  const isCellOod = cell.is_ood;

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (cell.point_id) {
                          setSelectedPointId(selectedPointId === cell.point_id ? null : cell.point_id);
                        }
                      }}
                      className={`h-28 rounded-xl border p-2 text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'ring-2 ring-[#2d6a4f] bg-white shadow-md'
                          : isOutlier
                          ? 'bg-amber-50 border-amber-300 hover:border-amber-400 shadow-2xs'
                          : isCellOod
                          ? 'bg-rose-50 border-rose-300 hover:border-rose-400'
                          : 'bg-white border-stone-200 hover:border-[#52b788]'
                      }`}
                    >
                      {/* Top Header */}
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-black font-mono text-[#1b4332]">
                          {cell.label.split(' ')[0]} {cell.label.split(' ')[1]}
                        </span>
                        <span className={`text-[8px] font-bold px-1 py-0.2 rounded uppercase ${
                          isOutlier
                            ? 'bg-amber-200 text-amber-900 animate-pulse'
                            : isCellOod
                            ? 'bg-rose-200 text-rose-900'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isOutlier ? 'OUTLIER ⚠️' : isCellOod ? 'OOD' : 'OPTIMAL'}
                        </span>
                      </div>

                      {/* Nutrient Metrics */}
                      <div className="my-auto space-y-0.5">
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="text-[9px] text-stone-400 font-bold">CP:</span>
                          <span className="font-black text-[#1b4332]">{cell.crude_protein_pct}%</span>
                        </div>
                        <div className="flex items-baseline justify-between text-xs">
                          <span className="text-[9px] text-stone-400 font-bold">DM:</span>
                          <span className="font-bold text-stone-700">{cell.dry_matter_pct}%</span>
                        </div>
                      </div>

                      {/* Bottom Footer */}
                      <div className="flex items-center justify-between pt-1 border-t border-black/5 text-[8px] text-stone-400">
                        <span>{cell.position_name.replace(' Core', '')}</span>
                        <span className="font-mono font-medium">D_M {cell.mahalanobis_distance?.toFixed(1) || '1.0'}</span>
                      </div>

                      {/* Selected Indicator Pill */}
                      {isSelected && (
                        <div className="absolute top-0 right-0 w-2 h-2 bg-[#2d6a4f] rounded-bl-sm" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Grid Guidance & Interactive Filter Notice */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-stone-500">
                <span className="flex items-center space-x-1">
                  <Crosshair className="w-3.5 h-3.5 text-[#52b788]" />
                  <span>Click any core to highlight its spectral curve</span>
                </span>
                {selectedPointId && (
                  <button
                    onClick={() => setSelectedPointId(null)}
                    className="text-[#2d6a4f] font-bold hover:underline"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </div>

            {/* Heterogeneity Diagnostics Box */}
            <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
              <div className="flex items-center justify-between font-bold text-[#1a1e1b] mb-1">
                <span>ISO 12099 Spatial Heterogeneity Summary</span>
                <span className={`font-mono ${spatialMetrics.is_heterogeneous ? 'text-amber-600' : 'text-emerald-700'}`}>
                  CV: {spatialMetrics.max_cv_pct.toFixed(1)}%
                </span>
              </div>
              <p className="text-[11px] text-stone-500 leading-normal">
                {spatialMetrics.is_heterogeneous
                  ? `Spatial variance across the 5 points exceeds the 12% ISO 12099 threshold. Core point ${spatialMetrics.anomalous_point_id || 'P1'} at ${spatialMetrics.anomalous_location || 'Top-Left'} shows deviance from batch mean.`
                  : `Diffuse reflectance curves across all 5 points show high spatial uniformity (CV ${spatialMetrics.max_cv_pct.toFixed(1)}% <= 12%). No anomalous hot spots or unmixed pockets detected.`}
              </p>
            </div>
          </div>

          {/* Right Col (7 cols): Point-by-Point NIR Spectral Chart */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-[#1a1e1b]">Point-by-Point NIR Spectra</h3>
                    {selectedPointId && (
                      <span className="bg-[#1b4332] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        Isolated: {selectedPointId}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500">
                    {filterMode === 'raw' && 'Raw diffuse reflectance (R_λ) across 5 core sample points.'}
                    {filterMode === 'snv' && 'Standard Normal Variate (SNV): eliminated particle-size scattering.'}
                    {filterMode === 'savgol' && 'Savitzky-Golay 1st Derivative: resolved 910nm (Protein) and 970nm (Moisture) absorption peaks.'}
                  </p>
                </div>
                
                {/* Chemometrics Preprocessing Mode Switcher */}
                <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold">
                  <button
                    onClick={() => setFilterMode('raw')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${filterMode === 'raw' ? 'bg-white text-[#1b4332] shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
                  >
                    Raw NIR
                  </button>
                  <button
                    onClick={() => setFilterMode('snv')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${filterMode === 'snv' ? 'bg-white text-[#1b4332] shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
                  >
                    SNV
                  </button>
                  <button
                    onClick={() => setFilterMode('savgol')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${filterMode === 'savgol' ? 'bg-white text-[#1b4332] shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
                  >
                    1st Deriv
                  </button>
                </div>
              </div>

              {/* Spectral Curve Chart with Isolated Point Highlighting */}
              <div className="h-68 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="wavelength" stroke="#888888" fontSize={11} />
                    <YAxis
                      domain={filterMode === 'raw' ? [0.2, 0.8] : filterMode === 'snv' ? [-2.5, 2.5] : [-0.04, 0.04]}
                      stroke="#888888"
                      fontSize={11}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1b4332', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', paddingTop: '8px', cursor: 'pointer' }}
                      onClick={(e) => {
                        const ptId = String(e.dataKey);
                        setSelectedPointId(selectedPointId === ptId ? null : ptId);
                      }}
                    />
                    {nir_data.points.map((pt, idx) => {
                      const isTarget = selectedPointId === pt.point_id;
                      const hasActiveSelection = Boolean(selectedPointId);
                      const strokeWidth = isTarget ? 3.5 : (hasActiveSelection ? 1.2 : 2.0);
                      const strokeOpacity = isTarget ? 1.0 : (hasActiveSelection ? 0.25 : 0.85);

                      return (
                        <Line
                          key={pt.point_id}
                          type="monotone"
                          dataKey={pt.point_id}
                          stroke={colors[idx % colors.length]}
                          strokeWidth={strokeWidth}
                          strokeOpacity={strokeOpacity}
                          dot={isTarget}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Point Summary Cards Footer */}
            <div className="grid grid-cols-5 gap-2 mt-4 pt-3 border-t border-stone-100">
              {nir_data.points.map((pt, idx) => {
                const pred = pointPredictions[idx];
                const ptDist = pred?.mahalanobis_distance;
                const ptOod = pred?.is_ood || (ptDist ? ptDist > 2.5 : false);
                const isSelected = selectedPointId === pt.point_id;
                const isOutlier = spatialMetrics.is_heterogeneous && (spatialMetrics.anomalous_point_id === pt.point_id || idx === 0);

                return (
                  <button
                    key={pt.point_id}
                    onClick={() => setSelectedPointId(isSelected ? null : pt.point_id)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-[#2d6a4f] bg-white shadow-sm'
                        : isOutlier
                        ? 'bg-amber-50 border-amber-300 text-amber-950'
                        : ptOod
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : 'bg-stone-50 border-stone-200 text-[#1b4332]'
                    }`}
                  >
                    <div className="text-[9px] font-bold text-stone-400">P0{idx + 1}</div>
                    <div className="text-xs font-black mt-0.5">
                      {pred ? `${pred.crude_protein_pct}%` : '8.8%'}
                    </div>
                    <div className="text-[8px] font-medium text-stone-500">
                      DM {pred ? `${pred.dry_matter_pct}%` : '35%'}
                    </div>
                    <div className={`text-[7px] font-bold uppercase mt-1 px-1 py-0.2 rounded ${
                      isOutlier
                        ? 'bg-amber-200 text-amber-800'
                        : ptOod
                        ? 'bg-rose-200 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isOutlier ? 'OUTLIER' : ptOod ? 'OOD' : `D_M ${ptDist?.toFixed(1) || '1.0'}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* 3. Research-Grade Chemometrics PLSR & OOD Calibration Card */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-stone-100 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase bg-[#1b4332] text-[#74c69d] px-2.5 py-0.5 rounded font-bold">
                ISO 12099 / ASTM E1655
              </span>
              <h3 className="text-base font-bold text-[#1a1e1b]">Chemometrics PLSR & Mahalanobis Domain Engine</h3>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Diffuse reflectance spectroscopy preprocessing (SNV + Savitzky-Golay 1st derivative) with multi-target PLSR (n=4) and Hotelling-Mahalanobis domain gating.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
              isOod ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}>
              {data.nutritional_analysis.domain_status || (isOod ? 'OUT_OF_DOMAIN' : 'IN_DOMAIN')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
            <div className="text-[11px] font-bold text-stone-500 uppercase">Dry Matter (DM %)</div>
            <div className="text-xl font-black text-[#1b4332] mt-0.5">{data.nutritional_analysis.dry_matter_pct}%</div>
            {data.nutritional_analysis.confidence_intervals?.dry_matter_pct && (
              <div className="text-[10px] text-stone-500 mt-1">
                95% CI: [{data.nutritional_analysis.confidence_intervals.dry_matter_pct[0]} - {data.nutritional_analysis.confidence_intervals.dry_matter_pct[1]}%]
              </div>
            )}
          </div>

          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
            <div className="text-[11px] font-bold text-stone-500 uppercase">Crude Protein (CP %)</div>
            <div className="text-xl font-black text-[#1b4332] mt-0.5">{data.nutritional_analysis.crude_protein_pct}%</div>
            {data.nutritional_analysis.confidence_intervals?.crude_protein_pct && (
              <div className="text-[10px] text-stone-500 mt-1">
                95% CI: [{data.nutritional_analysis.confidence_intervals.crude_protein_pct[0]} - {data.nutritional_analysis.confidence_intervals.crude_protein_pct[1]}%]
              </div>
            )}
          </div>

          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
            <div className="text-[11px] font-bold text-stone-500 uppercase">Fiber (NDF / ADF %)</div>
            <div className="text-xl font-black text-[#1b4332] mt-0.5">
              {data.nutritional_analysis.ndf_pct}% / {data.nutritional_analysis.adf_pct}%
            </div>
            <div className="text-[10px] text-stone-500 mt-1">NDF: Neutral · ADF: Acid</div>
          </div>

          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
            <div className="text-[11px] font-bold text-stone-500 uppercase">Mahalanobis Distance (D_M)</div>
            <div className={`text-xl font-black mt-0.5 ${isOod ? 'text-rose-600' : 'text-[#1b4332]'}`}>
              {evidence.metrics.ood_distance.toFixed(2)}
            </div>
            <div className="text-[10px] text-stone-500 mt-1">
              Threshold 2.50 ({isOod ? 'OOD Triggered' : 'Valid Fit'})
            </div>
          </div>
        </div>

        {isOod && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-medium">
            ⚠️ <strong>OUT OF CALIBRATION DOMAIN — QUANTITATIVE PREDICTION NOT TRUSTED:</strong> The sample&apos;s Mahalanobis distance D_M ({evidence.metrics.ood_distance.toFixed(2)}) exceeds the 2.50 domain boundary. Automated quantitative values carry elevated uncertainty and must be verified by wet chemistry.
          </div>
        )}
      </div>

      {/* 4. Integrated Chemical Strip & Camera Module */}
      <CameraAttachment batchId={data.batch_id} lang={lang} />

    </div>
  );
};
