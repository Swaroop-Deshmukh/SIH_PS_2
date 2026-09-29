"use client";

import React, { useState, useEffect } from 'react';
import { 
  Flame, Droplets, Thermometer, Clock, AlertTriangle, ShieldCheck, 
  TrendingUp, Play, FastForward, RotateCcw, Activity, ShieldAlert,
  ArrowUpRight, Info, CheckCircle2
} from 'lucide-react';
import { dictionary, Language } from '../lib/dictionary';
import { 
  BatchAnalyzeResponse, StorageTelemetry, SilageTelemetryReading,
  getSilageTelemetry, simulateSilageHour, resetSilageTelemetry 
} from '../lib/api';

interface SilageMonitorProps {
  lang: Language;
  data: BatchAnalyzeResponse;
  onTriggerAnomaly: (scenario: string) => void;
}

export const SilageMonitor: React.FC<SilageMonitorProps> = ({ lang, data, onTriggerAnomaly }) => {
  const t = dictionary[lang];
  const { batch_id, storage_telemetry: initialTelemetry } = data;

  const [telemetry, setTelemetry] = useState<StorageTelemetry>(initialTelemetry);
  const [timeSeries, setTimeSeries] = useState<SilageTelemetryReading[]>(
    initialTelemetry.recent_time_series || []
  );
  const [selectedPoint, setSelectedPoint] = useState<SilageTelemetryReading | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [alertNotification, setAlertNotification] = useState<string | null>(null);

  // Sync with batch data updates
  useEffect(() => {
    setTelemetry(data.storage_telemetry);
    if (data.storage_telemetry.recent_time_series && data.storage_telemetry.recent_time_series.length > 0) {
      setTimeSeries(data.storage_telemetry.recent_time_series);
    } else {
      // Fetch full longitudinal series from backend
      void getSilageTelemetry(batch_id)
        .then((res) => {
          if (res.summary) setTelemetry(res.summary);
          if (res.time_series) setTimeSeries(res.time_series.slice(-48));
        })
        .catch(() => {});
    }
  }, [batch_id, data.storage_telemetry]);

  const isWarning = 
    telemetry.status === "CRITICAL_WARNING" || 
    telemetry.temperature_celsius > 32 || 
    (telemetry.dT_dt && telemetry.dT_dt >= 0.35);

  const handleStepHour = async (triggerBreach: boolean = false) => {
    setIsSimulating(true);
    setAlertNotification(null);
    try {
      const res = await simulateSilageHour(batch_id, triggerBreach);
      setTelemetry(res.summary);
      setTimeSeries(res.recent_time_series);
      if (res.auto_transitioned) {
        setAlertNotification(res.transition_message || "Thermal runaway detected: Digital twin transitioned to RETEST_ALERT!");
      }
    } catch (e: any) {
      setAlertNotification(`Simulation error: ${e.message || e}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = async () => {
    setIsSimulating(true);
    setAlertNotification(null);
    try {
      const res = await resetSilageTelemetry(batch_id, data.scenario || "healthy");
      setTelemetry(res.summary);
      setTimeSeries(res.recent_time_series);
    } catch (e: any) {
      setAlertNotification(`Reset error: ${e.message || e}`);
    } finally {
      setIsSimulating(false);
    }
  };

  // SVG Chart Dimensions & Computations
  const chartHeight = 180;
  const chartWidth = 720;
  const padding = { top: 20, right: 30, bottom: 30, left: 45 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  const pointsToRender = timeSeries.length > 0 ? timeSeries : [];
  const minTemp = 16.0;
  const maxTemp = 42.0;

  const getX = (idx: number) => 
    padding.left + (pointsToRender.length > 1 ? (idx / (pointsToRender.length - 1)) * graphWidth : 0);
  
  const getY = (temp: number) => {
    const clamped = Math.max(minTemp, Math.min(maxTemp, temp));
    return padding.top + graphHeight - ((clamped - minTemp) / (maxTemp - minTemp)) * graphHeight;
  };

  const corePath = pointsToRender.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(pt.core_temp_c).toFixed(1)}`).join(' ');
  const ambientPath = pointsToRender.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(pt.ambient_temp_c).toFixed(1)}`).join(' ');
  const dangerThresholdY = getY(32.0);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>SILAGE LONGITUDINAL INTELLIGENCE & TELEMETRY ENGINE</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">PHASE 5 LIVE</span>
          </div>
          <h2 className="text-2xl font-black text-[#1a1e1b]">Silage Pit Core Telemetry & Aerobic Heating</h2>
          <p className="text-xs text-stone-500 mt-1">
            Continuous 168-hour sensor stream tracking core temperature, differential slope (dT/dt), cumulative heat units, and fermentation pH.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-[11px] font-mono px-3 py-1.5 rounded-xl font-bold ${
            isWarning ? 'bg-rose-900 text-rose-200' : 'bg-[#1b4332] text-[#74c69d]'
          }`}>
            {telemetry.status_label || telemetry.telemetry_badge}
          </span>
        </div>
      </div>

      {/* Alert Notification Toast */}
      {alertNotification && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between shadow-sm animate-pulse">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="font-semibold">{alertNotification}</span>
          </div>
          <button onClick={() => setAlertNotification(null)} className="text-stone-500 hover:text-stone-800 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Core Telemetry Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Core Temperature & Differential Slope (dT/dt) */}
        <div className={`p-5 rounded-2xl border shadow-sm transition-colors ${
          isWarning ? 'bg-rose-50/70 border-rose-300 text-rose-950' : 'bg-white border-stone-200'
        }`}>
          <div className="flex justify-between items-center text-xs font-semibold mb-2">
            <span className="text-stone-600 font-bold">Pit Core Temp</span>
            <Thermometer className={`w-4 h-4 ${isWarning ? 'text-rose-600' : 'text-emerald-700'}`} />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-3xl font-black ${isWarning ? 'text-rose-700' : 'text-[#1b4332]'}`}>
              {telemetry.temperature_celsius}°C
            </span>
            <span className="text-xs text-stone-500">
              (Amb: {telemetry.ambient_temp_c ?? 24.5}°C)
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
            <span className="font-medium text-stone-500">Heating Rate (dT/dt):</span>
            <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${
              (telemetry.dT_dt || 0) >= 0.35 ? 'bg-rose-200 text-rose-900' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {(telemetry.dT_dt || 0) > 0 ? `+${telemetry.dT_dt}` : telemetry.dT_dt ?? 0.0}°C/hr
            </span>
          </div>
        </div>

        {/* Fermentation pH */}
        <div className={`p-5 rounded-2xl border shadow-sm ${
          telemetry.ph > 4.4 ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-stone-200'
        }`}>
          <div className="flex justify-between items-center text-xs text-stone-600 font-bold mb-2">
            <span>Fermentation pH</span>
            <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded font-mono text-stone-600">Glass Sensor</span>
          </div>
          <div className={`text-3xl font-black ${telemetry.ph > 4.4 ? 'text-amber-700' : 'text-[#1b4332]'}`}>
            {telemetry.ph}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 font-medium flex items-center justify-between">
            <span>Target: 3.8 – 4.2</span>
            <span className={`font-bold ${telemetry.ph <= 4.2 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {telemetry.ph <= 4.2 ? 'Optimal Lactic' : 'Lactic Depletion'}
            </span>
          </div>
        </div>

        {/* Cumulative Heat Units & Aerobic Exposure */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex justify-between items-center text-xs text-stone-600 font-bold mb-2">
            <span>Cumulative Heat Units</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-3xl font-black text-[#1b4332]">
            {telemetry.cumulative_heat_units ?? 0.0}
            <span className="text-sm font-normal text-stone-500 ml-1">°C·hr</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1 font-medium flex items-center justify-between">
            <span>Safe Threshold: &lt; 40.0</span>
            <span className={`font-bold ${(telemetry.cumulative_heat_units || 0) > 40 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {(telemetry.cumulative_heat_units || 0) > 40 ? 'Nutrient Loss' : 'Protein Intact'}
            </span>
          </div>
        </div>

        {/* Shelf-Life Countdown & Bunk Mass */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex justify-between items-center text-xs text-stone-600 font-bold mb-2">
            <span>Aerobic Shelf-Life</span>
            <Clock className="w-4 h-4 text-stone-400" />
          </div>
          <div className={`text-3xl font-black ${
            (telemetry.shelf_life_hours_remaining ?? 168) < 24 ? 'text-rose-700' : 'text-[#1b4332]'
          }`}>
            {telemetry.shelf_life_hours_remaining ?? 168}
            <span className="text-sm font-normal text-stone-500 ml-1">hrs</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1 font-medium flex items-center justify-between">
            <span>Pit Zone Mass:</span>
            <span className="font-mono font-bold text-stone-700">{telemetry.feed_mass_kg ?? 5000} kg</span>
          </div>
        </div>

      </div>

      {/* Longitudinal 48-Hour Time-Series Temperature Chart */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
          <div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[#2d6a4f]" />
              <h3 className="text-base font-bold text-[#1a1e1b]">Longitudinal Thermal Trend: Pit Core vs Ambient Diurnal Cycle</h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Numerical differential slope calculated over sliding 3-hour window. Shaded area indicates aerobic spoilage threshold (&gt;32°C).
            </p>
          </div>
          
          <div className="flex items-center space-x-4 text-xs font-medium">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-[#1b4332]" />
              <span className="text-stone-700 font-semibold">Silage Core Temp</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-stone-400 border-t border-dashed border-stone-500" />
              <span className="text-stone-500">Ambient Baseline</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-2 rounded bg-rose-200 border border-rose-300" />
              <span className="text-rose-700 font-bold">&gt;32°C Risk Zone</span>
            </div>
          </div>
        </div>

        {/* SVG Curve Container */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[640px]">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 overflow-visible font-sans">
              
              {/* Danger Zone Shading (>32°C) */}
              <rect 
                x={padding.left} 
                y={padding.top} 
                width={graphWidth} 
                height={Math.max(0, dangerThresholdY - padding.top)} 
                fill="#fecdd3" 
                fillOpacity="0.35" 
              />
              <line 
                x1={padding.left} 
                y1={dangerThresholdY} 
                x2={padding.left + graphWidth} 
                y2={dangerThresholdY} 
                stroke="#e11d48" 
                strokeDasharray="4 3" 
                strokeWidth="1.2" 
              />
              <text 
                x={padding.left + graphWidth - 6} 
                y={dangerThresholdY - 4} 
                textAnchor="end" 
                fontSize="9" 
                fill="#be123c" 
                fontWeight="bold"
              >
                Critical Heating Limit (32°C)
              </text>

              {/* Y-Axis Grid Lines and Labels */}
              {[20, 25, 30, 35, 40].map((temp) => {
                const y = getY(temp);
                return (
                  <g key={temp}>
                    <line 
                      x1={padding.left} 
                      y1={y} 
                      x2={padding.left + graphWidth} 
                      y2={y} 
                      stroke="#f1f5f9" 
                      strokeWidth="1" 
                    />
                    <text 
                      x={padding.left - 8} 
                      y={y + 3} 
                      textAnchor="end" 
                      fontSize="10" 
                      fill="#94a3b8" 
                      fontFamily="monospace"
                    >
                      {temp}°
                    </text>
                  </g>
                );
              })}

              {/* Ambient Baseline Curve (Dashed) */}
              {pointsToRender.length > 0 && (
                <path 
                  d={ambientPath} 
                  fill="none" 
                  stroke="#94a3b8" 
                  strokeWidth="1.5" 
                  strokeDasharray="3 3" 
                />
              )}

              {/* Silage Core Temperature Curve */}
              {pointsToRender.length > 0 && (
                <path 
                  d={corePath} 
                  fill="none" 
                  stroke={isWarning ? '#e11d48' : '#1b4332'} 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              )}

              {/* Interactive Data Points */}
              {pointsToRender.map((pt, i) => {
                const cx = getX(i);
                const cy = getY(pt.core_temp_c);
                const isSelected = selectedPoint?.hour_offset === pt.hour_offset;
                const isCritical = pt.core_temp_c >= 32.0;

                return (
                  <circle
                    key={pt.hour_offset}
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 6 : isCritical ? 4 : 2.5}
                    fill={isCritical ? '#e11d48' : '#1b4332'}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 2 : 1}
                    className="cursor-pointer transition-transform hover:scale-150"
                    onClick={() => setSelectedPoint(pt)}
                  />
                );
              })}

              {/* X-Axis Timeline Labels */}
              {pointsToRender.length > 0 && [0, Math.floor(pointsToRender.length / 2), pointsToRender.length - 1].map((idx) => {
                if (!pointsToRender[idx]) return null;
                const pt = pointsToRender[idx];
                const x = getX(idx);
                const timeLabel = new Date(pt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <text 
                    key={idx} 
                    x={x} 
                    y={chartHeight - 8} 
                    textAnchor={idx === 0 ? 'start' : idx === pointsToRender.length - 1 ? 'end' : 'middle'} 
                    fontSize="10" 
                    fill="#64748b" 
                    fontFamily="monospace"
                  >
                    H-{pointsToRender.length - idx} ({timeLabel})
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Reading Inspector */}
        {selectedPoint && (
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-stone-700">Reading Inspector:</span>
              <span className="font-mono text-stone-500">
                {new Date(selectedPoint.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 font-mono">
              <span>Core: <b>{selectedPoint.core_temp_c}°C</b></span>
              <span>Ambient: <b>{selectedPoint.ambient_temp_c}°C</b></span>
              <span>pH: <b>{selectedPoint.ph}</b></span>
              <span>dT/dt: <b>+{selectedPoint.dT_dt}°C/hr</b></span>
              <span>Heat: <b>{selectedPoint.cumulative_heat_units}°C·hr</b></span>
            </div>
            <button onClick={() => setSelectedPoint(null)} className="text-stone-400 hover:text-stone-700 text-xs font-bold">Close</button>
          </div>
        )}

      </div>

      {/* Advisory & Spoilage Anomaly Banner */}
      <div className={`p-5 rounded-2xl border space-y-2 ${
        isWarning 
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-950' 
          : 'bg-emerald-50 border-emerald-200 text-emerald-950'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 font-bold text-sm">
            {isWarning ? <AlertTriangle className="w-5 h-5 text-rose-600" /> : <ShieldCheck className="w-5 h-5 text-emerald-700" />}
            <span className={isWarning ? 'text-rose-800' : 'text-emerald-800'}>
              {telemetry.status_label || (isWarning ? 'STORAGE ANOMALY ALERT DETECTED' : 'STORAGE ENVIRONMENT OPTIMAL')}
            </span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/80 border border-stone-200 font-bold">
            Risk Score: {telemetry.spoilage_risk_index}/100
          </span>
        </div>
        <p className="text-xs font-medium leading-relaxed">
          {telemetry.advisory_message || (
            isWarning 
              ? `Silage pit face temperature is elevated (${telemetry.temperature_celsius}°C) with pH ${telemetry.ph}. Aerobic deterioration and secondary yeast fermentation indicated.` 
              : `Anaerobic seal intact. Core temperatures remain buffered against diurnal ambient fluctuations. Fermentation pH (${telemetry.ph}) indicates stable lactic preservation.`
          )}
        </p>
        <div className="pt-2 text-xs font-bold flex items-center space-x-1.5 text-stone-800">
          <ArrowUpRight className="w-4 h-4 text-emerald-700" />
          <span>Recommended Action: {telemetry.recommended_action || "Continue daily feed-out monitoring."}</span>
        </div>
      </div>

      {/* Live Sensor Stream Simulation Control Station (For Hackathon Demonstration) */}
      <div className="bg-stone-900 text-white p-6 rounded-2xl border border-stone-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-[#74c69d]" />
            <h3 className="text-base font-bold text-[#74c69d]">Virtual Silage Pit Node Simulator</h3>
          </div>
          <span className="text-xs bg-stone-800 text-stone-300 font-mono px-2.5 py-1 rounded-lg">
            STREAM CONTROLLER
          </span>
        </div>

        <p className="text-xs text-stone-300">
          Simulate real-time streaming sensor inputs to demonstrate dynamic heating slope detection (dT/dt) and automated digital twin state transitions:
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleStepHour(false)}
            disabled={isSimulating}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#1b4332] text-emerald-200 border border-[#40916c] text-xs font-bold hover:bg-[#2d6a4f] disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulate +1 Hour (Normal Stable)</span>
          </button>

          <button
            onClick={() => handleStepHour(true)}
            disabled={isSimulating}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-rose-950 text-rose-200 border border-rose-700 text-xs font-bold hover:bg-rose-900 disabled:opacity-50"
          >
            <FastForward className="w-3.5 h-3.5 text-rose-400" />
            <span>Simulate Tarp Puncture (Trigger Aerobic Heating)</span>
          </button>

          <button
            onClick={handleReset}
            disabled={isSimulating}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-stone-800 text-stone-300 border border-stone-700 text-xs font-bold hover:bg-stone-700 disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Telemetry Series</span>
          </button>
        </div>

        {/* Preset Demo States */}
        <div className="pt-3 border-t border-stone-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-400 font-semibold mr-1">Judge Scenario Presets:</span>
          <button
            onClick={() => onTriggerAnomaly('healthy')}
            className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-emerald-400 text-[11px] font-bold"
          >
            Healthy (24°C, pH 3.9)
          </button>
          <button
            onClick={() => onTriggerAnomaly('storage_warning')}
            className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-rose-400 text-[11px] font-bold"
          >
            Heating Spoilage (36°C, pH 4.8)
          </button>
          <button
            onClick={() => onTriggerAnomaly('adulteration')}
            className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-purple-400 text-[11px] font-bold"
          >
            Alkaline Anomaly (pH 6.8)
          </button>
        </div>
      </div>

    </div>
  );
};
