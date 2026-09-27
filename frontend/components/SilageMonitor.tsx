"use client";

import React from 'react';
import { Flame, Droplets, Thermometer, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { dictionary, Language } from '../lib/dictionary';
import { BatchAnalyzeResponse } from '../lib/api';

interface SilageMonitorProps {
  lang: Language;
  data: BatchAnalyzeResponse;
  onTriggerAnomaly: (scenario: string) => void;
}

export const SilageMonitor: React.FC<SilageMonitorProps> = ({ lang, data, onTriggerAnomaly }) => {
  const t = dictionary[lang];
  const { storage_telemetry } = data;
  const isWarning = storage_telemetry.status === "CRITICAL_WARNING" || storage_telemetry.temperature_celsius > 32;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>SILAGE INTELLIGENCE & TELEMETRY ENGINE</span>
          </div>
          <h2 className="text-2xl font-black text-[#1a1e1b]">Silage Storage Pit Monitoring</h2>
          <p className="text-xs text-stone-500 mt-1">
            Real-time simulated telemetry tracking fermentation pH, pit temperature heating, moisture content & aerobic exposure.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono bg-[#1b4332] text-[#74c69d] px-3 py-1.5 rounded-xl font-bold">
            {storage_telemetry.telemetry_badge}
          </span>
        </div>
      </div>

      {/* Telemetry Sensor Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* pH Level */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex justify-between items-center text-xs text-stone-500 font-semibold mb-2">
            <span>Fermentation pH</span>
            <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded font-mono">Pit Sensor</span>
          </div>
          <div className="text-3xl font-black text-[#1b4332]">{storage_telemetry.ph}</div>
          <div className="text-[11px] text-stone-500 mt-1 font-medium">
            Ideal range: 3.8 – 4.2
          </div>
        </div>

        {/* Temperature */}
        <div className={`p-5 rounded-2xl border shadow-sm ${storage_telemetry.temperature_celsius > 32 ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-white border-stone-200'}`}>
          <div className="flex justify-between items-center text-xs font-semibold mb-2">
            <span className="text-stone-500">Pit Temperature</span>
            <Thermometer className={`w-4 h-4 ${storage_telemetry.temperature_celsius > 32 ? 'text-rose-600' : 'text-stone-400'}`} />
          </div>
          <div className={`text-3xl font-black ${storage_telemetry.temperature_celsius > 32 ? 'text-rose-700' : 'text-[#1b4332]'}`}>
            {storage_telemetry.temperature_celsius}°C
          </div>
          <div className="text-[11px] mt-1 font-medium">
            {storage_telemetry.temperature_celsius > 32 ? 'Heating warning active' : 'Stable temperature'}
          </div>
        </div>

        {/* Moisture & Humidity */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex justify-between items-center text-xs text-stone-500 font-semibold mb-2">
            <span>Silage Moisture</span>
            <Droplets className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-3xl font-black text-[#1b4332]">{storage_telemetry.moisture_pct}%</div>
          <div className="text-[11px] text-stone-500 mt-1 font-medium">
            Air Humidity: {storage_telemetry.humidity_pct}%
          </div>
        </div>

        {/* Exposure Duration */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex justify-between items-center text-xs text-stone-500 font-semibold mb-2">
            <span>Air Exposure</span>
            <Clock className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-3xl font-black text-[#1b4332]">{storage_telemetry.exposure_days} Days</div>
          <div className="text-[11px] text-stone-500 mt-1 font-medium">
            Spoilage Risk: {storage_telemetry.spoilage_risk_index}/100
          </div>
        </div>

      </div>

      {/* Spoilage Risk Warning Banner */}
      {isWarning && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-950 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-sm text-rose-800">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>STORAGE ANOMALY ALERT DETECTED</span>
          </div>
          <p className="text-xs font-medium leading-relaxed">
            Silage pit face temperature is elevated ({storage_telemetry.temperature_celsius}°C) with pH {storage_telemetry.ph}. Aerobic deterioration and secondary yeast fermentation indicated. Inspect trench face for oxygen leakage.
          </p>
        </div>
      )}

      {/* Telemetry Scenario Trigger Controller for Judges */}
      <div className="bg-stone-900 text-white p-6 rounded-2xl border border-stone-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <h3 className="text-base font-bold text-[#74c69d]">Telemetry Anomaly Trigger (Demo Controls)</h3>
          <span className="text-xs text-stone-400 font-mono">SIMULATION LAYER</span>
        </div>

        <p className="text-xs text-stone-300">
          Select a telemetry state to simulate real-time sensor shifts during your presentation:
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onTriggerAnomaly('healthy')}
            className="px-4 py-2 rounded-xl bg-[#1b4332] text-emerald-300 border border-[#40916c] text-xs font-bold hover:bg-[#2d6a4f]"
          >
            Simulate Normal Telemetry (24.5°C, pH 4.0)
          </button>
          <button
            onClick={() => onTriggerAnomaly('storage_warning')}
            className="px-4 py-2 rounded-xl bg-orange-950 text-orange-300 border border-orange-700 text-xs font-bold hover:bg-orange-900"
          >
            Trigger Heating & Spoilage Warning (33.4°C, pH 4.8)
          </button>
          <button
            onClick={() => onTriggerAnomaly('adulteration')}
            className="px-4 py-2 rounded-xl bg-purple-950 text-purple-300 border border-purple-700 text-xs font-bold hover:bg-purple-900"
          >
            Trigger High pH Anomaly (pH 6.8 - Urea Hydrolysis)
          </button>
        </div>
      </div>

    </div>
  );
};
