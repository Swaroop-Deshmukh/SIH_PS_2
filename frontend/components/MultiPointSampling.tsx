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

  // Transform 5 sampling point vectors into Recharts data structure
  const wavelengths = nir_data.wavelengths || [];
  const chartData = wavelengths.map((wl, idx) => {
    const entry: Record<string, string | number> = { wavelength: `${wl}nm` };
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
            <span>{lang === 'mr' ? 'चारा तपासणीचा डेमो' : lang === 'hi' ? 'चारा जाँच का डेमो' : 'FEED TEST DEMO'}</span>
          </div>
          <h2 className="text-2xl font-black text-[#1a1e1b]">{lang === 'mr' ? 'चारा नमुना तपासणी' : lang === 'hi' ? 'चारा नमूना जाँच' : 'Multi-Point NIR & Visual Screening'}</h2>
          <p className="text-xs text-stone-500 mt-1">
            {lang === 'mr' ? 'ही पाच नमुना-वक्र संगणकाने तयार केले आहेत. प्रत्यक्ष तपासणी यंत्र जोडलेले नाही.' : lang === 'hi' ? 'ये पाँच नमूना रेखाएँ सॉफ़्टवेयर ने बनाई हैं। असली जाँच उपकरण जुड़ा नहीं है।' : 'The backend generates five simulated curves for the selected demo scenario; no physical analyzer is connected.'}
          </p>
        </div>

        {!farmerMode && <div className="flex items-center space-x-3 bg-stone-50 px-4 py-2.5 rounded-xl border border-stone-200 text-xs">
          <div className="text-right">
            <div className="text-stone-500 font-medium">Sample Consistency</div>
            <div className="text-base font-black text-[#1b4332]">{evidence.metrics.sample_consistency}%</div>
          </div>
          <div className={`w-3 h-3 rounded-full ${evidence.metrics.sample_consistency > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
        </div>}
      </div>

      {farmerMode ? <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950"><strong>{lang === 'mr' ? 'डेमो नमुना' : lang === 'hi' ? 'डेमो नमूना' : 'Demo sample'}</strong><p className="mt-2">{lang === 'mr' ? 'खालील स्पेक्ट्रम सॉफ्टवेअरने तयार केले आहेत. प्रत्यक्ष चारा, कॅमेरा किंवा NIR उपकरण तपासलेले नाही. त्यामुळे हे आकडे निर्णयासाठी वापरू नका.' : lang === 'hi' ? 'ये स्पेक्ट्रम सॉफ़्टवेयर ने बनाए हैं। असली चारा, कैमरा या NIR उपकरण से जाँच नहीं हुई है। इन आँकड़ों से निर्णय न लें।' : 'The software generated these spectra. No real feed, camera or NIR device was used. Do not use these figures to make a feed decision.'}</p></div> : <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: 5-Point NIR Spectral Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-[#1a1e1b]">NIR Reflectance Spectrum (800nm - 1050nm)</h3>
              <p className="text-xs text-stone-500">Overlaid spectra across 5 sampling points. Diverging lines indicate non-uniform core sample.</p>
            </div>
            <span className="text-[11px] font-mono bg-[#1b4332] text-[#74c69d] px-2.5 py-1 rounded font-bold">
              SIMULATED · NO DEVICE
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
                <div className="text-xs font-black text-[#1b4332] mt-0.5">Simulated</div>
                <div className="text-[9px] text-emerald-600 font-medium">Not calibrated</div>
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

      <CameraAttachment batchId={data.batch_id} lang={lang} />

    </div>
  );
};
