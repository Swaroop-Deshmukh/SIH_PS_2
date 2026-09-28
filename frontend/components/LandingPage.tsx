"use client";

import React from 'react';
import { Cpu, ArrowRight, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { dictionary, Language } from '../lib/dictionary';

interface LandingPageProps {
  lang: Language;
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ lang, onEnterApp }) => {
  const t = dictionary[lang];

  return (
    <div className="bg-[#faf8f5] text-[#1a1e1b] min-h-screen font-sans selection:bg-[#52b788] selection:text-[#1b4332]">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1b4332] via-[#2d6a4f] to-[#1b4332] text-white py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#74c69d_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#40916c]/40 border border-[#52b788]/40 text-[#74c69d] text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>SIH 2026 Problem Statement 26111</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#74c69d] via-[#d4a373] to-amber-300">{t.heroTitle}</span>
            </h1>

            <p className="text-lg sm:text-xl text-emerald-100 font-normal leading-relaxed mb-8 max-w-xl">
              {t.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onEnterApp}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#52b788] to-[#40916c] text-[#1b4332] font-black text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center space-x-3 group"
              >
                <span>{t.startTesting}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onEnterApp}
                className="px-8 py-4 rounded-xl bg-white/10 text-white border border-white/20 font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center"
              >
                {t.explorePlatform}
              </button>
            </div>

            {/* Simulated Hardware Disclaimer Badge */}
            <div className="mt-8 flex items-center space-x-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 rounded-lg max-w-md">
              <Cpu className="w-4 h-4 shrink-0" />
              <span>{t.demo.intro}</span>
            </div>
          </div>

          {/* Hero Interactive Visual Mockup */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-[#52b788]/30 to-[#d4a373]/30 rounded-3xl blur-2xl opacity-60"></div>
            
            <div className="relative bg-[#122b20] border border-[#2d6a4f] rounded-2xl p-6 shadow-2xl text-white">
              
              <div className="flex items-center justify-between pb-4 border-b border-[#2d6a4f]">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="font-mono text-xs text-[#74c69d]">ILLUSTRATIVE DEMO PREVIEW</span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40">
                  SAMPLE VALUES · NOT MEASUREMENTS
                </span>
              </div>

              {/* Sample Metrics */}
              <div className="grid grid-cols-2 gap-3 my-6">
                <div className="bg-[#1b4332] p-3.5 rounded-xl border border-[#40916c]/30">
                  <div className="text-xs text-gray-400 font-medium">Crude Protein (CP)</div>
                  <div className="text-2xl font-black text-[#74c69d]">—</div>
                  <div className="text-[10px] text-emerald-300">Example value removed</div>
                </div>
                <div className="bg-[#1b4332] p-3.5 rounded-xl border border-[#40916c]/30">
                  <div className="text-xs text-gray-400 font-medium">Dry Matter (DM)</div>
                  <div className="text-2xl font-black text-[#d4a373]">—</div>
                  <div className="text-[10px] text-amber-200">Example value removed</div>
                </div>
                <div className="bg-[#1b4332] p-3.5 rounded-xl border border-[#40916c]/30">
                  <div className="text-xs text-gray-400 font-medium">Sample Consistency</div>
                  <div className="text-2xl font-black text-emerald-400">—</div>
                  <div className="text-[10px] text-gray-300">No sample has been scanned</div>
                </div>
                <div className="bg-[#1b4332] p-3.5 rounded-xl border border-[#40916c]/30">
                  <div className="text-xs text-gray-400 font-medium">Silage Storage pH</div>
                  <div className="text-2xl font-black text-cyan-300">—</div>
                  <div className="text-[10px] text-cyan-200">No sensor is connected</div>
                </div>
              </div>

              {/* Evidence Bar */}
              <div className="bg-[#1b4332] p-3.5 rounded-xl border border-[#40916c]/40">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Evidence Certainty Score</span>
                  <span className="text-[#74c69d]">Not calculated</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#122b20] overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-[#74c69d]" style={{ width: '92.4%' }}></div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>


      {/* 2. THE PROBLEM SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#2d6a4f] mb-3">
            The Dairy Feeding Crisis
          </h2>
          <p className="text-3xl sm:text-4xl font-black text-[#1a1e1b]">
            Why Generic AI Feed Testing Fails Dairy Farmers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xl mb-6">
              01
            </div>
            <h3 className="text-xl font-bold mb-3">Blind AI Predictions</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Standard AI systems output a single number without evaluating whether the sample is representative, consistent, or within calibrated boundaries.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl mb-6">
              02
            </div>
            <h3 className="text-xl font-bold mb-3">Storage Spoilage Blindspots</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              A good initial feed test means nothing if moisture, heating, and pH spikes degrade the silage wall during pit exposure.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#1b4332] flex items-center justify-center font-bold text-xl mb-6">
              03
            </div>
            <h3 className="text-xl font-bold mb-3">Disconnected Ration Guidance</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Feed quality numbers are useless without knowing your lactating herd count, available fodder basket, and daily protein gaps.
            </p>
          </div>
        </div>
      </section>


      {/* 3. SIGNATURE SECTION: EVIDENCE-AWARE AI */}
      <section className="py-20 bg-[#1b4332] text-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#74c69d] bg-[#2d6a4f] px-3 py-1 rounded-full border border-[#40916c]">
              Central Product Innovation
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-4 mb-6 leading-tight">
              AI That Knows When<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-[#74c69d]">
                Not to Trust Itself.
              </span>
            </h2>
            <p className="text-emerald-100 text-base leading-relaxed mb-6">
              The current software demo illustrates evidence checks with generated spectra and scenario rules. It has no calibrated spectral model or image screening connected.
            </p>
            <p className="text-emerald-100 text-base leading-relaxed mb-8">
              In the demo, selected scenarios can withhold example nutrient values and show a <strong className="text-rose-300">RESULT NOT TRUSTED</strong> status. These are simulated rules, not a validated food safety measurement.
            </p>

            <div className="space-y-3">
              {[
                "Generated 5-point spectra for UI and API demonstration",
                "Scenario-based out-of-domain and evidence status examples",
                "No camera-based mould or foreign matter model is connected",
                "Demo guidance can recommend additional sampling or lab confirmation"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-3 text-sm font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-[#74c69d] shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#122b20] p-6 rounded-2xl border border-[#2d6a4f] shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#2d6a4f] mb-4">
              <span className="text-xs font-mono text-gray-400">ILLUSTRATIVE OUT-OF-DOMAIN SCENARIO</span>
              <span className="text-xs px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                RESULT NOT TRUSTED
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-rose-950/40 border border-rose-500/30 p-4 rounded-xl text-rose-200 text-xs leading-relaxed">
                <div className="font-bold text-rose-300 mb-1 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Example UI state · generated demo text:</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>A selected scenario can mark a generated spectrum out of domain.</li>
                  <li>No validated uncertainty estimate is calculated in this prototype.</li>
                  <li>No physical feed sample is analyzed in this landing page preview.</li>
                </ul>
              </div>

              <div className="p-4 bg-[#1b4332] rounded-xl border border-[#40916c]/40 text-xs">
                <div className="font-bold text-[#74c69d] mb-1">Recommended Action:</div>
                <p className="text-gray-300">Collect 5 fresh core samples or submit sample for laboratory confirmation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 4. DIGITAL TWIN & QUALITY PASSPORT */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#2d6a4f] mb-3">
            Traceability & Integrity
          </h2>
          <p className="text-3xl sm:text-4xl font-black text-[#1a1e1b]">
            Feed Digital Twin & SHA-256 Quality Passport
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {[
            { step: '01', title: 'TEST', desc: 'Simulated 5-point spectrum and scenario rules' },
            { step: '02', title: 'STORE', desc: 'Demo storage baseline; no trench sensor connected' },
            { step: '03', title: 'MONITOR', desc: 'Simulated telemetry values; no live sensor' },
            { step: '04', title: 'RETEST', desc: 'Adaptive retest prior to ration transition' },
            { step: '05', title: 'USE', desc: 'Review batch evidence before any feeding decision' }
          ].map((st, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm relative">
              <span className="text-xs font-black text-[#2d6a4f] bg-emerald-50 px-2 py-1 rounded">
                STEP {st.step}
              </span>
              <h4 className="text-lg font-bold mt-3 mb-2">{st.title}</h4>
              <p className="text-xs text-stone-600">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* 5. FINAL CALL TO ACTION */}
      <section className="py-20 bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-[#1b4332] text-white text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black mb-6">
            From Feed Testing to Dairy Feeding Intelligence.
          </h2>
          <p className="text-lg text-emerald-100 mb-8">
            Experience the complete startup-grade FeedSure 360 prototype now.
          </p>
          <button
            onClick={onEnterApp}
            className="px-10 py-5 rounded-2xl bg-gradient-to-r from-[#52b788] to-[#74c69d] text-[#1b4332] font-black text-xl shadow-2xl hover:scale-105 transition-transform"
          >
            Enter FeedSure 360 Dashboard
          </button>
        </div>
      </section>

    </div>
  );
};
