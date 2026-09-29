"use client";

import React, { useEffect, useState } from "react";
import { Cpu, Award, Zap, CheckCircle2, RefreshCw, BarChart2, ShieldCheck, Database, Wrench } from "lucide-react";
import { getHardwareDiagnostics, getHardwareDevices, getModelComparison } from "../lib/api";
import { Language } from "../lib/dictionary";

interface ModelBenchmarksProps {
  lang: Language;
}

export const ModelBenchmarks: React.FC<ModelBenchmarksProps> = ({ lang }) => {
  const [benchmarks, setBenchmarks] = useState<any | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [diagnostics, setDiagnostics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [testingDiagnostics, setTestingDiagnostics] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [bData, devData, diagData] = await Promise.all([
        getModelComparison(),
        getHardwareDevices(),
        getHardwareDiagnostics(),
      ]);
      setBenchmarks(bData);
      setDevices(devData);
      setDiagnostics(diagData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const runDiagnostics = async () => {
    setTestingDiagnostics(true);
    try {
      const res = await getHardwareDiagnostics();
      setDiagnostics(res);
    } catch (err) {
      console.error(err);
    } finally {
      setTestingDiagnostics(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#2d6a4f] uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Prototype Benchmark · Illustrative Comparison</span>
          </div>
          <h2 className="text-2xl font-black text-stone-900 mt-1">Algorithm Evaluation & Hardware HAL</h2>
          <p className="text-xs text-stone-600 mt-1">
            Comparative evaluation of PLSR against decision tree and boosting ensembles on synthetic reference spectra, paired with Hardware Abstraction Layer (HAL) self-tests.
          </p>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={testingDiagnostics}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-bold transition disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${testingDiagnostics ? "animate-spin" : ""}`} />
          Run Hardware Self-Test (POST)
        </button>
      </div>

      {/* Scientific Honesty Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-amber-950">Scientific Transparency Notice (SIH 2026 Prototype)</div>
          <div className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
            The comparative metrics below represent performance on a <strong>synthetic reference fodder calibration library</strong>. 
            They illustrate chemometrics architectural trade-offs (inference speed, latent OOD distance calculation, and non-linear fitting). 
            They are not claimed as on-field certified accuracy; field deployment requires local Indian wet-chemistry reference calibration (AOAC / ISO methods).
          </div>
        </div>
      </div>

      {/* Model Benchmarks Table */}
      {benchmarks && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Illustrative Machine Learning Comparison</h3>
              <p className="text-xs text-stone-500">{benchmarks.calibration_set}</p>
            </div>
            <span className="text-[11px] font-bold text-[#2d6a4f] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              ISO 12099 / ASTM E1655 Aligned Workflow
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Algorithm</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3 text-center">R² Score</th>
                  <th className="py-3 px-3 text-center">RMSEP (CP %)</th>
                  <th className="py-3 px-3 text-center">Latency</th>
                  <th className="py-3 px-3">OOD Capability</th>
                  <th className="py-3 px-3">Prototype Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {Object.entries(benchmarks.models).map(([key, m]: [string, any]) => {
                  const isPlsr = key === "plsr";
                  return (
                    <tr key={key} className={isPlsr ? "bg-emerald-50/50 font-medium" : ""}>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-stone-900">{m.name}</div>
                        <div className="text-[10px] text-stone-500">{m.deployment_target}</div>
                      </td>
                      <td className="py-3.5 px-3 text-stone-600">{m.type}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-stone-900">{m.r2_score}</td>
                      <td className="py-3.5 px-3 text-center font-bold text-stone-900">{m.rmsep}%</td>
                      <td className="py-3.5 px-3 text-center font-mono text-[#2d6a4f] font-bold">{m.inference_latency_ms} ms</td>
                      <td className="py-3.5 px-3 text-[11px] text-stone-600">{m.ood_capability}</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isPlsr
                              ? "bg-emerald-600 text-white"
                              : "bg-stone-100 text-stone-700 border border-stone-200"
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 text-xs">
            <strong className="text-stone-900">Engineering Rationale: </strong>
            {benchmarks.conclusion}
          </div>
        </div>
      )}

      {/* Hardware Abstraction Layer & Device Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {devices.map((dev) => {
          const diag = diagnostics?.diagnostics?.[
            dev.sensor_id.startsWith("NIR") ? "nir" : dev.sensor_id.startsWith("CAM") ? "camera" : "trough"
          ];

          return (
            <div key={dev.sensor_id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono text-stone-500 font-bold">{dev.sensor_id}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {dev.status}
                  </span>
                </div>
                <h3 className="font-bold text-stone-900 text-sm">{dev.model_name}</h3>
                <div className="text-[11px] text-stone-500 mt-1">{dev.hardware_mode}</div>

                {diag && (
                  <div className="mt-4 pt-3 border-t border-stone-100 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-500">POST Test:</span>
                      <span className="font-bold text-emerald-700">{diag.self_test}</span>
                    </div>
                    {diag.lamp_intensity_pct && (
                      <div className="flex justify-between">
                        <span className="text-stone-500">Lamp Intensity:</span>
                        <span className="font-mono font-bold text-stone-800">{diag.lamp_intensity_pct}%</span>
                      </div>
                    )}
                    {diag.detector_temperature_c && (
                      <div className="flex justify-between">
                        <span className="text-stone-500">Detector Temp:</span>
                        <span className="font-mono font-bold text-stone-800">{diag.detector_temperature_c}°C</span>
                      </div>
                    )}
                    {diag.focal_distance_mm && (
                      <div className="flex justify-between">
                        <span className="text-stone-500">Focal Distance:</span>
                        <span className="font-mono font-bold text-stone-800">{diag.focal_distance_mm} mm</span>
                      </div>
                    )}
                    {diag.battery_mv && (
                      <div className="flex justify-between">
                        <span className="text-stone-500">Battery Level:</span>
                        <span className="font-mono font-bold text-stone-800">{diag.battery_mv} mV</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-2.5 border-t border-stone-100 text-[10px] text-stone-400 font-mono">
                Calibrated: {new Date(dev.last_calibration).toLocaleTimeString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
