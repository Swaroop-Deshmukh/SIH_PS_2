"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { ScenarioBar } from "../components/ScenarioBar";
import { LandingPage } from "../components/LandingPage";
import { Dashboard } from "../components/Dashboard";
import { MultiPointSampling } from "../components/MultiPointSampling";
import { EvidencePanel } from "../components/EvidencePanel";
import { DairyRationAssessor } from "../components/DairyRationAssessor";
import { SilageMonitor } from "../components/SilageMonitor";
import { DigitalTwinPassport } from "../components/DigitalTwinPassport";
import { analyzeBatch, checkApiHealth, FarmContext, getFarmContext, BatchAnalyzeResponse, saveFarmContext, FeedType, ScenarioId, ApiHealth } from "../lib/api";
import { dictionary, Language } from "../lib/dictionary";

export default function Home() {
  const [lang, setLang] = useState<Language>("en");
  const [farmerMode, setFarmerMode] = useState(true);
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
  const requestId = useRef(0);
  const t = dictionary[lang];

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
    } finally { setSavingContext(false); }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1e1b] flex flex-col">
      <Navbar lang={lang} setLang={setLang} farmerMode={farmerMode} setFarmerMode={setFarmerMode} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="bg-[#122b20] px-4 py-2 text-xs text-emerald-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <span className="font-semibold">{lang === "mr" ? "डेमो आकडे · प्रत्यक्ष सेन्सर नाही" : lang === "hi" ? "डेमो आँकड़े · असली सेंसर नहीं" : "Demo data · no live sensors"}</span>
          <span className="flex items-center gap-1.5" title={health?.data_mode ?? "API unavailable"}>
            {health ? <Wifi className="w-3.5 h-3.5 text-emerald-300" /> : <WifiOff className="w-3.5 h-3.5 text-amber-300" />}
            {health ? (lang === "mr" ? "जोडलेले" : lang === "hi" ? "जुड़ा है" : "Connected") : (lang === "mr" ? "जोडणी नाही" : lang === "hi" ? "कनेक्शन नहीं" : "Disconnected")}
          </span>
        </div>
      </div>
      {activeTab !== "landing" && !farmerMode && <ScenarioBar lang={lang} currentScenario={scenario} onSelectScenario={(value) => setScenario(value as ScenarioId)} loading={loading} />}
      {activeTab !== "landing" && <nav aria-label={lang === "mr" ? "बॅचची पायरी" : lang === "hi" ? "बैच के चरण" : "Batch workflow"} className="border-b border-stone-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto">
          <span className="mr-1 shrink-0 text-[11px] font-bold uppercase text-stone-500">{lang === "mr" ? "एकाच बॅचची पायरी" : lang === "hi" ? "एक ही बैच के चरण" : "One batch · steps"}</span>
          {([
            ["dashboard", lang === "mr" ? "आढावा" : lang === "hi" ? "सारांश" : "Summary"],
            ["testing", lang === "mr" ? "चारा तपासा" : lang === "hi" ? "चारा जाँचें" : "Check feed"],
            ["ration", lang === "mr" ? "आहार योजना" : lang === "hi" ? "आहार योजना" : "Feed plan"],
            ["silage", lang === "mr" ? "साठवण" : lang === "hi" ? "भंडारण" : "Storage"],
            ["twin", lang === "mr" ? "बॅच नोंद" : lang === "hi" ? "बैच रिकॉर्ड" : "Batch record"],
          ] as const).map(([tab, label], index) => <React.Fragment key={tab}>
            {index > 0 && <span aria-hidden="true" className="text-stone-300">›</span>}
            <button aria-current={activeTab === tab ? "step" : undefined} onClick={() => setActiveTab(tab)} className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold transition ${activeTab === tab ? "bg-[#1b4332] text-white" : "bg-stone-100 text-stone-700 hover:bg-emerald-100"}`}>
              <span className="mr-1 opacity-70">{index + 1}.</span>{label}
            </button>
          </React.Fragment>)}
        </div>
        <p className="mx-auto mt-2 max-w-7xl text-[11px] text-stone-500">{data ? `${lang === "mr" ? "सध्या उघडलेली बॅच" : lang === "hi" ? "वर्तमान बैच" : "Current batch"}: ${data.batch_id} · ${data.feed_type}` : lang === "mr" ? "बॅच तयार होत आहे…" : "Loading this batch…"}</p>
      </nav>}
      {error && (
        <div role="alert" className="bg-rose-50 border-b border-rose-200 text-rose-900 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-start justify-between gap-3 text-sm">
            <span className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />{error}</span>
            <button onClick={() => void (farmContext ? loadBatchData() : refreshContext())} className="shrink-0 font-bold inline-flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5" /> Retry</button>
          </div>
        </div>
      )}
      <main className="flex-1">
        {activeTab === "landing" ? <LandingPage lang={lang} onEnterApp={() => setActiveTab("dashboard")} /> : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
              <label className="flex flex-wrap items-center gap-3 text-xs">
                <span className="font-bold text-stone-500 uppercase">{t.demo.feedPrompt}</span>
                <select value={feedType} onChange={(event) => setFeedType(event.target.value as FeedType)} className="bg-stone-50 border border-stone-300 font-bold text-[#1b4332] px-3 py-2 rounded-xl">
                  <option value="Maize Silage">Maize Silage</option><option value="Green Fodder">Green Fodder (Napier)</option>
                  <option value="Dry Fodder">Dry Fodder (Wheat Straw)</option><option value="Concentrate">Compound Feed Concentrate</option>
                </select>
              </label>
              <div className="flex items-center gap-3 text-xs">
                {loadingContext && <span className="text-stone-500">Loading saved farm data…</span>}
                {loading && <span className="text-amber-700 font-bold animate-pulse">Generating scenario analysis…</span>}
                {data && !loading && <span className="text-stone-500">Saved batch {data.batch_id}</span>}
              </div>
            </div>
            {!data && (loadingContext || loading) && <div className="bg-white rounded-2xl p-10 text-center text-stone-600">Connecting farm profile and preparing the demo analysis…</div>}
            {data && <>
              {activeTab === "dashboard" && <Dashboard lang={lang} data={data} farmerMode={farmerMode} onNavigateTab={setActiveTab} />}
              {activeTab === "testing" && <div className="space-y-8"><EvidencePanel lang={lang} data={data} farmerMode={farmerMode} /><MultiPointSampling lang={lang} data={data} farmerMode={farmerMode} /></div>}
              {activeTab === "silage" && <SilageMonitor lang={lang} data={data} onTriggerAnomaly={(value) => setScenario(value as ScenarioId)} />}
              {activeTab === "ration" && farmContext && <DairyRationAssessor lang={lang} data={data} farmerMode={farmerMode} context={farmContext} onSaveContext={handleSaveContext} saving={savingContext} />}
              {activeTab === "twin" && <DigitalTwinPassport lang={lang} data={data} />}
            </>}
          </div>
        )}
      </main>
      <footer className="bg-[#122b20] text-stone-300 text-xs py-6 px-4 border-t border-[#2d6a4f]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3"><span><strong className="text-white">FeedSure 360</strong> · SIH 2026 Problem Statement 26111 Prototype</span><span>DEMO DATA · local SQLite · no physical sensor or validated nutrient model</span></div>
      </footer>
    </div>
  );
}
