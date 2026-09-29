"use client";

import React, { useEffect, useState } from "react";
import {
  Cpu, Thermometer, Droplets, Scale, Clock, Battery, AlertTriangle,
  CheckCircle2, RefreshCw, Sliders, ShieldCheck, Activity, Radio
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { FeedZoneData, getFeedZone, calibrateFeedZone } from "../lib/api";
import { Language } from "../lib/dictionary";

interface SmartFeedZoneProps {
  lang: Language;
  scenario: string;
  feedType: string;
}

export const SmartFeedZone: React.FC<SmartFeedZoneProps> = ({
  lang,
  scenario,
  feedType,
}) => {
  const [data, setData] = useState<FeedZoneData | null>(null);
  const [loading, setLoading] = useState(true);
  const [calibrating, setCalibrating] = useState(false);
  const [calibMessage, setCalibMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFeedZone("ZONE-01", scenario, feedType);
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load Smart Feed Zone node telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [scenario, feedType]);

  const handleCalibrate = async () => {
    setCalibrating(true);
    setCalibMessage(null);
    try {
      const res = await calibrateFeedZone("ZONE-01");
      setCalibMessage(res.message || "Scale zero-point tared and DHT baseline updated.");
      setTimeout(() => setCalibMessage(null), 4000);
      await fetchData();
    } catch (err) {
      setCalibMessage("Calibration signal failed to acknowledge.");
    } finally {
      setCalibrating(false);
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "CRITICAL":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white animate-pulse">CRITICAL SPOILAGE RISK</span>;
      case "INSPECT":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white">INSPECTION RECOMMENDED</span>;
      case "WATCH":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500 text-stone-900">ELEVATED CONDITIONS (WATCH)</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">SAFE OPERATING RANGE (STABLE)</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#2d6a4f] uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>IoT Edge Hardware Node · ESP32 + DHT22 + HX711</span>
          </div>
          <h2 className="text-2xl font-black text-stone-900 mt-1">Smart Feed Zone Node (Trough-01)</h2>
          <p className="text-xs text-stone-600 mt-1">
            Low-cost barn-mounted sensor node continuously monitoring ambient microclimate, trough load, and feed exposure time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCalibrate}
            disabled={calibrating || loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition disabled:opacity-50"
          >
            <Sliders className="w-3.5 h-3.5" />
            {calibrating ? "Zeroing..." : "Tare / Calibrate Scale"}
          </button>
          <button
            onClick={() => void fetchData()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-bold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {calibMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{calibMessage}</span>
        </div>
      )}

      {/* Scientific Measurement Boundary Notice */}
      <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-stone-700 text-xs flex items-start gap-2.5">
        <ShieldCheck className="w-5 h-5 text-[#2d6a4f] shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-stone-900">Functional Scope & Boundary Notice</div>
          <div className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
            The Smart Feed Zone node monitors <strong>environmental microclimate (temperature, humidity)</strong> and <strong>trough feed weight</strong>. 
            It is an early-warning physical condition monitor. It does <strong>NOT</strong> directly assay aflatoxin, mycotoxins, chemical mould species, or dietary crude protein. 
            Elevated risk flags indicate potential aerobic spoilage risk; physical olfactory and visual inspection is always required before feeding.
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Status banner */}
          <div className="bg-gradient-to-r from-[#122b20] to-[#1b4332] text-white p-5 rounded-2xl border border-[#52b788]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 text-emerald-300">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#74c69d] font-bold">NODE: {data.zone_id}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-stone-300 font-mono">
                    {data.data_badge}
                  </span>
                </div>
                <div className="text-sm font-bold mt-1 text-white">{data.risk_label}</div>
              </div>
            </div>
            <div>{getRiskBadge(data.risk_status)}</div>
          </div>

          {/* Real-time Metric Gauges Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            {/* Temperature */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
                <span>Temperature</span>
                <Thermometer className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-stone-900 mt-2">
                {data.temperature_celsius.toFixed(1)}°C
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                Threshold: &gt; {data.thresholds.temp_critical_c}°C
              </div>
            </div>

            {/* Humidity */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
                <span>Relative Humidity</span>
                <Droplets className="w-4 h-4 text-cyan-600" />
              </div>
              <div className="text-2xl font-black text-stone-900 mt-2">
                {data.humidity_pct.toFixed(1)}%
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                Critical: &gt; {data.thresholds.humidity_critical_pct}%
              </div>
            </div>

            {/* Feed Remaining */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
                <span>Feed in Trough</span>
                <Scale className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-[#1b4332] mt-2">
                {data.feed_remaining_kg.toFixed(2)} kg
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                HX711 24-bit Load Cell
              </div>
            </div>

            {/* Exposure Time */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
                <span>Exposure Time</span>
                <Clock className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-stone-900 mt-2">
                {data.exposure_hours.toFixed(1)} hrs
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                Safe limit: &lt; {data.thresholds.max_safe_exposure_h} hrs
              </div>
            </div>

            {/* Battery */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm col-span-2 md:col-span-1">
              <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
                <span>Node Battery</span>
                <Battery className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-stone-900 mt-2">
                {data.battery_pct}%
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                Li-ion 18650 3.7V Node
              </div>
            </div>
          </div>

          {/* 6-Hour Trend Chart */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Trough Microclimate Trend (Last 6 Hours)</h3>
                <p className="text-xs text-stone-500">Hourly temperature and humidity telemetry recorded at trough face</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-amber-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Temp (°C)
                </span>
                <span className="flex items-center gap-1.5 text-cyan-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> Humidity (%)
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9" />
                  <XAxis dataKey="timestamp" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="temp" domain={[15, 45]} tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="humidity" orientation="right" domain={[30, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#e5e7eb" }} />
                  <Line yAxisId="temp" type="monotone" dataKey="temperature_celsius" stroke="#d97706" strokeWidth={2.5} dot={{ r: 4 }} name="Temp (°C)" />
                  <Line yAxisId="humidity" type="monotone" dataKey="humidity_pct" stroke="#0891b2" strokeWidth={2.5} dot={{ r: 4 }} name="Humidity (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Events & Hardware Specification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Event log */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#2d6a4f]" />
                <span>Recent Trough Events</span>
              </h3>
              <div className="space-y-2.5">
                {data.recent_events.map((evt, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-start justify-between text-xs">
                    <div>
                      <div className="font-bold text-stone-800">{evt.description}</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">{evt.event_type}</div>
                    </div>
                    <time className="text-[10px] font-mono text-stone-400 shrink-0">{evt.timestamp}</time>
                  </div>
                ))}
              </div>
            </div>

            {/* Hardware Specification card */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#2d6a4f]" />
                <span>Low-Cost Hardware Specification</span>
              </h3>
              <dl className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                  <dt className="text-stone-500 font-bold text-[10px] uppercase">Microcontroller</dt>
                  <dd className="font-bold text-stone-900 mt-1">{data.hardware_spec.mcu}</dd>
                </div>
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                  <dt className="text-stone-500 font-bold text-[10px] uppercase">Sensors Included</dt>
                  <dd className="font-bold text-stone-900 mt-1">{data.hardware_spec.sensors}</dd>
                </div>
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                  <dt className="text-stone-500 font-bold text-[10px] uppercase">Wireless Protocol</dt>
                  <dd className="font-bold text-stone-900 mt-1">{data.hardware_spec.communication}</dd>
                </div>
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                  <dt className="text-stone-500 font-bold text-[10px] uppercase">Target BoM Cost</dt>
                  <dd className="font-bold text-emerald-700 mt-1 font-mono">₹{data.hardware_spec.target_cost_inr} INR</dd>
                </div>
              </dl>
              <p className="text-[11px] text-stone-500 mt-3 italic">
                Designed for affordable deployment in Indian dairy sheds. Integrates seamlessly with FeedSure 360 mobile app via Bluetooth Low Energy (BLE) and Wi-Fi.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
