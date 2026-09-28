"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Camera, Layers, Eye } from 'lucide-react';
import { Language } from '../lib/dictionary';
import { BatchAnalyzeResponse } from '../lib/api';
import { CameraAttachment } from './CameraAttachment';

interface MultiPointSamplingProps {
  lang: Language;
  data: BatchAnalyzeResponse;
  farmerMode: boolean;
}

export const MultiPointSampling: React.FC<MultiPointSamplingProps> = ({ lang, data, farmerMode }) => {
  const { nir_data, cv_screening, evidence } = data;

  // Transform 5 sampling point vectors into Recharts data structure based on selected preprocessing filter
  const [filterMode, setFilterMode] = React.useState<'raw' | 'snv' | 'savgol'>('raw');
  const wavelengths = nir_data.wavelengths || [];

  // Client-side instant chemometric transform for chart visualization
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
  const spatialMetrics = data.nutritional_analysis.spatial_metrics;
  const isOod = data.nutritional_analysis.is_ood || evidence.metrics.ood_distance > 2.5;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4 text-[#52b788]" />
            <span>{lang === 'mr' ? 'NIR स्पेक्ट्रोस्कोपी व केमोमेट्रिक्स' : lang === 'hi' ? 'NIR स्पेक्ट्रोस्कोपी व केमोमेट्रिक्स' : 'NIR SPECTROSCOPY & CHEMOMETRICS'}</span>
          </div>
          <h2 className="text-2xl font-black text-[#1a1e1b]">{lang === 'mr' ? '५-बिंदू नमुना तपासणी व OOD मॉडेल' : lang === 'hi' ? '५-बिंदु नमूना जाँच व OOD मॉडल' : 'Multi-Point NIR & Chemometrics PLSR'}</h2>
          <p className="text-xs text-stone-500 mt-1">
            {lang === 'mr' ? 'Scikit-Learn PLSR मॉडेल व महालानोबिस अंतर (ISO 12099) द्वारे वास्तविक पोषण विश्लेषण.' : lang === 'hi' ? 'Scikit-Learn PLSR मॉडल व महालानोबिस दूरी (ISO 12099) द्वारा पोषण विश्लेषण।' : 'Scikit-Learn PLSR multi-target regression + Mahalanobis calibration domain distance (D_M) conforming to ISO 12099.'}
          </p>
        </div>

        {!farmerMode && <div className="flex items-center space-x-3 bg-stone-50 px-4 py-2.5 rounded-xl border border-stone-200 text-xs">
          <div className="text-right">
            <div className="text-stone-500 font-medium">Mahalanobis Distance D_M</div>
            <div className={`text-base font-black ${isOod ? 'text-rose-600' : 'text-[#1b4332]'}`}>
              {evidence.metrics.ood_distance.toFixed(2)}
              <span className="text-[10px] text-stone-400 font-normal ml-1">/ 2.50 threshold</span>
            </div>
          </div>
          <div className={`w-3.5 h-3.5 rounded-full ${isOod ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
        </div>}
      </div>

      {farmerMode ? <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950"><strong>{lang === 'mr' ? 'चारा तपासणी' : lang === 'hi' ? 'चारा जाँच' : 'Feed Test'}</strong><p className="mt-2">{lang === 'mr' ? '५ नमुन्यांची सरासरी आणि पोषण मूल्ये खाली दर्शविली आहेत.' : lang === 'hi' ? '५ नमूनों का औसत और पोषण मान नीचे दिखाया गया है।' : '5-point core sampling averages and nutritional parameters are computed below.'}</p></div> : <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: 5-Point NIR Spectral Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-bold text-[#1a1e1b]">NIR Reflectance Spectrum (800nm - 1050nm)</h3>
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
                1st Deriv (SG1)
              </button>
            </div>
          </div>

          <div className="h-72 w-full mt-4">
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
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                {nir_data.points.map((pt, idx) => (
                  <Line
                    key={pt.point_id}
                    type="monotone"
                    dataKey={pt.point_id}
                    stroke={colors[idx % colors.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Spatial Heterogeneity Alert if CV > 12% */}
          {spatialMetrics?.is_heterogeneous && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
              <span className="font-bold">⚠️ HETEROGENEOUS BATCH DETECTED</span>
              <span>Spatial CV: {spatialMetrics.spectral_cv_pct}% (Limit: 12%) · Outlier at {spatialMetrics.anomalous_point_id || 'Point 05'}</span>
            </div>
          )}

          {/* Core Sampling Points Status Grid with Genuine PLSR Predictions */}
          <div className="grid grid-cols-5 gap-2 mt-4 pt-4 border-t border-stone-100">
            {nir_data.points.map((pt, idx) => {
              const pred = pointPredictions[idx];
              const ptDist = pred?.mahalanobis_distance;
              const ptOod = pred?.is_ood || (ptDist ? ptDist > 2.5 : false);
              return (
                <div
                  key={pt.point_id}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    ptOod
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : 'bg-stone-50 border-stone-200 text-[#1b4332]'
                  }`}
                >
                  <div className="text-[10px] font-bold text-stone-400">POINT 0{idx + 1}</div>
                  <div className="text-xs font-black mt-0.5">
                    {pred ? `CP: ${pred.crude_protein_pct}%` : 'PLSR'}
                  </div>
                  <div className="text-[9px] font-medium mt-0.5">
                    {pred ? `DM: ${pred.dry_matter_pct}%` : `D_M: ${ptDist || '—'}`}
                  </div>
                  <div className={`text-[8px] font-bold uppercase mt-1 px-1.5 py-0.5 rounded ${
                    ptOod ? 'bg-rose-200 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {ptOod ? 'OOD' : ptDist ? `D_M ${ptDist.toFixed(2)}` : 'In-Domain'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Computer Vision Screening Simulation */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-[#2d6a4f]" />
                <h3 className="text-base font-bold text-[#1a1e1b]">CV Visual Screening</h3>
              </div>
                <span className="text-[10px] font-mono bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-bold border border-stone-300">
                NO IMAGE ANALYZED
              </span>
            </div>

            {/* Visual Inspection Image Box Mockup */}
            <div className="relative bg-stone-900 rounded-xl overflow-hidden h-44 flex items-center justify-center border border-stone-800 mb-4">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#52b788_1px,transparent_1px)] [background-size:12px_12px]"></div>
              
              <div className="relative text-center p-4">
                <Eye className="w-8 h-8 text-[#74c69d] mx-auto mb-2 opacity-80 animate-pulse" />
                <div className="text-xs font-mono text-emerald-300 font-bold">SCENARIO FLAG · NOT IMAGE ANALYSIS</div>
                <div className="text-[10px] text-gray-400 mt-1 max-w-xs mx-auto">
                  {cv_screening.screening_summary} No image was captured or analyzed.
                </div>
              </div>

              <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-[10px] text-emerald-400 font-mono">
                DEMO FLAG: {cv_screening.visual_anomaly_detected ? 'ON' : 'OFF'}
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-950">
              Scenario flag: {cv_screening.visual_anomaly_detected ? 'anomaly example' : 'no anomaly example'}. Texture, color, mould and mycotoxins were not measured.
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-500 italic">
            No camera screening is connected. Use suitable laboratory testing to confirm contaminants.
          </div>
        </div>

      </div>}

      {/* Research-Grade Chemometrics PLSR & OOD Calibration Card */}
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

      <CameraAttachment batchId={data.batch_id} lang={lang} />

    </div>
  );
};
