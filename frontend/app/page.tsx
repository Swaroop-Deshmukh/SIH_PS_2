"use client";

import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { ScenarioBar } from '../components/ScenarioBar';
import { LandingPage } from '../components/LandingPage';
import { Dashboard } from '../components/Dashboard';
import { MultiPointSampling } from '../components/MultiPointSampling';
import { EvidencePanel } from '../components/EvidencePanel';
import { DairyRationAssessor } from '../components/DairyRationAssessor';
import { SilageMonitor } from '../components/SilageMonitor';
import { DigitalTwinPassport } from '../components/DigitalTwinPassport';

import { analyzeBatch, BatchAnalyzeResponse } from '../lib/api';
import { Language } from '../lib/dictionary';

export default function Home() {
  const [lang, setLang] = useState<Language>('en');
  const [farmerMode, setFarmerMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [scenario, setScenario] = useState<string>('healthy');
  const [feedType, setFeedType] = useState<string>('Maize Silage');

  const [data, setData] = useState<BatchAnalyzeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch / analyze batch on scenario change
  const loadBatchData = async (sc: string, fType: string = feedType) => {
    setLoading(true);
    try {
      const res = await analyzeBatch(fType, sc);
      setData(res);
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatchData(scenario, feedType);
  }, [scenario, feedType]);

  const handleSelectScenario = (newScenario: string) => {
    setScenario(newScenario);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1e1b] flex flex-col">
      
      {/* Top Sticky Navigation */}
      <Navbar
        lang={lang}
        setLang={setLang}
        farmerMode={farmerMode}
        setFarmerMode={setFarmerMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Demo Scenario Controller Bar (Visible in App views) */}
      {activeTab !== 'landing' && (
        <ScenarioBar
          lang={lang}
          currentScenario={scenario}
          onSelectScenario={handleSelectScenario}
          loading={loading}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'landing' ? (
          <LandingPage lang={lang} onEnterApp={() => setActiveTab('dashboard')} />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            
            {/* Feed Type Selector */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
              <div className="flex items-center space-x-3 text-xs">
                <span className="font-bold text-stone-500 uppercase">Select Feed Sample:</span>
                <select
                  value={feedType}
                  onChange={(e) => setFeedType(e.target.value)}
                  className="bg-stone-50 border border-stone-300 font-bold text-[#1b4332] px-3 py-1.5 rounded-xl cursor-pointer"
                >
                  <option value="Maize Silage">Maize Silage</option>
                  <option value="Green Fodder">Green Fodder (Napier)</option>
                  <option value="Dry Fodder">Dry Fodder (Wheat Straw)</option>
                  <option value="Concentrate">Compound Feed Concentrate</option>
                </select>
              </div>

              {loading && (
                <div className="text-xs text-amber-600 font-bold animate-pulse">
                  Analyzing multi-point spectrum & evidence...
                </div>
              )}
            </div>

            {/* TAB CONTENTS */}
            {data && (
              <>
                {activeTab === 'dashboard' && (
                  <Dashboard
                    lang={lang}
                    data={data}
                    farmerMode={farmerMode}
                    onNavigateTab={setActiveTab}
                  />
                )}

                {activeTab === 'testing' && (
                  <div className="space-y-8">
                    <EvidencePanel lang={lang} data={data} farmerMode={farmerMode} />
                    <MultiPointSampling lang={lang} data={data} farmerMode={farmerMode} />
                  </div>
                )}

                {activeTab === 'silage' && (
                  <SilageMonitor
                    lang={lang}
                    data={data}
                    onTriggerAnomaly={handleSelectScenario}
                  />
                )}

                {activeTab === 'ration' && (
                  <DairyRationAssessor
                    lang={lang}
                    data={data}
                    farmerMode={farmerMode}
                  />
                )}

                {activeTab === 'twin' && (
                  <DigitalTwinPassport lang={lang} data={data} />
                )}
              </>
            )}

          </div>
        )}
      </main>

      {/* App Footer */}
      <footer className="bg-[#122b20] text-stone-400 text-xs py-8 px-4 border-t border-[#2d6a4f]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-extrabold text-white">FeedSure 360</span> • SIH 2026 Problem Statement 26111 Prototype
          </div>
          <div className="text-amber-300 font-mono text-[11px]">
            SOFTWARE SIMULATION LAYER ACTIVE • ZERO HARDWARE DEPENDENCY
          </div>
        </div>
      </footer>

    </div>
  );
}
