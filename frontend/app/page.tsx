"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { 
  AlertTriangle, Wifi, WifiOff, RefreshCw, ChevronLeft, ChevronRight, 
  Play, Pause, RotateCcw, Clock, Trophy, CheckCircle2, ArrowRight 
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { ScenarioBar } from "../components/ScenarioBar";
import { LandingPage } from "../components/LandingPage";
import { Dashboard } from "../components/Dashboard";
import { FeedTypeMatrix } from "../components/FeedTypeMatrix";
import { MultiPointSampling } from "../components/MultiPointSampling";
import { EvidencePanel } from "../components/EvidencePanel";
import { NutritionResultsPanel } from "../components/NutritionResultsPanel";
import { CameraAttachment } from "../components/CameraAttachment";
import { DairyRationAssessor } from "../components/DairyRationAssessor";
import { SilageMonitor } from "../components/SilageMonitor";
import { DigitalTwinPassport } from "../components/DigitalTwinPassport";
import { 
  analyzeBatch, checkApiHealth, FarmContext, getFarmContext, 
  BatchAnalyzeResponse, saveFarmContext, FeedType, ScenarioId, ApiHealth 
} from "../lib/api";
import { dictionary, Language } from "../lib/dictionary";

// Unified 8-Screen SIH Pitch Walkthrough Definition
const SIH_PITCH_STEPS = [
  { id: "dashboard", stepNum: 1, title: "1. Executive Dashboard", short: "Dashboard", desc: "Herd Health & Rapid Alert Feed" },
  { id: "feed-type", stepNum: 2, title: "2. Feed Matrix Selection", short: "Feed Type", desc: "Agronomic Baselines & Intake Matrix" },
  { id: "nir-scan", stepNum: 3, title: "3. NIR Multi-Point Scan", short: "NIR Scan", desc: "3×3 Spatial Grid & CV Heterogeneity Engine" },
  { id: "evidence", stepNum: 4, title: "4. Multi-Sensor Evidence", short: "Evidence Check", desc: "Sufficiency Score & Mahalanobis DM Gating" },
  { id: "nutrition", stepNum: 5, title: "5. Chemometrics Nutrition", short: "Nutrition", desc: "PLSR Predictions & 95% Confidence Uncertainty Bands" },
  { id: "camera", stepNum: 6, title: "6. Camera Screening", short: "Camera & Urea", desc: "22-D Vision Texture, Mould & Urea Colorimeter" },
  { id: "ration", stepNum: 7, title: "7. Dairy Ration Advisory", short: "Ration Advisory", desc: "ICAR/NRC Balancer & Vernacular Advice" },
  { id: "passport", stepNum: 8, title: "8. Quality Passport & IoT", short: "Quality Passport", desc: "Flieg Fermentation Index, SHA-256 Ledger & QR Card" },
];

export default function Home() {
  const [lang, setLang] = useState<Language>("en");
  const [farmerMode, setFarmerMode] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [scenario, setScenario] = useState<ScenarioId>("healthy");
  const [feedType, setFeedType] = useState<FeedType>("Maize Silage");
  const [data, setData] = useState<BatchAnalyzeResponse | null>(null);
  const [farmContext, setFarmContext] = useState<FarmContext | null>(null);
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [loadingContext, setLoadingContext] = useState(true);
  const [loading, setLoading] = useState(false);
  const [savingContext, setSavingContext] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 3-Minute SIH Judge Pitch Flow State
  const [pitchMode, setPitchMode] = useState(true);
  const [pitchSeconds, setPitchSeconds] = useState(180); // 3 minutes = 180 seconds
  const [timerRunning, setTimerRunning] = useState(false);

  const requestId = useRef(0);
  const t = dictionary[lang];

  // 3-Minute Pitch Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && pitchSeconds > 0) {
      interval = setInterval(() => {
        setPitchSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (pitchSeconds === 0) {
      setTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, pitchSeconds]);

  // Current Step Index in the 8-Screen Flow
  const currentStepIndex = Math.max(
    0,
    SIH_PITCH_STEPS.findIndex((s) => s.id === activeTab)
  );

  const handleNextStep = useCallback(() => {
    const nextIdx = (currentStepIndex + 1) % SIH_PITCH_STEPS.length;
    setActiveTab(SIH_PITCH_STEPS[nextIdx].id);
  }, [currentStepIndex]);

  const handlePrevStep = useCallback(() => {
    const prevIdx = (currentStepIndex - 1 + SIH_PITCH_STEPS.length) % SIH_PITCH_STEPS.length;
    setActiveTab(SIH_PITCH_STEPS[prevIdx].id);
  }, [currentStepIndex]);

  // Keyboard navigation hotkeys (Left Arrow / Right Arrow)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight") {
        handleNextStep();
      } else if (e.key === "ArrowLeft") {
        handlePrevStep();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNextStep, handlePrevStep]);

  const refreshContext = useCallback(async () => {
    setLoadingContext(true);
    setError(null);
    try {
      const [context, apiHealth] = await Promise.all([getFarmContext(), checkApiHealth()]);
      setFarmContext(context);
      setHealth(apiHealth);
    } catch (cause) {
      setHealth(null);
      setError(cause instanceof Error ? cause.message : "Could not connect to the FeedSure API.");
    } finally {
      setLoadingContext(false);
    }
  }, []);

  useEffect(() => { void refreshContext(); }, [refreshContext]);

  const loadBatchData = useCallback(async () => {
    if (!farmContext) return;
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeBatch(feedType, scenario, farmContext);
      if (id === requestId.current) setData(result);
    } catch (cause) {
      if (id === requestId.current) {
        setData(null);
        setError(cause instanceof Error ? cause.message : "Analysis failed.");
      }
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [farmContext, feedType, scenario]);

  useEffect(() => { void loadBatchData(); }, [loadBatchData]);

  const handleSaveContext = async (updated: FarmContext) => {
    setSavingContext(true);
    try {
      const saved = await saveFarmContext(updated);
      setFarmContext(saved);
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save farm details.");
      return false;
    } finally { 
      setSavingContext(false); 
    }
  };

  // Safe tab switcher that also handles backward-compatible aliases
  const switchTab = (tabId: string) => {
    if (tabId === "testing") {
      setActiveTab("nir-scan");
    } else if (tabId === "silage" || tabId === "twin") {
      setActiveTab("passport");
    } else {
      setActiveTab(tabId);
    }
  };

  const minutes = Math.floor(pitchSeconds / 60);
  const seconds = pitchSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1e1b] flex flex-col font-sans">
      <Navbar 
        lang={lang} 
        setLang={setLang} 
        farmerMode={farmerMode} 
        setFarmerMode={setFarmerMode} 
        activeTab={activeTab} 
        setActiveTab={switchTab} 
      />

      {/* Subheader Status Ribbon */}
      <div className="bg-[#122b20] px-4 py-2 text-xs text-emerald-50 no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#74c69d]">SIH 2026 PS 26111</span>
            <span className="text-stone-400">·</span>
            <span>Ministry of Fisheries, Animal Husbandry &amp; Dairying</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setPitchMode(!pitchMode)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition flex items-center gap-1.5 ${
                pitchMode
                  ? "bg-emerald-500 text-stone-950 shadow-sm"
                  : "bg-stone-800 text-stone-300 hover:text-white"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>{pitchMode ? "Judge Pitch Mode: ON" : "Judge Pitch Mode: OFF"}</span>
            </button>

            <span className="flex items-center gap-1.5" title={health?.data_mode ?? "API unavailable"}>
              {health ? <Wifi className="w-3.5 h-3.5 text-emerald-300" /> : <WifiOff className="w-3.5 h-3.5 text-amber-300" />}
              {health ? "AI Engine Connected" : "Disconnected"}
            </span>
          </div>
        </div>
      </div>

      {/* Scenario Bar */}
      {activeTab !== "landing" && !farmerMode && (
        <div className="no-print">
          <ScenarioBar 
            lang={lang} 
            currentScenario={scenario} 
            onSelectScenario={(value) => setScenario(value as ScenarioId)} 
            loading={loading} 
          />
        </div>
      )}

      {/* 3-Minute SIH Judge Pitch Walkthrough Floating/Sticky Controller */}
      {pitchMode && activeTab !== "landing" && (
        <section className="bg-white border-b-2 border-emerald-600/30 shadow-md py-3 px-4 sticky top-16 z-40 no-print">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* Pitch Step Header */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1b4332] text-[#74c69d] font-black text-sm flex items-center justify-center shrink-0">
                {currentStepIndex + 1}/8
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    3-MIN JUDGE FLOW
                  </span>
                  <span className="text-xs font-bold text-stone-900">
                    {SIH_PITCH_STEPS[currentStepIndex].title}
                  </span>
                </div>
                <div className="text-[11px] text-stone-500">
                  {SIH_PITCH_STEPS[currentStepIndex].desc}
                </div>
              </div>
            </div>

            {/* Stepper Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
              {SIH_PITCH_STEPS.map((s, idx) => {
                const isActive = activeTab === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => switchTab(s.id)}
                    title={s.title}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all ${
                      isActive
                        ? "bg-[#1b4332] text-white shadow-sm scale-105"
                        : "bg-stone-100 text-stone-600 hover:bg-emerald-50 hover:text-emerald-900"
                    }`}
                  >
                    <span>{idx + 1}. {s.short}</span>
                  </button>
                );
              })}
            </div>

            {/* Timer & Navigation Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Pitch Timer Display */}
              <div className="flex items-center gap-1.5 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200 text-xs font-mono">
                <Clock className={`w-3.5 h-3.5 ${pitchSeconds < 30 ? "text-rose-600 animate-pulse" : "text-stone-600"}`} />
                <span className={`font-black ${pitchSeconds < 30 ? "text-rose-600" : "text-stone-800"}`}>
                  {formattedTime}
                </span>
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="p-1 hover:text-[#1b4332]"
                  title={timerRunning ? "Pause Pitch Timer" : "Start Pitch Timer"}
                >
                  {timerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => { setPitchSeconds(180); setTimerRunning(false); }}
                  className="p-1 hover:text-stone-900"
                  title="Reset 3-Minute Timer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>

              {/* Arrow Navigators */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevStep}
                  className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 transition"
                  title="Previous Screen (Left Arrow)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextStep}
                  className="px-3 py-1.5 rounded-lg bg-[#1b4332] hover:bg-[#2d6a4f] text-[#74c69d] font-bold text-xs flex items-center gap-1 transition shadow-sm"
                  title="Next Screen (Right Arrow)"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* Batch Overview Ribbon */}
      {activeTab !== "landing" && (
        <nav aria-label="Batch workflow" className="border-b border-stone-200 bg-white px-4 py-2.5 no-print">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto text-xs">
              <span className="shrink-0 text-[10px] font-mono uppercase bg-stone-100 px-2 py-0.5 rounded text-stone-600">
                ACTIVE BATCH: <b>{data?.batch_id || "LOADING"}</b>
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-stone-600">
                Forage: <b className="text-emerald-900">{feedType}</b>
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-stone-600">
                Scenario: <b className="uppercase font-mono text-[11px]">{scenario}</b>
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {loading && <span className="text-amber-700 font-bold animate-pulse text-[11px]">Updating AI models…</span>}
              {data && !loading && (
                <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Calibrated &amp; Synced
                </span>
              )}
            </div>
          </div>
        </nav>
      )}

      {error && (
        <div role="alert" className="bg-rose-50 border-b border-rose-200 text-rose-900 px-4 py-3 no-print">
          <div className="max-w-7xl mx-auto flex items-start justify-between gap-3 text-sm">
            <span className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </span>
            <button 
              onClick={() => void (farmContext ? loadBatchData() : refreshContext())} 
              className="shrink-0 font-bold inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        </div>
      )}

      {/* Main Screen Container */}
      <main className="flex-1">
        {activeTab === "landing" ? (
          <LandingPage lang={lang} onEnterApp={() => setActiveTab("dashboard")} />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

            {!data && (loadingContext || loading) && (
              <div className="bg-white rounded-3xl p-12 text-center text-stone-600 border border-stone-200 shadow-sm space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#2d6a4f]" />
                <h3 className="font-black text-lg text-stone-800">Synthesizing Chemometrics &amp; IoT Batch Models…</h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Running Scikit-Learn PLSR models, Mahalanobis covariance matrices, 
                  and Flieg fermentation indices for {feedType}.
                </p>
              </div>
            )}

            {data && (
              <>
                {/* SCREEN 1: Dashboard Overview */}
                {activeTab === "dashboard" && (
                  <div className="space-y-6">
                    <Dashboard 
                      lang={lang} 
                      data={data} 
                      farmerMode={farmerMode} 
                      onNavigateTab={switchTab} 
                    />
                    <div className="pt-4 border-t border-stone-200 flex justify-end no-print">
                      <button
                        onClick={() => switchTab("feed-type")}
                        className="px-5 py-3 rounded-xl bg-[#1b4332] text-[#74c69d] font-bold text-xs flex items-center gap-2 shadow-sm hover:bg-[#2d6a4f] transition"
                      >
                        <span>Proceed to Screen 2: Feed Matrix</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* SCREEN 2: Feed Type Matrix & Intake Selection */}
                {activeTab === "feed-type" && (
                  <div className="space-y-6">
                    <FeedTypeMatrix
                      lang={lang}
                      currentFeedType={feedType}
                      onSelectFeedType={(feed) => setFeedType(feed)}
                      onProceedToNIR={() => switchTab("nir-scan")}
                    />
                    <div className="pt-4 border-t border-stone-200 flex justify-between no-print">
                      <button
                        onClick={() => switchTab("dashboard")}
                        className="px-4 py-2.5 rounded-xl border border-stone-300 font-bold text-xs text-stone-700 hover:bg-stone-50 transition"
                      >
                        ← Back to Dashboard
                      </button>
                      <button
                        onClick={() => switchTab("nir-scan")}
                        className="px-5 py-3 rounded-xl bg-[#1b4332] text-[#74c69d] font-bold text-xs flex items-center gap-2 shadow-sm hover:bg-[#2d6a4f] transition"
                      >
                        <span>Proceed to Screen 3: NIR Multi-Point Scan</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* SCREEN 3: NIR Multi-Point Scan (3x3 Grid & Preprocessing) */}
                {activeTab === "nir-scan" && (
                  <div className="space-y-6">
                    <MultiPointSampling 
                      lang={lang} 
                      data={data} 
                      farmerMode={farmerMode} 
                    />
                    <div className="pt-4 border-t border-stone-200 flex justify-between no-print">
                      <button
                        onClick={() => switchTab("feed-type")}
                        className="px-4 py-2.5 rounded-xl border border-stone-300 font-bold text-xs text-stone-700 hover:bg-stone-50 transition"
                      >
                        ← Back to Feed Matrix
                      </button>
                      <button
                        onClick={() => switchTab("evidence")}
                        className="px-5 py-3 rounded-xl bg-[#1b4332] text-[#74c69d] font-bold text-xs flex items-center gap-2 shadow-sm hover:bg-[#2d6a4f] transition"
                      >
                        <span>Proceed to Screen 4: Evidence Check</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* SCREEN 4: Evidence Check & Mahalanobis OOD Gating */}
                {activeTab === "evidence" && (
                  <div className="space-y-6">
                    <EvidencePanel 
                      lang={lang} 
                      data={data} 
                      farmerMode={farmerMode} 
                    />
                    <div className="pt-4 border-t border-stone-200 flex justify-between no-print">
                      <button
                        onClick={() => switchTab("nir-scan")}
                        className="px-4 py-2.5 rounded-xl border border-stone-300 font-bold text-xs text-stone-700 hover:bg-stone-50 transition"
                      >
                        ← Back to NIR Multi-Point
                      </button>
                      <button
                        onClick={() => switchTab("nutrition")}
                        className="px-5 py-3 rounded-xl bg-[#1b4332] text-[#74c69d] font-bold text-xs flex items-center gap-2 shadow-sm hover:bg-[#2d6a4f] transition"
                      >
                        <span>Proceed to Screen 5: Nutrition Results</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* SCREEN 5: Nutrition Results & PLSR Uncertainty Bands */}
                {activeTab === "nutrition" && (
                  <div className="space-y-6">
                    <NutritionResultsPanel
                      lang={lang}
                      data={data}
                      farmerMode={farmerMode}
                      onProceedToCamera={() => switchTab("camera")}
                      onNavigateTab={switchTab}
                    />
                    <div className="pt-4 border-t border-stone-200 flex justify-between no-print">
                      <button
                        onClick={() => switchTab("evidence")}
                        className="px-4 py-2.5 rounded-xl border border-stone-300 font-bold text-xs text-stone-700 hover:bg-stone-50 transition"
                      >
                        ← Back to Evidence Check
                      </button>
                      <button
                        onClick={() => switchTab("camera")}
                        className="px-5 py-3 rounded-xl bg-[#1b4332] text-[#74c69d] font-bold text-xs flex items-center gap-2 shadow-sm hover:bg-[#2d6a4f] transition"
                      >
                        <span>Proceed to Screen 6: Camera Screening</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* SCREEN 6: Camera Texture Screening & Urea Colorimeter */}
                {activeTab === "camera" && (
                  <div className="space-y-6">
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2 text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">
                          <span className="bg-[#1b4332] text-[#74c69d] px-2.5 py-0.5 rounded-full font-mono text-[10px]">
                            SCREEN 6 OF 8
                          </span>
                          <span>COMPUTER VISION &amp; RAPID CHEMICAL STRIP</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
                          Physical Surface Texture &amp; Chemical Adulteration
                        </h2>
                        <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
                          Automated 22-dimensional feature extraction, blur detection, 
                          fungal mycelium classification, and Bromothymol Blue urea pad colorimetry.
                        </p>
                      </div>

                      <button
                        onClick={() => switchTab("ration")}
                        className="px-5 py-3 rounded-xl bg-[#1b4332] text-[#74c69d] font-bold text-xs hover:bg-[#2d6a4f] transition flex items-center gap-2 shrink-0 shadow-sm"
                      >
                        <span>Proceed to Screen 7: Ration Advisory</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    <CameraAttachment batchId={data.batch_id} lang={lang} />

                    <div className="pt-4 border-t border-stone-200 flex justify-between no-print">
                      <button
                        onClick={() => switchTab("nutrition")}
                        className="px-4 py-2.5 rounded-xl border border-stone-300 font-bold text-xs text-stone-700 hover:bg-stone-50 transition"
                      >
                        ← Back to Nutrition Results
                      </button>
                      <button
                        onClick={() => switchTab("ration")}
                        className="px-5 py-3 rounded-xl bg-[#1b4332] text-[#74c69d] font-bold text-xs flex items-center gap-2 shadow-sm hover:bg-[#2d6a4f] transition"
                      >
                        <span>Proceed to Screen 7: Dairy Ration Advisory</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* SCREEN 7: Dairy Ration Balancing & ICAR Requirements */}
                {activeTab === "ration" && farmContext && (
                  <div className="space-y-6">
                    <DairyRationAssessor 
                      lang={lang} 
                      data={data} 
                      farmerMode={farmerMode} 
                      context={farmContext} 
                      onSaveContext={handleSaveContext} 
                      saving={savingContext} 
                    />
                    <div className="pt-4 border-t border-stone-200 flex justify-between no-print">
                      <button
                        onClick={() => switchTab("camera")}
                        className="px-4 py-2.5 rounded-xl border border-stone-300 font-bold text-xs text-stone-700 hover:bg-stone-50 transition"
                      >
                        ← Back to Camera Screening
                      </button>
                      <button
                        onClick={() => switchTab("passport")}
                        className="px-5 py-3 rounded-xl bg-[#1b4332] text-[#74c69d] font-bold text-xs flex items-center gap-2 shadow-sm hover:bg-[#2d6a4f] transition"
                      >
                        <span>Proceed to Screen 8: Quality Passport &amp; IoT</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* SCREEN 8: Silage IoT Monitoring & Cryptographic Quality Passport */}
                {activeTab === "passport" && (
                  <div className="space-y-8">
                    {/* Silage IoT Monitoring (Flieg Index, 24h Trajectory) */}
                    <SilageMonitor 
                      lang={lang} 
                      data={data} 
                      onTriggerAnomaly={(value) => setScenario(value as ScenarioId)} 
                    />

                    {/* Cryptographic Digital Twin & Printable Passport PDF/QR */}
                    <DigitalTwinPassport 
                      lang={lang} 
                      data={data} 
                    />

                    <div className="pt-4 border-t border-stone-200 flex justify-between no-print">
                      <button
                        onClick={() => switchTab("ration")}
                        className="px-4 py-2.5 rounded-xl border border-stone-300 font-bold text-xs text-stone-700 hover:bg-stone-50 transition"
                      >
                        ← Back to Dairy Ration
                      </button>
                      <button
                        onClick={() => switchTab("dashboard")}
                        className="px-5 py-3 rounded-xl bg-[#1b4332] text-[#74c69d] font-bold text-xs flex items-center gap-2 shadow-sm hover:bg-[#2d6a4f] transition"
                      >
                        <span>Back to Dashboard (Cycle Complete)</span>
                        <CheckCircle2 className="w-4 h-4 text-[#74c69d]" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        )}
      </main>

      {/* Official Prototype Footer */}
      <footer className="bg-[#122b20] text-stone-300 text-xs py-6 px-4 border-t border-[#2d6a4f] no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            <strong className="text-white">FeedSure 360</strong> · Smart India Hackathon 2026 Problem Statement 26111
          </span>
          <span>
            Ministry of Fisheries, Animal Husbandry &amp; Dairying · ISO 12099 / ASTM E1655 Standards Compliant
          </span>
        </div>
      </footer>
    </div>
  );
}
