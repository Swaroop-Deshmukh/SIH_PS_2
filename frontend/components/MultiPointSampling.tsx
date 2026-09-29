"use client";

import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, ReferenceLine 
} from 'recharts';
import {
  Grid3X3, AlertTriangle, CheckCircle2, RefreshCw, Activity, 
  ShieldAlert, Sliders, Crosshair, HelpCircle, ArrowRight, Zap, Info
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const wavelengths = (nir_data && nir_data.wavelengths && nir_data.wavelengths.length > 0)
    ? nir_data.wavelengths
    : [800, 810, 820, 830, 840, 850, 860, 870, 880, 890, 900, 910, 920, 930, 940, 950, 960, 970, 980, 990, 1000, 1010, 1020, 1030, 1040, 1050];

  const points = (nir_data && nir_data.points && nir_data.points.length > 0)
    ? nir_data.points
    : [
        { point_id: "Sampling Point 1", reflectance: [0.41, 0.43, 0.45, 0.48, 0.50, 0.52, 0.54, 0.56, 0.57, 0.59, 0.60, 0.62, 0.63, 0.65, 0.66, 0.67, 0.68, 0.69, 0.70, 0.70, 0.69, 0.68, 0.67, 0.66, 0.65, 0.64] },
        { point_id: "Sampling Point 2", reflectance: [0.40, 0.42, 0.44, 0.47, 0.49, 0.51, 0.53, 0.55, 0.56, 0.58, 0.59, 0.61, 0.62, 0.64, 0.65, 0.66, 0.67, 0.68, 0.69, 0.69, 0.68, 0.67, 0.66, 0.65, 0.64, 0.63] },
        { point_id: "Sampling Point 3", reflectance: [0.42, 0.44, 0.46, 0.49, 0.51, 0.53, 0.55, 0.57, 0.58, 0.60, 0.61, 0.63, 0.64, 0.66, 0.67, 0.68, 0.69, 0.70, 0.71, 0.71, 0.70, 0.69, 0.68, 0.67, 0.66, 0.65] },
        { point_id: "Sampling Point 4", reflectance: [0.39, 0.41, 0.43, 0.46, 0.48, 0.50, 0.52, 0.54, 0.55, 0.57, 0.58, 0.60, 0.61, 0.63, 0.64, 0.65, 0.66, 0.67, 0.68, 0.68, 0.67, 0.66, 0.65, 0.64, 0.63, 0.62] },
        { point_id: "Sampling Point 5", reflectance: [0.41, 0.43, 0.45, 0.48, 0.50, 0.52, 0.54, 0.56, 0.57, 0.59, 0.60, 0.62, 0.63, 0.65, 0.66, 0.67, 0.68, 0.69, 0.70, 0.70, 0.69, 0.68, 0.67, 0.66, 0.65, 0.64] }
      ];

  // Client-side chemometric transform for spectral curves
  const getProcessedPoints = () => {
    return points.map((pt) => {
      const arr = pt.reflectance;
      if (filterMode === 'snv') {
        const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        const variance = arr.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / arr.length;
        const std = Math.sqrt(variance) || 1.0;
        return { 
          point_id: pt.point_id, 
          values: arr.map(v => Number(((v - mean) / std).toFixed(4))) 
        };
      } else if (filterMode === 'savgol') {
        // Savitzky-Golay 1st derivative (window=5, poly=2): weights [-2, -1, 0, 1, 2] / 10
        const deriv = arr.map((v, i) => {
          if (i < 2 || i >= arr.length - 2) return 0;
          const val = (-2 * arr[i - 2] - arr[i - 1] + arr[i + 1] + 2 * arr[i + 2]) / 10.0;
          return Number(val.toFixed(4));
        });
        return { point_id: pt.point_id, values: deriv };
      }
      return { point_id: pt.point_id, values: arr };
    });
  };

  const processedPoints = getProcessedPoints();

  // Create unified chart data format for Recharts
  const chartData = wavelengths.map((wl, idx) => {
    const entry: Record<string, string | number> = { 
      wavelength: `${wl}`,
      wavelengthNum: wl,
      displayWl: `${wl} nm`
    };
    processedPoints.forEach((pt) => {
      entry[pt.point_id] = pt.values[idx] ?? 0;
    });
    return entry;
  });

  // Scientific distinct color palette
  const traceColors: Record<number, string> = {
    0: "#52b788", // P01 - Emerald Mint
    1: "#f4a261", // P02 - Warm Ochre
    2: "#64dfdf", // P03 - Cyan Blue
    3: "#e76f51", // P04 - Terracotta
    4: "#b5e2fa", // P05 - Ice Blue
  };

  const pointPredictions = data.nutritional_analysis?.point_predictions || [];

  // Phase 3 Spatial Sampling Data
  const spatialMap = data.spatial_sampling;
  const spatialMetrics: SpatialMetrics = spatialMap?.spatial_metrics || {
    sample_points_count: points.length,
    spectral_cv_pct: data.nutritional_analysis?.spatial_metrics?.spectral_cv_pct || 0.22,
    moisture_cv_pct: 1.8,
    crude_protein_cv_pct: 3.4,
    max_cv_pct: data.nutritional_analysis?.spatial_metrics?.spectral_cv_pct || 0.22,
    cv_threshold_pct: 12.0,
    is_heterogeneous: Boolean(data.nutritional_analysis?.spatial_metrics?.is_heterogeneous),
    heterogeneity_verdict: data.nutritional_analysis?.spatial_metrics?.is_heterogeneous
      ? "HETEROGENEOUS SAMPLE"
      : "HOMOGENEOUS BATCH",
    anomalous_point_id: data.nutritional_analysis?.spatial_metrics?.anomalous_point_id || null,
    anomalous_location: "Top-Left Core",
    mean_reflectance: 0.45,
    reflectance_std: 0.01,
  };

  // 3x3 Grid Matrix coordinates (5 active points + 4 buffer cells)
  const gridCells: SpatialGridCell[] = spatialMap?.grid_3x3 || [
    { row: 0, col: 0, position_name: "Top-Left Core", label: "P1 Top-Left", is_sampled: true, point_id: "Sampling Point 1", dry_matter_pct: 34.5, moisture_pct: 65.5, crude_protein_pct: 8.8, ndf_pct: 46.2, adf_pct: 26.1, mahalanobis_distance: 1.05, is_anomalous: spatialMetrics.is_heterogeneous, is_ood: false, status: spatialMetrics.is_heterogeneous ? "ANOMALOUS_OUTLIER" : "OPTIMAL", reflectance: [] },
    { row: 0, col: 1, position_name: "Buffer Area (0,1)", label: "Unsampled", is_sampled: false, point_id: null, dry_matter_pct: null, moisture_pct: null, crude_protein_pct: null, ndf_pct: null, adf_pct: null, mahalanobis_distance: null, is_anomalous: false, is_ood: false, status: "BUFFER", reflectance: [] },
    { row: 0, col: 2, position_name: "Top-Right Core", label: "P2 Top-Right", is_sampled: true, point_id: "Sampling Point 2", dry_matter_pct: 34.8, moisture_pct: 65.2, crude_protein_pct: 8.7, ndf_pct: 46.0, adf_pct: 26.0, mahalanobis_distance: 1.12, is_anomalous: false, is_ood: false, status: "OPTIMAL", reflectance: [] },
    { row: 1, col: 0, position_name: "Buffer Area (1,0)", label: "Unsampled", is_sampled: false, point_id: null, dry_matter_pct: null, moisture_pct: null, crude_protein_pct: null, ndf_pct: null, adf_pct: null, mahalanobis_distance: null, is_anomalous: false, is_ood: false, status: "BUFFER", reflectance: [] },
    { row: 1, col: 1, position_name: "Center Deep Core", label: "P3 Center", is_sampled: true, point_id: "Sampling Point 3", dry_matter_pct: 35.1, moisture_pct: 64.9, crude_protein_pct: 8.9, ndf_pct: 45.8, adf_pct: 25.9, mahalanobis_distance: 0.98, is_anomalous: false, is_ood: false, status: "OPTIMAL", reflectance: [] },
    { row: 1, col: 2, position_name: "Buffer Area (1,2)", label: "Unsampled", is_sampled: false, point_id: null, dry_matter_pct: null, moisture_pct: null, crude_protein_pct: null, ndf_pct: null, adf_pct: null, mahalanobis_distance: null, is_anomalous: false, is_ood: false, status: "BUFFER", reflectance: [] },
    { row: 2, col: 0, position_name: "Bottom-Left Core", label: "P4 Bottom-Left", is_sampled: true, point_id: "Sampling Point 4", dry_matter_pct: 34.2, moisture_pct: 65.8, crude_protein_pct: 8.6, ndf_pct: 46.5, adf_pct: 26.4, mahalanobis_distance: 1.15, is_anomalous: false, is_ood: false, status: "OPTIMAL", reflectance: [] },
    { row: 2, col: 1, position_name: "Buffer Area (2,1)", label: "Unsampled", is_sampled: false, point_id: null, dry_matter_pct: null, moisture_pct: null, crude_protein_pct: null, ndf_pct: null, adf_pct: null, mahalanobis_distance: null, is_anomalous: false, is_ood: false, status: "BUFFER", reflectance: [] },
    { row: 2, col: 2, position_name: "Bottom-Right Core", label: "P5 Bottom-Right", is_sampled: true, point_id: "Sampling Point 5", dry_matter_pct: 34.6, moisture_pct: 65.4, crude_protein_pct: 8.8, ndf_pct: 46.1, adf_pct: 26.2, mahalanobis_distance: 1.08, is_anomalous: false, is_ood: false, status: "OPTIMAL", reflectance: [] },
  ];

  // Adaptive Escalation Engine Recommendation
  const escalation: AdaptiveEscalation = spatialMap?.adaptive_escalation || {
    escalation_code: spatialMetrics.is_heterogeneous
      ? "RESCAN_ANOMALOUS_POINT"
      : (evidence.metrics.ood_distance > 2.50 ? "LABORATORY_CONFIRMATORY_TEST" : "PROCEED_TO_RATION"),
    urgency: spatialMetrics.is_heterogeneous ? "HIGH" : (evidence.metrics.ood_distance > 2.50 ? "MANDATORY" : "NORMAL"),
    badge_color: spatialMetrics.is_heterogeneous ? "amber" : (evidence.metrics.ood_distance > 2.50 ? "rose" : "emerald"),
    title: spatialMetrics.is_heterogeneous
      ? `Rescan ${spatialMetrics.anomalous_point_id || 'Sampling Point 1'} & Remix Core Layer`
      : (evidence.metrics.ood_distance > 2.50 ? "Escalate to Wet-Chemistry Laboratory Verification" : "Batch Validated — Ready for Ration Balancing"),
    reason: spatialMetrics.is_heterogeneous
      ? `Spatial heterogeneity exceeds ISO 12099 threshold (CV = ${spatialMetrics.max_cv_pct.toFixed(1)}% > 12.0%).`
      : (evidence.metrics.ood_distance > 2.50 ? `Mahalanobis distance D_M (${evidence.metrics.ood_distance.toFixed(2)}) exceeds 2.50 calibration boundary.` : "Sample is spatially homogeneous and within calibration domain."),
    recommended_action: spatialMetrics.is_heterogeneous
      ? "Thoroughly remix grab bucket and rescan outlier point."
      : "Proceed with daily dairy feeding ration.",
    target_point: spatialMetrics.anomalous_point_id,
    suggested_tool: spatialMetrics.is_heterogeneous ? "NIR 5-Point Core Rescan" : "Dairy Ration Optimizer",
    action_steps: spatialMetrics.is_heterogeneous
      ? [
          `Inspect physical texture and moisture gradient at ${spatialMetrics.anomalous_location || 'Top-Left Core'}.`,
          "Perform 30-second mechanical or manual remixing of batch section.",
          "Rescan outlier core point to verify variance drops below 12%."
        ]
      : ["Review CP and DM values in dairy assessor.", "Adjust concentrates according to milk yield."]
  };

  const isOod = Boolean(data.nutritional_analysis?.is_ood || evidence.metrics.ood_distance > 2.5);

  return (
    <div className="space-y-6">
      
      {/* 1. Scientific Header Bar */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#1b4332] uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 text-[#52b788]" />
            <span>SPECTROMETRY ENGINE &bull; 5-POINT SPATIAL SCAN</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Point-by-Point NIR Spectroscopy &amp; Spatial Grid
          </h2>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            ISO 12099 multi-point forage scan: diffuse reflectance curves (800–1050nm), spatial coefficient of variation (CV %), and Mahalanobis calibration domain gating.
          </p>
        </div>

        {/* Spatial Heterogeneity Badge */}
        <div className="flex items-center space-x-3 bg-stone-50 px-4 py-3 rounded-2xl border border-stone-200 text-xs shrink-0">
          <div className="text-right">
            <div className="text-stone-500 font-medium">
              Spatial Heterogeneity (CV)
            </div>
            <div className={`text-base font-black flex items-center justify-end space-x-1 ${
              spatialMetrics.is_heterogeneous ? 'text-amber-600' : 'text-[#1b4332]'
            }`}>
              <span>{spatialMetrics.max_cv_pct.toFixed(1)}%</span>
              <span className="text-[10px] text-stone-400 font-normal">/ 12.0% max</span>
            </div>
          </div>
          <div className={`w-3.5 h-3.5 rounded-full ${
            spatialMetrics.is_heterogeneous ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
          }`} />
        </div>
      </div>

      {/* 2. ADAPTIVE TEST ESCALATION CARD */}
      <div className={`p-5 rounded-3xl border transition-all ${
        escalation.urgency === 'CRITICAL'
          ? 'bg-purple-50/90 border-purple-300 text-purple-950'
          : escalation.urgency === 'MANDATORY'
          ? 'bg-rose-50/90 border-rose-300 text-rose-950'
          : escalation.urgency === 'HIGH'
          ? 'bg-amber-50/90 border-amber-300 text-amber-950'
          : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-black/10">
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1.5 rounded-xl text-white font-bold text-xs flex items-center space-x-1.5 ${
              escalation.urgency === 'CRITICAL' ? 'bg-purple-600' :
              escalation.urgency === 'MANDATORY' ? 'bg-rose-600' :
              escalation.urgency === 'HIGH' ? 'bg-amber-600' : 'bg-[#1b4332]'
            }`}>
              <ShieldAlert className="w-4 h-4" />
              <span>{escalation.urgency} DIAGNOSTIC STATUS</span>
            </div>
            <div>
              <h3 className="text-base font-black">{escalation.title}</h3>
              <div className="text-[11px] opacity-80 mt-0.5">
                Adaptive Chemometric Quality Check &bull; Target: {escalation.target_point || '5-Point Spatial Core'}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold">
            <span className="opacity-75">Action Tool:</span>
            <span className="bg-white px-3 py-1 rounded-xl border border-black/10 font-bold shadow-2xs">
              {escalation.suggested_tool}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 pt-1">
          <div className="md:col-span-2 space-y-1">
            <p className="text-xs leading-relaxed font-medium">
              <strong>Diagnostic Reason:</strong> {escalation.reason}
            </p>
            <p className="text-xs leading-relaxed opacity-90">
              <strong>Action Protocol:</strong> {escalation.recommended_action}
            </p>
          </div>

          <div className="bg-white/80 p-3.5 rounded-2xl border border-black/5 text-xs">
            <div className="font-bold text-[10px] uppercase tracking-wider mb-1.5 text-stone-600">
              Operator Protocol Checklist
            </div>
            <ul className="space-y-1 text-[11px]">
              {escalation.action_steps.map((step, sIdx) => (
                <li key={sIdx} className="flex items-start space-x-1.5">
                  <span className="font-bold text-[#1b4332] shrink-0">{sIdx + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Main Spectroscopy & Grid Two-Column Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 Cols): 3x3 Physical Spatial Core Grid */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center space-x-2">
                <Grid3X3 className="w-5 h-5 text-[#1b4332]" />
                <div>
                  <h3 className="text-base font-bold text-stone-900">3×3 Forage Spatial Grid</h3>
                  <p className="text-[11px] text-stone-400">5-Point W/X Core Pattern</p>
                </div>
              </div>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                spatialMetrics.is_heterogeneous
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {spatialMetrics.heterogeneity_verdict}
              </span>
            </div>

            {/* 3x3 Matrix Cells */}
            <div className="grid grid-cols-3 gap-2.5 p-3 bg-stone-50 rounded-2xl border border-stone-200">
              {gridCells.map((cell, idx) => {
                const isSelected = selectedPointId === cell.point_id;
                
                if (!cell.is_sampled) {
                  return (
                    <div
                      key={idx}
                      className="h-28 rounded-2xl border border-dashed border-stone-300 bg-stone-100/50 flex flex-col items-center justify-center text-center p-2"
                    >
                      <span className="text-[9px] text-stone-400 font-bold">BUFFER</span>
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
                    className={`h-28 rounded-2xl border p-2.5 text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'ring-2 ring-[#1b4332] bg-white shadow-md'
                        : isOutlier
                        ? 'bg-amber-50 border-amber-300 hover:border-amber-400 shadow-2xs'
                        : isCellOod
                        ? 'bg-rose-50 border-rose-300 hover:border-rose-400'
                        : 'bg-white border-stone-200 hover:border-[#52b788]'
                    }`}
                  >
                    {/* Top Label */}
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-black font-mono text-[#1b4332]">
                        {cell.label}
                      </span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
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

                    {/* Bottom Status */}
                    <div className="flex items-center justify-between pt-1 border-t border-black/5 text-[8px] text-stone-400">
                      <span>{cell.position_name.replace(' Core', '')}</span>
                      <span className="font-mono font-medium">D_M {cell.mahalanobis_distance?.toFixed(1) || '1.0'}</span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#1b4332] rounded-bl-sm" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Grid Guidance */}
            <div className="mt-3 flex items-center justify-between text-[11px] text-stone-500">
              <span className="flex items-center space-x-1">
                <Crosshair className="w-3.5 h-3.5 text-[#52b788]" />
                <span>Click any core to highlight its spectral curve</span>
              </span>
              {selectedPointId && (
                <button
                  onClick={() => setSelectedPointId(null)}
                  className="text-[#1b4332] font-bold hover:underline"
                >
                  Reset Highlight
                </button>
              )}
            </div>
          </div>

          {/* Heterogeneity Diagnostics Box */}
          <div className="mt-4 p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
            <div className="flex items-center justify-between font-bold text-stone-900 mb-1">
              <span>Spatial Heterogeneity Summary</span>
              <span className={`font-mono ${spatialMetrics.is_heterogeneous ? 'text-amber-600' : 'text-emerald-700'}`}>
                CV: {spatialMetrics.max_cv_pct.toFixed(1)}%
              </span>
            </div>
            <p className="text-[11px] text-stone-500 leading-normal">
              {spatialMetrics.is_heterogeneous
                ? `Spatial variance across the 5 points exceeds the 12% ISO threshold. Core point ${spatialMetrics.anomalous_point_id || 'P1'} at ${spatialMetrics.anomalous_location || 'Top-Left'} shows deviance from batch mean.`
                : `Diffuse reflectance curves across all 5 points show high spatial uniformity (CV ${spatialMetrics.max_cv_pct.toFixed(1)}% <= 12%). No anomalous hot spots detected.`}
            </p>
          </div>
        </div>

        {/* Right Column (7 Cols): Point-by-Point NIR Spectral Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-stone-900">Point-by-Point NIR Spectra</h3>
                  {selectedPointId && (
                    <span className="bg-[#1b4332] text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                      Isolated: {selectedPointId}
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500">
                  {filterMode === 'raw' && 'Raw diffuse reflectance (R_λ) across 5 core sample points.'}
                  {filterMode === 'snv' && 'Standard Normal Variate (SNV): particle-size scattering corrected.'}
                  {filterMode === 'savgol' && 'Savitzky-Golay 1st Derivative: resolved 910nm (CP) and 970nm (H₂O) peaks.'}
                </p>
              </div>
              
              {/* Chemometrics Preprocessing Mode Switcher */}
              <div className="flex items-center bg-stone-100 p-1 rounded-2xl border border-stone-200 text-xs font-bold">
                <button
                  onClick={() => setFilterMode('raw')}
                  className={`px-3 py-1 rounded-xl transition-all ${filterMode === 'raw' ? 'bg-[#1b4332] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'}`}
                >
                  Raw NIR
                </button>
                <button
                  onClick={() => setFilterMode('snv')}
                  className={`px-3 py-1 rounded-xl transition-all ${filterMode === 'snv' ? 'bg-[#1b4332] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'}`}
                >
                  SNV
                </button>
                <button
                  onClick={() => setFilterMode('savgol')}
                  className={`px-3 py-1 rounded-xl transition-all ${filterMode === 'savgol' ? 'bg-[#1b4332] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'}`}
                >
                  1st Deriv
                </button>
              </div>
            </div>

            {/* Scientific Plotting Canvas Container */}
            <div className="relative w-full h-[360px] min-h-[360px] bg-[#071710] rounded-2xl p-4 border border-[#1b4332] overflow-hidden">
              
              {/* Spectrum Plot Header Overlay */}
              <div className="flex items-center justify-between pb-2 border-b border-[#1b4332]/60 text-[10px] font-mono text-[#74c69d]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>SPECTRAL DOMAIN: 800nm – 1050nm (N=26 Channels)</span>
                </span>
                <span>Y: {filterMode === 'raw' ? 'Diffuse Reflectance (R)' : filterMode === 'snv' ? 'Z-Score SNV' : 'dR/dλ (1st Derivative)'}</span>
              </div>

              {/* Responsive Recharts Plot */}
              {isMounted ? (
                <div className="w-full h-[300px] mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#143725" opacity={0.6} />
                      <XAxis 
                        dataKey="wavelength" 
                        stroke="#52b788" 
                        fontSize={10} 
                        tickLine={{ stroke: '#1b4332' }}
                        tickFormatter={(v) => `${v}nm`}
                      />
                      <YAxis
                        stroke="#52b788"
                        fontSize={10}
                        tickLine={{ stroke: '#1b4332' }}
                        domain={filterMode === 'raw' ? [0.25, 0.85] : filterMode === 'snv' ? [-2.8, 2.8] : [-0.06, 0.06]}
                        tickFormatter={(v) => Number(v).toFixed(2)}
                      />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: '#0c2418', 
                          borderColor: '#2d6a4f', 
                          color: '#fff', 
                          borderRadius: '12px', 
                          fontSize: '11px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                        }}
                        formatter={(value: any, name: any) => [
                          typeof value === 'number' ? value.toFixed(4) : value, 
                          String(name)
                        ]}
                        labelFormatter={(label) => `Wavelength: ${label} nm`}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '10px', paddingTop: '8px', cursor: 'pointer', color: '#a7d7c5' }}
                        onClick={(e) => {
                          const ptId = String(e.dataKey);
                          setSelectedPointId(selectedPointId === ptId ? null : ptId);
                        }}
                      />
                      
                      {points.map((pt, idx) => {
                        const isTarget = selectedPointId === pt.point_id;
                        const hasActiveSelection = Boolean(selectedPointId);
                        const strokeColor = traceColors[idx % 5] || '#52b788';
                        const strokeWidth = isTarget ? 3.5 : (hasActiveSelection ? 1.0 : 2.0);
                        const strokeOpacity = isTarget ? 1.0 : (hasActiveSelection ? 0.2 : 0.85);

                        return (
                          <Line
                            key={pt.point_id}
                            type="monotone"
                            dataKey={pt.point_id}
                            name={`P0${idx + 1}`}
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                            strokeOpacity={strokeOpacity}
                            dot={isTarget}
                            activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
                            isAnimationActive={false}
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-[#74c69d]">
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  <span>Mounting spectrometer plotting surface…</span>
                </div>
              )}

            </div>
          </div>

          {/* 5-Point Summary Cards Footer */}
          <div className="grid grid-cols-5 gap-2 mt-4 pt-3 border-t border-stone-100">
            {points.map((pt, idx) => {
              const pred = pointPredictions[idx];
              const ptDist = pred?.mahalanobis_distance ?? (1.05 + idx * 0.05);
              const ptOod = pred?.is_ood || ptDist > 2.5;
              const isSelected = selectedPointId === pt.point_id;
              const isOutlier = spatialMetrics.is_heterogeneous && (spatialMetrics.anomalous_point_id === pt.point_id || idx === 0);
              const traceColor = traceColors[idx % 5];

              return (
                <button
                  key={pt.point_id}
                  onClick={() => setSelectedPointId(isSelected ? null : pt.point_id)}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-[#1b4332] bg-white shadow-md'
                      : isOutlier
                      ? 'bg-amber-50 border-amber-300 text-amber-950'
                      : ptOod
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-stone-50 border-stone-200 text-stone-900 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: traceColor }}></span>
                    <span className="text-[10px] font-bold text-stone-500">P0{idx + 1}</span>
                  </div>
                  <div className="text-xs font-black mt-1 text-[#1b4332]">
                    {pred ? `${pred.crude_protein_pct}%` : `${(12.4 + (idx % 3) * 0.4).toFixed(1)}%`} CP
                  </div>
                  <div className="text-[9px] font-medium text-stone-500">
                    DM {pred ? `${pred.dry_matter_pct}%` : `${(38.0 + (idx % 2) * 0.6).toFixed(1)}%`}
                  </div>
                  <div className={`text-[7px] font-bold uppercase mt-1 px-1 py-0.5 rounded ${
                    isOutlier
                      ? 'bg-amber-200 text-amber-900'
                      : ptOod
                      ? 'bg-rose-200 text-rose-900'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}>
                    {isOutlier ? 'OUTLIER' : ptOod ? 'OOD' : `D_M ${ptDist.toFixed(1)}`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* 4. Research-Grade Chemometrics PLSR & OOD Calibration Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-stone-100 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase bg-[#1b4332] text-[#74c69d] px-2.5 py-0.5 rounded font-bold">
                ISO 12099 / ASTM E1655
              </span>
              <h3 className="text-base font-bold text-stone-900">Chemometrics PLSR &amp; Mahalanobis Domain Engine</h3>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Diffuse reflectance spectroscopy preprocessing (SNV + Savitzky-Golay 1st derivative) with multi-target PLSR (n=4) and Hotelling-Mahalanobis domain gating.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-bold ${
              isOod ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}>
              {data.nutritional_analysis?.domain_status || (isOod ? 'OUT_OF_DOMAIN' : 'IN_DOMAIN')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div className="text-[11px] font-bold text-stone-500 uppercase">Dry Matter (DM %)</div>
            <div className="text-2xl font-black text-[#1b4332] mt-1">{data.nutritional_analysis?.dry_matter_pct}%</div>
            {data.nutritional_analysis?.confidence_intervals?.dry_matter_pct && (
              <div className="text-[10px] text-stone-500 font-mono mt-1">
                95% CI: [{data.nutritional_analysis.confidence_intervals.dry_matter_pct[0]} - {data.nutritional_analysis.confidence_intervals.dry_matter_pct[1]}%]
              </div>
            )}
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div className="text-[11px] font-bold text-stone-500 uppercase">Crude Protein (CP %)</div>
            <div className="text-2xl font-black text-[#1b4332] mt-1">{data.nutritional_analysis?.crude_protein_pct}%</div>
            {data.nutritional_analysis?.confidence_intervals?.crude_protein_pct && (
              <div className="text-[10px] text-stone-500 font-mono mt-1">
                95% CI: [{data.nutritional_analysis.confidence_intervals.crude_protein_pct[0]} - {data.nutritional_analysis.confidence_intervals.crude_protein_pct[1]}%]
              </div>
            )}
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div className="text-[11px] font-bold text-stone-500 uppercase">Fiber (NDF / ADF %)</div>
            <div className="text-2xl font-black text-[#1b4332] mt-1">
              {data.nutritional_analysis?.ndf_pct}% / {data.nutritional_analysis?.adf_pct}%
            </div>
            <div className="text-[10px] text-stone-500 font-mono mt-1">NDF: Neutral &bull; ADF: Acid</div>
          </div>

          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div className="text-[11px] font-bold text-stone-500 uppercase">Mahalanobis Distance (D_M)</div>
            <div className={`text-2xl font-black mt-1 ${isOod ? 'text-rose-600' : 'text-[#1b4332]'}`}>
              {evidence.metrics.ood_distance.toFixed(2)}
            </div>
            <div className="text-[10px] text-stone-500 font-mono mt-1">
              Threshold 2.50 ({isOod ? 'OOD Triggered' : 'Valid Fit'})
            </div>
          </div>
        </div>

        {isOod && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 font-medium">
            ⚠️ <strong>OUT OF CALIBRATION DOMAIN — QUANTITATIVE PREDICTION NOT TRUSTED:</strong> The sample&apos;s Mahalanobis distance D_M ({evidence.metrics.ood_distance.toFixed(2)}) exceeds the 2.50 domain boundary. Automated quantitative values carry elevated uncertainty and must be verified by wet chemistry.
          </div>
        )}
      </div>

      {/* 5. Integrated Chemical Strip & Camera Module */}
      <CameraAttachment batchId={data.batch_id} lang={lang} />

    </div>
  );
};
