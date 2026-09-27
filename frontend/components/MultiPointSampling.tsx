"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Camera, Layers, CheckCircle2, AlertTriangle, Eye, Activity } from 'lucide-react';
import { dictionary, Language } from '../lib/dictionary';
import { BatchAnalyzeResponse } from '../lib/api';

interface MultiPointSamplingProps {
  lang: Language;
  data: BatchAnalyzeResponse;
  farmerMode: boolean;
}

export const MultiPointSampling: React.FC<MultiPointSamplingProps> = ({ lang, data, farmerMode }) => {
  const t = dictionary[lang];
  const { nir_data, cv_screening, evidence } = data;

  // Transform 5 sampling point vectors into Recharts data structure
  const wavelengths = nir_data.wavelengths || [];
  const chartData = wavelengths.map((wl, idx) => {
    const entry: any = { wavelength: `${wl}nm` };
    nir_data.points.forEach((pt) => {
      entry[pt.point_id] = pt.reflectance[idx];
    });
    return entry;
  });

  const colors = ['#52b788', '#d4a373', '#40916c', '#f4a261', '#74c69d'];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4 text-[#52b788]" />
            <span>LEVEL 1 & 2 INTELLIGENCE • REPRESENTATIVE CORE SAMPLING</span>
          </div>
          <h2 className="text-2xl font-black text-[#1a1e1b]">Multi-Point NIR & Visual Screening</h2>
          <p className="text-xs text-stone-500 mt-1">
            Sample tested across 5 core locations to account for moisture gradients and physical heterogeneity.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-stone-50 px-4 py-2.5 rounded-xl border border-stone-200 text-xs">
          <div className="text-right">
            <div className="text-stone-500 font-medium">Sample Consistency</div>
            <div className="text-base font-black text-[#1b4332]">{evidence.metrics.sample_consistency}%</div>
          </div>
          <div className={`w-3 h-3 rounded-full ${evidence.metrics.sample_consistency > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: 5-Point NIR Spectral Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-[#1a1e1b]">NIR Reflectance Spectrum (800nm - 1050nm)</h3>
              <p className="text-xs text-stone-500">Overlaid spectra across 5 sampling points. Diverging lines indicate non-uniform core sample.</p>
            </div>
            <span className="text-[11px] font-mono bg-[#1b4332] text-[#74c69d] px-2.5 py-1 rounded font-bold">
              SIMULATED NIR SCAN
            </span>
          </div>

          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="wavelength" stroke="#888888" fontSize={11} />
                <YAxis domain={[0.2, 0.8]} stroke="#888888" fontSize={11} />
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

          {/* Core Sampling Points Status Grid */}
          <div className="grid grid-cols-5 gap-2 mt-6 pt-4 border-t border-stone-100">
            {nir_data.points.map((pt, idx) => (
              <div key={pt.point_id} className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-center">
                <div className="text-[10px] font-bold text-stone-400">POINT 0{idx + 1}</div>
                <div className="text-xs font-black text-[#1b4332] mt-0.5">Scanned</div>
                <div className="text-[9px] text-emerald-600 font-medium">Baseline Fit</div>
              </div>
            ))}
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
                CAMERA SIMULATION
              </span>
            </div>

            {/* Visual Inspection Image Box Mockup */}
            <div className="relative bg-stone-900 rounded-xl overflow-hidden h-44 flex items-center justify-center border border-stone-800 mb-4">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#52b788_1px,transparent_1px)] [background-size:12px_12px]"></div>
              
              <div className="relative text-center p-4">
                <Eye className="w-8 h-8 text-[#74c69d] mx-auto mb-2 opacity-80 animate-pulse" />
                <div className="text-xs font-mono text-emerald-300 font-bold">
                  {cv_screening.visual_anomaly_detected ? "VISUAL ANOMALY DETECTED" : "UNIFORM TEXTURE DETECTED"}
                </div>
                <div className="text-[10px] text-gray-400 mt-1 max-w-xs mx-auto">
                  {cv_screening.screening_summary}
                </div>
              </div>

              <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-[10px] text-emerald-400 font-mono">
                SCORE: {cv_screening.anomaly_score}/100
              </div>
            </div>

            {/* Visual Anomaly Metrics */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-stone-50 border border-stone-200">
                <span className="text-stone-600 font-medium">Texture Uniformity:</span>
                <span className="font-bold text-[#1b4332]">{cv_screening.texture_uniformity}%</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-stone-50 border border-stone-200">
                <span className="text-stone-600 font-medium">Color Consistency:</span>
                <span className="font-bold text-[#1b4332]">{cv_screening.color_consistency_score}%</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-stone-50 border border-stone-200">
                <span className="text-stone-600 font-medium">Mould Risk Indication:</span>
                <span className={`font-bold ${cv_screening.mould_risk_level === 'HIGH' ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {cv_screening.mould_risk_level} ({cv_screening.mould_coverage_pct}%)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-500 italic">
            * Screening indication only. Confirmatory testing recommended for suspected mycotoxins or foreign particulates.
          </div>
        </div>

      </div>

    </div>
  );
};
