"use client";

import React, { useState } from "react";
import { 
  Sparkles, ArrowRight, ShieldCheck, Cpu, Activity, Eye, 
  Layers, CheckCircle2, AlertTriangle, RefreshCw, BarChart3, 
  QrCode, FileCheck2, Database, Wifi, Globe, ChevronRight, 
  Play, Smartphone, HardDrive, Zap, Info, Thermometer, Droplets, 
  Clock, Award, ExternalLink, Sliders, Check, ChevronDown, Menu, X
} from "lucide-react";
import { dictionary, Language } from "../lib/dictionary";
import { CattleLogo } from "./Navbar";

interface LandingPageProps {
  lang: Language;
  onEnterApp: (targetTab?: string) => void;
  onSelectLang?: (lang: Language) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  lang, 
  onEnterApp,
  onSelectLang 
}) => {
  const t = dictionary[lang] || dictionary.en;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState<"trusted" | "ood" | "heterogeneous">("trusted");
  const [selectedDemoTab, setSelectedDemoTab] = useState<string>("dashboard");
  const [selectedForage, setSelectedForage] = useState<string>("Maize Silage");
  const [selectedHerdGroup, setSelectedHerdGroup] = useState<"lactating" | "dry">("lactating");

  const changeLanguage = (newLang: Language) => {
    if (onSelectLang) {
      onSelectLang(newLang);
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-[#faf8f5] text-[#1a1e1b] min-h-screen font-sans selection:bg-[#52b788] selection:text-[#1b4332]">

      {/* ========================================================================= */}
      {/* 1. FLOATING ROUNDED HEADER NAVIGATION                                    */}
      {/* ========================================================================= */}
      <div className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pointer-events-none">
        <header className="max-w-7xl mx-auto bg-white/90 backdrop-blur-xl border border-stone-200/80 shadow-xl rounded-full px-4 sm:px-6 py-3 flex items-center justify-between pointer-events-auto transition-all">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1b4332] to-[#2d6a4f] flex items-center justify-center text-[#74c69d] shadow-md group-hover:scale-105 transition-transform">
              <CattleLogo className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#1b4332]">
                FeedSure <span className="text-[#52b788]">360</span>
              </span>
              <span className="hidden xl:inline-block ml-2 text-[10px] font-mono text-stone-500 uppercase tracking-wider">
                Precision Feed AI
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1 text-xs font-semibold text-stone-700">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-3 py-1.5 rounded-full hover:text-[#1b4332] hover:bg-stone-100 transition"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection("how-it-works")}
              className="px-3 py-1.5 rounded-full hover:text-[#1b4332] hover:bg-stone-100 transition"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollToSection("evidence-ai")}
              className="px-3 py-1.5 rounded-full hover:text-[#1b4332] hover:bg-stone-100 transition"
            >
              Evidence AI
            </button>
            <button 
              onClick={() => scrollToSection("smart-feed-zone")}
              className="px-3 py-1.5 rounded-full hover:text-[#1b4332] hover:bg-stone-100 transition"
            >
              Smart Feed Zone
            </button>
            <button 
              onClick={() => scrollToSection("dairy-nutrition")}
              className="px-3 py-1.5 rounded-full hover:text-[#1b4332] hover:bg-stone-100 transition"
            >
              Dairy Advisory
            </button>
            <button 
              onClick={() => scrollToSection("passport")}
              className="px-3 py-1.5 rounded-full hover:text-[#1b4332] hover:bg-stone-100 transition"
            >
              Passport
            </button>
            <button 
              onClick={() => scrollToSection("hardware")}
              className="px-3 py-1.5 rounded-full hover:text-[#1b4332] hover:bg-stone-100 transition"
            >
              Hardware
            </button>
          </nav>

          {/* Header Actions: Language & Launch CTA */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Language Switcher Pill */}
            <div className="hidden sm:flex items-center bg-stone-100 rounded-full p-0.5 text-[11px] font-bold border border-stone-200">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-2.5 py-1 rounded-full transition ${
                  lang === 'en' ? 'bg-[#1b4332] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('hi')}
                className={`px-2.5 py-1 rounded-full transition ${
                  lang === 'hi' ? 'bg-[#1b4332] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => changeLanguage('mr')}
                className={`px-2.5 py-1 rounded-full transition ${
                  lang === 'mr' ? 'bg-[#1b4332] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                मराठी
              </button>
            </div>

            {/* Launch App Primary Pill CTA */}
            <button
              onClick={() => onEnterApp("dashboard")}
              className="px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] hover:from-[#2d6a4f] hover:to-[#1b4332] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center space-x-2"
            >
              <span>Explore Platform</span>
              <ArrowRight className="w-4 h-4 text-[#74c69d]" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </header>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden max-w-7xl mx-auto mt-2 bg-white/95 backdrop-blur-xl border border-stone-200 rounded-3xl p-5 shadow-2xl pointer-events-auto space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-stone-700">
              <button 
                onClick={() => scrollToSection("how-it-works")}
                className="p-2.5 rounded-xl bg-stone-50 hover:bg-emerald-50 text-left"
              >
                How It Works
              </button>
              <button 
                onClick={() => scrollToSection("evidence-ai")}
                className="p-2.5 rounded-xl bg-stone-50 hover:bg-emerald-50 text-left"
              >
                Evidence AI Engine
              </button>
              <button 
                onClick={() => scrollToSection("smart-feed-zone")}
                className="p-2.5 rounded-xl bg-stone-50 hover:bg-emerald-50 text-left"
              >
                Smart Feed Zone
              </button>
              <button 
                onClick={() => scrollToSection("dairy-nutrition")}
                className="p-2.5 rounded-xl bg-stone-50 hover:bg-emerald-50 text-left"
              >
                Dairy Ration Advisory
              </button>
              <button 
                onClick={() => scrollToSection("passport")}
                className="p-2.5 rounded-xl bg-stone-50 hover:bg-emerald-50 text-left"
              >
                Quality Passport
              </button>
              <button 
                onClick={() => scrollToSection("hardware")}
                className="p-2.5 rounded-xl bg-stone-50 hover:bg-emerald-50 text-left"
              >
                Hardware Architecture
              </button>
            </div>

            {/* Language Selector in Mobile Drawer */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-200 text-xs">
              <span className="font-semibold text-stone-500">Language:</span>
              <div className="flex gap-1">
                {(['en', 'hi', 'mr'] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => changeLanguage(l)}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      lang === l ? 'bg-[#1b4332] text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {l === 'en' ? 'English' : l === 'hi' ? 'हिन्दी' : 'मराठी'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => onEnterApp("nir-scan")}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#52b788] to-[#2d6a4f] text-stone-950 font-black text-sm flex items-center justify-center space-x-2"
            >
              <span>Try Feed Testing Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>


      {/* ========================================================================= */}
      {/* 2. CINEMATIC FULL-SCREEN HERO SECTION                                    */}
      {/* ========================================================================= */}
      <section className="relative min-h-[92vh] lg:min-h-screen flex items-center pt-28 pb-16 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        {/* Background Farm Image with Cinematic Vignette Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero-farm.jpg" 
            alt="Indian Dairy Farm with lush fodder fields and Gir cattle"
            className="w-full h-full object-cover object-center scale-105 transform motion-safe:animate-pulse [animation-duration:15s]"
          />
          {/* Multi-layered Dark Gradient Vignette for Perfect Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#071910]/95 via-[#0c2418]/85 to-[#0c2418]/60 lg:to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#071910] via-transparent to-[#071910]/70"></div>
          <div className="absolute inset-0 bg-[radial-gradient(#52b788_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Hero Typography & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-white text-left">
            
            {/* Top Agritech Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#52b788]/20 border border-[#52b788]/40 backdrop-blur-md text-[#74c69d] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Adaptive Evidence-Aware Feed &amp; Silage Intelligence</span>
            </div>

            {/* Main Oversized Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.08] text-white">
              Know What Your Cattle Are <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#74c69d] via-[#d4a373] to-amber-300">Really Eating.</span>
            </h1>

            {/* Supporting Subheadline */}
            <p className="text-base sm:text-lg lg:text-xl text-emerald-100/90 font-normal leading-relaxed max-w-2xl">
              FeedSure 360 combines NIR spectroscopy, computer vision, IoT sensing and evidence-aware AI to assess feed quality, monitor storage conditions and turn test results into practical dairy feeding decisions.
            </p>

            {/* Dual Pill CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={() => onEnterApp("dashboard")}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-[#52b788] via-[#74c69d] to-[#52b788] hover:from-[#74c69d] hover:to-[#52b788] text-[#1b4332] font-black text-base sm:text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center space-x-3 group cursor-pointer"
              >
                <span>Explore FeedSure 360</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => scrollToSection("how-it-works")}
                className="px-7 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/25 font-bold text-base backdrop-blur-md hover:scale-105 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Play className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>See How It Works</span>
              </button>
            </div>

            {/* Trust Strip */}
            <div className="pt-4 border-t border-white/15">
              <div className="text-[11px] uppercase tracking-widest text-stone-400 font-mono font-semibold mb-2">
                Core Scientific Intelligence Layers
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-200">
                <span className="px-3 py-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-xs flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#74c69d]" /> NIR Spectroscopy
                </span>
                <span className="px-3 py-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-xs flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-cyan-300" /> Computer Vision
                </span>
                <span className="px-3 py-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" /> Evidence-Aware AI
                </span>
                <span className="px-3 py-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-xs flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-emerald-300" /> IoT Silage Telemetry
                </span>
                <span className="px-3 py-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-xs flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-[#d4a373]" /> ICAR/NRC Balancer
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Floating Product Visualization Card */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            
            {/* Ambient Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#52b788]/30 via-[#74c69d]/20 to-amber-300/20 rounded-3xl blur-2xl opacity-70 pointer-events-none"></div>

            {/* Card Container */}
            <div className="relative bg-[#0c2418]/90 border border-[#2d6a4f]/70 rounded-3xl p-6 shadow-2xl backdrop-blur-xl text-white">
              
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#2d6a4f]/60">
                <div className="flex items-center space-x-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
                  <div>
                    <div className="text-xs font-bold text-stone-200">RAPID FEED QUALITY SCAN</div>
                    <div className="text-[10px] font-mono text-[#74c69d]">DEVICE: FS360-OPTIC-DEMO</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                  LIVE SIMULATION
                </span>
              </div>

              {/* Sample Selector inside the card */}
              <div className="my-4 flex items-center justify-between bg-[#122e20] p-2.5 rounded-2xl border border-[#2d6a4f]/40 text-xs">
                <span className="text-stone-400 font-medium">Sample:</span>
                <span className="font-bold text-[#74c69d] flex items-center gap-1.5">
                  <span>Maize Silage (Core 2)</span>
                </span>
              </div>

              {/* Key Nutrient Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 my-4">
                <div className="bg-[#143725]/80 p-3.5 rounded-2xl border border-[#40916c]/30 hover:border-[#52b788] transition-colors">
                  <div className="text-[11px] text-stone-400 font-medium">Crude Protein (CP)</div>
                  <div className="text-2xl font-black text-[#74c69d] mt-1">12.8%</div>
                  <div className="text-[10px] text-emerald-300/80 font-mono mt-0.5">Optimal Lactating Target</div>
                </div>

                <div className="bg-[#143725]/80 p-3.5 rounded-2xl border border-[#40916c]/30 hover:border-[#52b788] transition-colors">
                  <div className="text-[11px] text-stone-400 font-medium">Dry Matter (DM)</div>
                  <div className="text-2xl font-black text-[#d4a373] mt-1">38.6%</div>
                  <div className="text-[10px] text-amber-200/80 font-mono mt-0.5">Target: 35.0% - 40.0%</div>
                </div>

                <div className="bg-[#143725]/80 p-3.5 rounded-2xl border border-[#40916c]/30 hover:border-[#52b788] transition-colors">
                  <div className="text-[11px] text-stone-400 font-medium">NDF (Digestible Fiber)</div>
                  <div className="text-2xl font-black text-emerald-300 mt-1">54.2%</div>
                  <div className="text-[10px] text-stone-300 font-mono mt-0.5">ADF: 31.4% (Rumen Safe)</div>
                </div>

                <div className="bg-[#143725]/80 p-3.5 rounded-2xl border border-[#40916c]/30 hover:border-[#52b788] transition-colors">
                  <div className="text-[11px] text-stone-400 font-medium">Silage Ferment pH</div>
                  <div className="text-2xl font-black text-cyan-300 mt-1">3.90</div>
                  <div className="text-[10px] text-cyan-200/80 font-mono mt-0.5">Flieg Score: 88 (Grade I)</div>
                </div>
              </div>

              {/* Evidence Engine Verification Block */}
              <div className="bg-[#143725] p-3.5 rounded-2xl border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-stone-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Evidence Sufficiency Score</span>
                  </span>
                  <span className="text-emerald-400 font-mono">92.4%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-[#0c2418] overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 via-[#74c69d] to-amber-300 rounded-full" style={{ width: '92.4%' }}></div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 text-stone-300 font-mono">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                    <span>Evidence: <b>SUFFICIENT</b></span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                    <span>Calibration: <b>IN DOMAIN</b></span>
                  </span>
                </div>
              </div>

              {/* Quick Action Button */}
              <button
                onClick={() => onEnterApp("nir-scan")}
                className="mt-4 w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center justify-center space-x-2 transition"
              >
                <span>Run Interactive Scan on This Sample</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#74c69d]" />
              </button>

            </div>
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 3. SECTION 2: THE CORE DIFFERENTIATOR — EVIDENCE PIPELINE               */}
      {/* ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-[#1b4332] text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>The Core Differentiator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1a1e1b] tracking-tight">
            “Feed quality is more than a number.”
          </h2>
          <p className="text-lg sm:text-xl text-stone-600 font-normal">
            FeedSure 360 looks at the multi-source evidence behind every single result before making feeding decisions.
          </p>
        </div>

        {/* 6-Stage Visual Interactive Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 relative">
          {[
            {
              step: "01",
              title: "SENSE",
              desc: "Multi-point NIR spectrum, CV macro surface texture & storage microclimate.",
              icon: Activity,
              color: "text-emerald-700",
              bg: "bg-emerald-50",
              border: "border-emerald-200"
            },
            {
              step: "02",
              title: "QUESTION",
              desc: "Is SNR baseline clean? Are all 5 core sampling locations homogeneous?",
              icon: Eye,
              color: "text-cyan-700",
              bg: "bg-cyan-50",
              border: "border-cyan-200"
            },
            {
              step: "03",
              title: "VERIFY",
              desc: "Mahalanobis distance check to confirm sample is within validated calibration domain.",
              icon: Sliders,
              color: "text-indigo-700",
              bg: "bg-indigo-50",
              border: "border-indigo-200"
            },
            {
              step: "04",
              title: "DECIDE",
              desc: "Ensemble uncertainty band gating: TRUSTED vs RETEST vs LAB CONFIRMATION.",
              icon: ShieldCheck,
              color: "text-amber-700",
              bg: "bg-amber-50",
              border: "border-amber-200"
            },
            {
              step: "05",
              title: "ADVISE",
              desc: "Translate verified nutrient values directly into daily lactating herd ration balances.",
              icon: FileCheck2,
              color: "text-emerald-800",
              bg: "bg-emerald-100/60",
              border: "border-emerald-300"
            },
            {
              step: "06",
              title: "LEARN",
              desc: "Immutable cryptographic ledger stamps the batch into the Digital Twin Passport.",
              icon: Database,
              color: "text-stone-800",
              bg: "bg-stone-100",
              border: "border-stone-300"
            }
          ].map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div 
                key={idx}
                className={`p-5 rounded-3xl ${item.bg} border ${item.border} flex flex-col justify-between hover:shadow-lg transition-all group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded-full bg-white/80 text-stone-700 shadow-2xs">
                      {item.step}
                    </span>
                    <IconComponent className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform`} />
                  </div>
                  <h3 className="font-black text-base text-stone-900 tracking-tight mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Evidence Fusion Formula Banner */}
        <div className="mt-8 bg-gradient-to-r from-[#122b20] via-[#1b4332] to-[#122b20] rounded-3xl p-6 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#52b788] text-[#1b4332] flex items-center justify-center font-black text-xl shrink-0">
              ∑
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#74c69d]">Evidence Fusion Law</div>
              <div className="text-sm sm:text-base font-bold text-white">
                Spectral Quality + Sample Consistency + Calibration Domain + Uncertainty Band = Reliable Farm Decision
              </div>
            </div>
          </div>
          <button
            onClick={() => onEnterApp("evidence")}
            className="px-6 py-3 rounded-full bg-[#52b788] text-[#1b4332] font-bold text-xs shrink-0 hover:bg-[#74c69d] hover:scale-105 transition-all shadow-md"
          >
            Explore Evidence Engine
          </button>
        </div>

      </section>


      {/* ========================================================================= */}
      {/* 4. SECTION 3: THE PROBLEM (EDITORIAL REALITY)                            */}
      {/* ========================================================================= */}
      <section className="py-24 bg-stone-100/70 border-y border-stone-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>The Dairy Feeding Reality</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1a1e1b] tracking-tight">
              “Your feed changes before you notice it.”
            </h2>
            <p className="text-lg text-stone-600">
              Traditional lab tests take 5 to 7 days, while generic AI models guess numbers blindly without checking data validity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Problem 1 */}
            <div className="bg-white p-7 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-lg">
                01
              </div>
              <h3 className="text-xl font-black text-stone-900">Nutritional Variation</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Forage dry matter and protein fluctuate by up to 25% between bunker cuts. Blind feeding without testing causes subclinical acidosis or severe milk yield drops.
              </p>
              <div className="pt-2 border-t border-stone-100 text-[11px] font-mono text-amber-700 font-bold">
                ⚠️ Daily TMR Imbalance Risk
              </div>
            </div>

            {/* Problem 2 */}
            <div className="bg-white p-7 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-black text-lg">
                02
              </div>
              <h3 className="text-xl font-black text-stone-900">Storage Heating</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Once exposed to air, unmonitored silage faces heat up past 33°C. Digestible carbohydrates burn away, reducing feed energy before mold is visible to the eye.
              </p>
              <div className="pt-2 border-t border-stone-100 text-[11px] font-mono text-rose-700 font-bold">
                ⚠️ Aerobic Energy Depletion
              </div>
            </div>

            {/* Problem 3 */}
            <div className="bg-white p-7 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-lg">
                03
              </div>
              <h3 className="text-xl font-black text-stone-900">NPN Adulteration</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Commercial feed concentrates contaminated with non-protein nitrogen (Urea) mimic high crude protein on chemical tests while causing rumen toxicity.
              </p>
              <div className="pt-2 border-t border-stone-100 text-[11px] font-mono text-purple-700 font-bold">
                ⚠️ Non-Protein Nitrogen Spike
              </div>
            </div>

            {/* Problem 4 */}
            <div className="bg-white p-7 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-lg">
                04
              </div>
              <h3 className="text-xl font-black text-stone-900">Blind AI Overconfidence</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Generic AI applications output single numbers without estimating prediction uncertainty or verifying if the forage type falls within the model's calibration limits.
              </p>
              <div className="pt-2 border-t border-stone-100 text-[11px] font-mono text-emerald-800 font-bold">
                ⚠️ Unchecked Hallucination
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 5. SECTION 4: RAPID FEED TESTING (SCIENTIFIC INSTRUMENTATION)            */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-[#1b4332] text-xs font-black uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-emerald-700" />
            <span>Scientific Instrumentation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1a1e1b] tracking-tight">
            “From a handful of feed to a complete quality profile.”
          </h2>
          <p className="text-lg text-stone-600">
            Fast, non-destructive chemometric screening calibrated specifically for tropical and Indian dairy forages.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Device & Sample Photography */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-300 group">
              <img 
                src="/images/analyzer-scan.jpg" 
                alt="FeedSure Handheld NIR Spectrometer Analyzer scanning green forage silage"
                className="w-full h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#74c69d] font-bold">
                  OPTICAL SCANNING IN PROGRESS
                </span>
                <h4 className="text-lg font-black text-white">
                  FeedSure Rapid NIR Handheld Analyzer
                </h4>
                <p className="text-xs text-stone-300">
                  Dual 900–1700nm reflectance spectrometer with integrated 22-D computer vision texture macro lens.
                </p>
              </div>
            </div>
          </div>

          {/* Right: 4 Step Product Workflow */}
          <div className="lg:col-span-6 space-y-6">
            {[
              {
                num: "01",
                title: "Collect",
                desc: "Gather 5 representative core grab samples across different spatial points of your feed bunk, trench, or bale.",
                tag: "5-Point Spatial Core"
              },
              {
                num: "02",
                title: "Scan",
                desc: "Place sample in the analyzer chamber. The system captures multi-wavelength NIR reflectance curves and macro texture in 3 seconds.",
                tag: "900-1700nm NIR Spectrum"
              },
              {
                num: "03",
                title: "Verify",
                desc: "The Evidence Engine checks signal noise, Mahalanobis calibration domain distance, and spatial sample consistency.",
                tag: "Mahalanobis Domain Gating"
              },
              {
                num: "04",
                title: "Understand",
                desc: "Get an instant plain-language nutrient summary and balanced dairy ration adjustments in your regional language.",
                tag: "Actionable Herd Advisory"
              }
            ].map((st, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs hover:border-[#52b788] hover:shadow-md transition-all flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#1b4332] text-[#74c69d] flex items-center justify-center font-black text-sm shrink-0">
                  {st.num}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-black text-base text-stone-900">{st.title}</h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {st.tag}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Nutritional Parameters Supported */}
        <div className="mt-16 bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
            <div>
              <h3 className="text-xl font-black text-stone-900">Chemometric Nutritional Parameters</h3>
              <p className="text-xs text-stone-500">Calibrated against certified wet-chemistry laboratory wet assays.</p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#1b4332] text-[#74c69d]">
              ISO 12099 / ASTM E1655 Chemometrics Compliant
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-6">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-xs font-bold text-stone-500">Dry Matter (DM %)</div>
              <div className="text-xl font-black text-stone-900 mt-1">35% – 45%</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-1">● Core Supported</div>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-xs font-bold text-stone-500">Crude Protein (CP %)</div>
              <div className="text-xl font-black text-stone-900 mt-1">7% – 24%</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-1">● Core Supported</div>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-xs font-bold text-stone-500">NDF (Neutral Detergent Fiber)</div>
              <div className="text-xl font-black text-stone-900 mt-1">38% – 65%</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-1">● Core Supported</div>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-xs font-bold text-stone-500">ADF (Acid Detergent Fiber)</div>
              <div className="text-xl font-black text-stone-900 mt-1">22% – 42%</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-1">● Core Supported</div>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-xs font-bold text-stone-500">Metabolizable Energy (ME)</div>
              <div className="text-xl font-black text-stone-400 mt-1">MJ / kg DM</div>
              <div className="text-[10px] text-amber-700 font-semibold mt-1">◌ Extension Parameter</div>
            </div>
          </div>
        </div>

      </section>


      {/* ========================================================================= */}
      {/* 6. SECTION 5: EVIDENCE-AWARE AI (HERO HIGH-TECH SECTION)                 */}
      {/* ========================================================================= */}
      <section id="evidence-ai" className="py-24 bg-[#071710] text-white px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#52b788_1px,transparent_1px)] [background-size:32px_32px] opacity-10"></div>

        <div className="max-w-7xl mx-auto relative z-10 space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1b4332] text-[#74c69d] text-xs font-black uppercase tracking-wider border border-[#2d6a4f]">
              <ShieldCheck className="w-4 h-4 text-[#52b788]" />
              <span>Core Technological Breakthrough</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
              “AI that knows when <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-[#74c69d] to-emerald-400">to trust the result.”</span>
            </h2>
            <p className="text-base sm:text-lg text-emerald-100/80 max-w-2xl mx-auto">
              “AI SHOULD KNOW WHEN NOT TO TRUST ITSELF.” When a sample is out-of-domain, non-uniform, or chemically anomalous, FeedSure 360 withholds predictions and safeguards your herd.
            </p>
          </div>

          {/* Interactive Live Scenario Switcher */}
          <div className="bg-[#0e2419] border border-[#2d6a4f] rounded-3xl p-6 sm:p-8 shadow-2xl">
            
            {/* Scenario Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#2d6a4f]/70">
              <span className="text-xs font-mono uppercase text-stone-400 font-bold">
                Select Live Calibration Scenario:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveScenario("trusted")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeScenario === "trusted"
                      ? "bg-emerald-500 text-stone-950 shadow-md font-black"
                      : "bg-[#143725] text-stone-300 hover:text-white"
                  }`}
                >
                  ✓ Scenario A: High-Confidence Scan
                </button>
                <button
                  onClick={() => setActiveScenario("ood")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeScenario === "ood"
                      ? "bg-rose-500 text-white shadow-md font-black"
                      : "bg-[#143725] text-stone-300 hover:text-white"
                  }`}
                >
                  ⚠️ Scenario B: Out-of-Domain Shift
                </button>
                <button
                  onClick={() => setActiveScenario("heterogeneous")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeScenario === "heterogeneous"
                      ? "bg-amber-500 text-stone-950 shadow-md font-black"
                      : "bg-[#143725] text-stone-300 hover:text-white"
                  }`}
                >
                  🔄 Scenario C: Spatial Heterogeneity
                </button>
              </div>
            </div>

            {/* Dynamic Scenario Details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 items-center">
              
              {/* Evidence Meters & Diagnostics */}
              <div className="lg:col-span-7 space-y-6">
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono uppercase text-[#74c69d]">EVIDENCE SUFFICIENCY INDEX</span>
                    <div className="text-3xl sm:text-4xl font-black mt-1">
                      {activeScenario === "trusted" ? "92 / 100" : activeScenario === "ood" ? "34 / 100" : "64 / 100"}
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-2xl text-xs font-black tracking-wider uppercase border ${
                    activeScenario === "trusted"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : activeScenario === "ood"
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  }`}>
                    {activeScenario === "trusted" && "● EVIDENCE SUFFICIENT"}
                    {activeScenario === "ood" && "● RESULT WITHHELD (OUT OF DOMAIN)"}
                    {activeScenario === "heterogeneous" && "● RETEST RECOMMENDED"}
                  </div>
                </div>

                {/* 5 Evidence Factor Checkpoints */}
                <div className="space-y-3 pt-2">
                  {[
                    {
                      label: "1. Spectral Signal-to-Noise Ratio (SNR)",
                      val: activeScenario === "ood" ? "Borderline (Noise at 1450nm)" : "Optimal (> 45 dB)",
                      status: activeScenario === "ood" ? "warn" : "pass"
                    },
                    {
                      label: "2. Mahalanobis Calibration Distance",
                      val: activeScenario === "ood" ? "4.85 (Critical Out-of-Domain)" : "1.42 (Within In-Domain Space)",
                      status: activeScenario === "ood" ? "fail" : "pass"
                    },
                    {
                      label: "3. 5-Point Core Spatial Consistency",
                      val: activeScenario === "heterogeneous" ? "Variance 19.4% (Non-Uniform Grab)" : "Variance 3.2% (Uniform Core)",
                      status: activeScenario === "heterogeneous" ? "fail" : "pass"
                    },
                    {
                      label: "4. Computer Vision Texture Concordance",
                      val: "Agrees with optical chemometrics",
                      status: "pass"
                    },
                    {
                      label: "5. Prediction Uncertainty Confidence Band",
                      val: activeScenario === "trusted" ? "Narrow (±0.3% CP at 95% CI)" : "Wide (±2.8% CP at 95% CI)",
                      status: activeScenario === "trusted" ? "pass" : "warn"
                    }
                  ].map((chk, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#143725]/60 border border-[#2d6a4f]/50 text-xs">
                      <div className="flex items-center gap-2">
                        {chk.status === "pass" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {chk.status === "warn" && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                        {chk.status === "fail" && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                        <span className="text-stone-300">{chk.label}</span>
                      </div>
                      <span className="font-mono font-bold text-stone-200">{chk.val}</span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Right: Simulated Decision Outcome Box */}
              <div className="lg:col-span-5 bg-[#143725] p-6 rounded-3xl border border-[#2d6a4f] space-y-4">
                <span className="text-xs font-mono uppercase text-[#74c69d] font-bold">
                  DECISION ENGINE ACTION
                </span>
                
                {activeScenario === "trusted" && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-black text-emerald-300">
                      ✓ Values Cleared for Dairy Ration Balancer
                    </h4>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      All chemometric checkpoints passed. The 12.8% Crude Protein measurement has a narrow 95% confidence interval and can safely be used to balance your lactating cow feed basket.
                    </p>
                    <div className="p-3 bg-[#0c2418] rounded-xl border border-emerald-500/30 text-xs text-emerald-200">
                      <strong>Prescribed Action:</strong> Apply verified batch metrics directly to dairy feeding plan.
                    </div>
                  </div>
                )}

                {activeScenario === "ood" && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-black text-rose-300">
                      🛑 Predictions Withheld to Prevent Misleading Farmer
                    </h4>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Mahalanobis distance is 4.85, indicating the feed contains unmodeled botanical species or moisture outside the calibrated envelope. Rather than outputting a false number, FeedSure safely flags the sample.
                    </p>
                    <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-500/40 text-xs text-rose-200">
                      <strong>Prescribed Action:</strong> Collect 5 fresh cores or submit for wet-chemistry confirmation.
                    </div>
                  </div>
                )}

                {activeScenario === "heterogeneous" && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-black text-amber-300">
                      🔄 Non-Uniform Core Sampling Detected
                    </h4>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Sampling point 2 differed by &gt;18% from points 1, 3, 4, and 5. This indicates unmixed forage or stratified silage moisture.
                    </p>
                    <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-500/40 text-xs text-amber-200">
                      <strong>Prescribed Action:</strong> Thoroughly remix grab bucket and repeat 5-point scan.
                    </div>
                  </div>
                )}

                <button
                  onClick={() => onEnterApp("evidence")}
                  className="w-full py-3 rounded-xl bg-[#52b788] text-[#1b4332] font-black text-xs hover:bg-[#74c69d] transition shadow-md"
                >
                  Test This in Live Evidence Simulator →
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 7. SECTION 6: SMART FEED ZONE (STORAGE & TROUGH IoT)                     */}
      {/* ========================================================================= */}
      <section id="smart-feed-zone" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-100 text-cyan-900 text-xs font-black uppercase tracking-wider">
            <Wifi className="w-4 h-4 text-cyan-700" />
            <span>Smart Feed Zone Monitoring</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1a1e1b] tracking-tight">
            “Quality doesn't stop at the analyzer.”
          </h2>
          <p className="text-lg text-stone-600">
            FeedSure monitors the microclimate around stored and open feed, using time-series telemetry to detect aerobic heating risks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Silage Bunker Photography with Sensor HUD Pins */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-300 group">
              <img 
                src="/images/silage-bunker.jpg" 
                alt="Silage pit bunker with mounted wireless IoT monitoring probe"
                className="w-full h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Sensor Hotspot Overlay */}
              <div className="absolute top-1/2 left-1/3 bg-black/80 backdrop-blur-md border border-emerald-400 text-white px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-2 shadow-lg">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
                <span>Probe 01: 24.2°C • Normal</span>
              </div>
            </div>
          </div>

          {/* Right: Live Telemetry Station HUD */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="bg-[#122b20] text-white p-6 sm:p-8 rounded-3xl border border-[#2d6a4f] shadow-xl space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-[#2d6a4f]">
                <div>
                  <span className="text-xs font-mono uppercase text-[#74c69d]">STORAGE TELEMETRY NODE</span>
                  <h4 className="text-lg font-black text-white">Pit Bunker Face &amp; Feed Trough</h4>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/40">
                  ONLINE &bull; SYNCED
                </span>
              </div>

              {/* 4 Sensor Telemetry Readouts */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1b4332] p-4 rounded-2xl border border-[#40916c]/30">
                  <div className="flex items-center gap-1.5 text-xs text-stone-300 mb-1">
                    <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                    <span>Silage Face Temp</span>
                  </div>
                  <div className="text-2xl font-black text-white">24.2°C</div>
                  <div className="text-[10px] text-emerald-300 font-mono mt-0.5">Threshold: &lt; 32.0°C</div>
                </div>

                <div className="bg-[#1b4332] p-4 rounded-2xl border border-[#40916c]/30">
                  <div className="flex items-center gap-1.5 text-xs text-stone-300 mb-1">
                    <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Ambient Humidity</span>
                  </div>
                  <div className="text-2xl font-black text-white">64.8% RH</div>
                  <div className="text-[10px] text-cyan-200 font-mono mt-0.5">Optimal Aerobic Stability</div>
                </div>

                <div className="bg-[#1b4332] p-4 rounded-2xl border border-[#40916c]/30">
                  <div className="flex items-center gap-1.5 text-xs text-stone-300 mb-1">
                    <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                    <span>Trough Feed Load</span>
                  </div>
                  <div className="text-2xl font-black text-white">18.4 kg</div>
                  <div className="text-[10px] text-stone-300 font-mono mt-0.5">Load Cell Telemetry</div>
                </div>

                <div className="bg-[#1b4332] p-4 rounded-2xl border border-[#40916c]/30">
                  <div className="flex items-center gap-1.5 text-xs text-stone-300 mb-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Aerobic Exposure</span>
                  </div>
                  <div className="text-2xl font-black text-white">5h 42m</div>
                  <div className="text-[10px] text-emerald-300 font-mono mt-0.5">Within Safe Bunk Window</div>
                </div>
              </div>

              {/* Status Advisory */}
              <div className="p-4 bg-[#143725] rounded-2xl border border-emerald-500/40 text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-300">Storage Environment: STABLE</div>
                  <div className="text-stone-300 text-[11px]">No heat spikes or rapid pH deterioration detected.</div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              </div>

              <button
                onClick={() => onEnterApp("passport")}
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center justify-center space-x-2 transition"
              >
                <span>View Real-Time Silage Telemetry Stream</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#74c69d]" />
              </button>

            </div>

          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 8. SECTION 7: DAIRY NUTRITION & RATION BALANCER (LEVEL 3 INTELLIGENCE)  */}
      {/* ========================================================================= */}
      <section id="dairy-nutrition" className="py-24 bg-stone-100/80 border-y border-stone-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-[#1b4332] text-xs font-black uppercase tracking-wider">
              <FileCheck2 className="w-4 h-4 text-emerald-700" />
              <span>Level 3 Decision Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1a1e1b] tracking-tight">
              “A test is useful only when it changes a decision.”
            </h2>
            <p className="text-lg text-stone-600">
              Translate raw chemometric values into daily cow-level feeding adjustments based on Indian ICAR and NRC nutritional standards.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-xl p-6 sm:p-10 space-y-8">
            
            {/* Herd Profile Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
              <div>
                <div className="text-xs font-mono text-stone-500 uppercase font-bold">DAIRY HERD CONTEXT</div>
                <h3 className="text-xl font-black text-stone-900">Shiv &amp; Amrut Dairy Cluster</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedHerdGroup("lactating")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    selectedHerdGroup === "lactating"
                      ? "bg-[#1b4332] text-white shadow-xs"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  🐄 17 Lactating Cows (14.5 L/day)
                </button>
                <button
                  onClick={() => setSelectedHerdGroup("dry")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    selectedHerdGroup === "dry"
                      ? "bg-[#1b4332] text-white shadow-xs"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  🌾 7 Dry Period Cows
                </button>
              </div>
            </div>

            {/* Daily Feed Basket & Balanced Ratios */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-4">
                <h4 className="text-xs font-mono uppercase text-stone-500 font-bold">
                  ACTIVE FEED BASKET CONTRIBUTIONS
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                    <span className="font-bold text-stone-800">Tested Maize Silage (38.6% DM, 12.8% CP)</span>
                    <span className="font-mono font-black text-[#1b4332]">18.0 kg / cow / day</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                    <span className="font-bold text-stone-800">Green Hybrid Napier Grass</span>
                    <span className="font-mono font-black text-emerald-800">12.0 kg / cow / day</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                    <span className="font-bold text-stone-800">Dry Wheat Straw (Roughage Buffer)</span>
                    <span className="font-mono font-black text-amber-800">4.0 kg / cow / day</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                    <span className="font-bold text-stone-800">Commercial 22% CP Concentrate</span>
                    <span className="font-mono font-black text-purple-800">4.5 kg / cow / day</span>
                  </div>
                </div>
              </div>

              {/* Nutritional Review Box */}
              <div className="lg:col-span-5 bg-[#122b20] text-white p-6 rounded-3xl border border-[#2d6a4f] space-y-4">
                <span className="text-xs font-mono uppercase text-[#74c69d] font-bold">
                  NUTRITIONAL BALANCE REVIEW
                </span>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-[#2d6a4f]/70 pb-2">
                    <span className="text-stone-300">Crude Protein Balance</span>
                    <span className="font-bold text-emerald-400">● OPTIMAL (+0.4 kg/cow)</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#2d6a4f]/70 pb-2">
                    <span className="text-stone-300">Effective Fiber (NDF)</span>
                    <span className="font-bold text-emerald-400">● BALANCED (31.8% DM)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-300">Estimated Energy Density</span>
                    <span className="font-bold text-cyan-300">6.8 MJ / kg DM</span>
                  </div>
                </div>

                {/* Plain-Language Advisory */}
                <div className="p-3.5 bg-[#1b4332] rounded-2xl border border-emerald-500/40 text-xs">
                  <div className="font-bold text-[#74c69d] mb-1">Vernacular Advisory:</div>
                  <p className="text-stone-200 leading-relaxed text-[11px]">
                    “Current silage batch has high dry matter (38.6%). You can safely reduce concentrate by 300g per cow, saving input costs while protecting milk yield.”
                  </p>
                </div>

                <button
                  onClick={() => onEnterApp("ration")}
                  className="w-full py-2.5 rounded-xl bg-[#52b788] text-[#1b4332] font-black text-xs hover:bg-[#74c69d] transition shadow-md"
                >
                  Adjust Dairy Ration in Live Balancer →
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 9. SECTION 9: FEED QUALITY PASSPORT & TRACEABILITY                       */}
      {/* ========================================================================= */}
      <section id="passport" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-[#1b4332] text-xs font-black uppercase tracking-wider">
            <QrCode className="w-4 h-4 text-emerald-700" />
            <span>Cryptographic Traceability</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1a1e1b] tracking-tight">
            “Every batch gets a story.”
          </h2>
          <p className="text-lg text-stone-600">
            From field sample to verifiable feeding decision — sealed with an immutable SHA-256 cryptographic passport.
          </p>
        </div>

        {/* Digital Passport Card Preview */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border-2 border-[#1b4332] shadow-2xl p-6 sm:p-10 space-y-8 relative overflow-hidden">
          
          {/* Certificate Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-stone-200 gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-[#1b4332] flex items-center justify-center text-[#74c69d] shadow-md">
                <CattleLogo className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#2d6a4f] font-bold">
                  VERIFIED FEED QUALITY PASSPORT &bull; PROVENANCE RECORD
                </span>
                <h3 className="text-2xl font-black text-stone-900 tracking-tight">
                  Batch #FS360-2026-MZ-8821
                </h3>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 font-mono text-xs font-bold border border-emerald-300">
                PASSED &bull; GRADE I SILAGE
              </span>
            </div>
          </div>

          {/* Key Metrics Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-stone-500 font-medium">Forage Type</span>
              <div className="text-base font-black text-stone-900 mt-1">Maize Silage</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-stone-500 font-medium">Crude Protein</span>
              <div className="text-base font-black text-emerald-800 mt-1">12.8% (DM)</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-stone-500 font-medium">Evidence Score</span>
              <div className="text-base font-black text-[#1b4332] mt-1">92.4% High</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-stone-500 font-medium">Flieg Ferment Score</span>
              <div className="text-base font-black text-cyan-800 mt-1">88 / 100</div>
            </div>
          </div>

          {/* Cryptographic SHA-256 Ledger Stamp */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-[10px] font-mono uppercase text-stone-500 font-bold">
                SHA-256 IMMUTABLE AUDIT HASH
              </div>
              <div className="font-mono text-xs text-stone-800 break-all font-semibold">
                e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
              </div>
            </div>
            <button
              onClick={() => onEnterApp("passport")}
              className="px-5 py-2.5 rounded-xl bg-[#1b4332] text-[#74c69d] font-bold text-xs shrink-0 hover:bg-[#2d6a4f] transition flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4" />
              <span>Inspect Full QR Card</span>
            </button>
          </div>

        </div>

      </section>


      {/* ========================================================================= */}
      {/* 10. SECTION 11: TECHNOLOGY ARCHITECTURE GRID                             */}
      {/* ========================================================================= */}
      <section className="py-24 bg-stone-100/80 border-t border-stone-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1b4332] text-[#74c69d] text-xs font-black uppercase tracking-wider">
              <Zap className="w-4 h-4 text-[#52b788]" />
              <span>Technology Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1a1e1b] tracking-tight">
              Engineered for Scientific Precision &amp; Field Reliability
            </h2>
            <p className="text-lg text-stone-600">
              Six synchronized technological pillars driving next-generation dairy precision nutrition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm hover:shadow-lg transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#1b4332] flex items-center justify-center">
                <Activity className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="text-xl font-black text-stone-900">NIR Spectroscopy</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Dual 900–1700nm reflectance chemometrics with Partial Least Squares Regression (PLSR) models calibrated across Indian tropical forages.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm hover:shadow-lg transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center">
                <Eye className="w-6 h-6 text-cyan-700" />
              </div>
              <h3 className="text-xl font-black text-stone-900">Computer Vision Screening</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                22-dimensional surface texture granularity, mold discoloration detection, and macro particle analysis to detect physical feed contamination.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm hover:shadow-lg transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="text-xl font-black text-stone-900">Evidence-Aware AI Engine</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Mahalanobis distance domain gating, 5-point spatial variance checking, and ensemble uncertainty bounds to prevent bad predictions.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm hover:shadow-lg transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center">
                <Wifi className="w-6 h-6 text-purple-700" />
              </div>
              <h3 className="text-xl font-black text-stone-900">IoT Silage Telemetry</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Wireless stainless temperature and humidity probes for trench bunkers, tracking aerobic exposure hours and heating risks.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm hover:shadow-lg transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#1b4332] flex items-center justify-center">
                <FileCheck2 className="w-6 h-6 text-emerald-800" />
              </div>
              <h3 className="text-xl font-black text-stone-900">ICAR / NRC Dairy Balancer</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Physiological nutrition balancer tuned for Bos indicus and crossbred dairy cattle requirements across all lactation stages.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm hover:shadow-lg transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-800 flex items-center justify-center">
                <Database className="w-6 h-6 text-stone-700" />
              </div>
              <h3 className="text-xl font-black text-stone-900">Cryptographic Quality Passport</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Immutable SHA-256 batch ledger tracking feed batches from harvest through testing, storage, and ration consumption.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 11. SECTION 12: HARDWARE & EDGE SENSORS                                  */}
      {/* ========================================================================= */}
      <section id="hardware" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-200 text-stone-800 text-xs font-black uppercase tracking-wider">
            <HardDrive className="w-4 h-4 text-stone-700" />
            <span>Hardware Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1a1e1b] tracking-tight">
            Dual Hardware Node Architecture
          </h2>
          <p className="text-lg text-stone-600">
            Engineered with clean device abstraction layers — running seamlessly in software simulation or physical devices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: FeedSure Rapid Handheld Analyzer */}
          <div className="bg-gradient-to-br from-[#122b20] to-[#1b4332] text-white p-8 rounded-3xl border border-[#2d6a4f] shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-[#74c69d] font-bold">DEVICE NODE A</span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                FIELD PORTABLE
              </span>
            </div>

            <h3 className="text-2xl font-black text-white">
              FeedSure Rapid Handheld Analyzer
            </h3>

            <ul className="space-y-3 text-xs text-stone-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#74c69d]" />
                <span>Multi-wavelength NIR Reflection Spectrometer (900–1700nm)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#74c69d]" />
                <span>High-CRI Uniform Illumination Optical Aperture</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#74c69d]" />
                <span>Dual-Core ESP32-S3 Microcontroller with on-device calibration cache</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#74c69d]" />
                <span>240×240 Sunlight-Readable OLED Status Screen</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#74c69d]" />
                <span>IP65 Rugged Dust &amp; Moisture Sealed Enclosure</span>
              </li>
            </ul>

            <div className="pt-4 border-t border-[#2d6a4f] flex items-center justify-between text-xs">
              <span className="text-stone-400 font-mono">Scan Duration: 3.2s</span>
              <span className="text-[#74c69d] font-bold">12-Hour Battery Runtime</span>
            </div>
          </div>

          {/* Card 2: Smart Feed Zone Storage Node */}
          <div className="bg-gradient-to-br from-[#122b20] to-[#1b4332] text-white p-8 rounded-3xl border border-[#2d6a4f] shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-[#74c69d] font-bold">DEVICE NODE B</span>
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/40">
                CONTINUOUS IoT
              </span>
            </div>

            <h3 className="text-2xl font-black text-white">
              Smart Feed Zone Bunker &amp; Trough Station
            </h3>

            <ul className="space-y-3 text-xs text-stone-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#74c69d]" />
                <span>Stainless Steel Immersion Temperature Probes (-10°C to +85°C)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#74c69d]" />
                <span>Industrial Capacitive Relative Humidity Sensor (&plusmn;2% RH)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#74c69d]" />
                <span>4-Point Trough Load Cell Weight Interface for Intake Logging</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#74c69d]" />
                <span>Low-Power BLE 5.0 &amp; Sub-GHz Mesh Wireless Network</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#74c69d]" />
                <span>Solar-Recharged 18650 Battery Pack (18-Month Continuous Life)</span>
              </li>
            </ul>

            <div className="pt-4 border-t border-[#2d6a4f] flex items-center justify-between text-xs">
              <span className="text-stone-400 font-mono">Sampling Cycle: 60s</span>
              <span className="text-cyan-300 font-bold">Automated Exposure Clock</span>
            </div>
          </div>

        </div>

      </section>


      {/* ========================================================================= */}
      {/* 12. SECTION 13: FARMER EXPERIENCE & MULTILINGUAL                         */}
      {/* ========================================================================= */}
      <section className="py-24 bg-stone-100/80 border-t border-stone-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Indian Farmer Photography */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-300 group">
              <img 
                src="/images/farmer-feed.jpg" 
                alt="Indian Dairy Farmer inspecting freshly chopped forage in cattle barn"
                className="w-full h-[450px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#74c69d] font-bold">
                  PROGRESSIVE DAIRY ADVISORY
                </span>
                <h4 className="text-xl font-black text-white">
                  Designed for Indian Barns &amp; Rural Conditions
                </h4>
              </div>
            </div>
          </div>

          {/* Right: Farmer UX Highlights */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-[#1b4332] text-xs font-black uppercase tracking-wider">
              <Smartphone className="w-4 h-4 text-emerald-700" />
              <span>Farmer-Centric Experience</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-[#1a1e1b] tracking-tight">
              “Built for the farm, not the laboratory.”
            </h2>

            <p className="text-sm text-stone-600 leading-relaxed">
              No complicated spectral charts or chemical equations required. FeedSure 360 presents clear, high-contrast visual status cards in your preferred regional language.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
                <div className="font-bold text-stone-900 text-sm">100% Offline-Ready</div>
                <div className="text-xs text-stone-500 mt-1">Runs on-device with local SQLite cache. No internet needed in the barn.</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
                <div className="font-bold text-stone-900 text-sm">3 Vernacular Languages</div>
                <div className="text-xs text-stone-500 mt-1">Native English, हिन्दी, and मराठी language toggles.</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
                <div className="font-bold text-stone-900 text-sm">Farmer / Expert Mode</div>
                <div className="text-xs text-stone-500 mt-1">Simplified plain guidance for herdsmen; deep PLSR curves for vets.</div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
                <div className="font-bold text-stone-900 text-sm">Instant Retest Prompts</div>
                <div className="text-xs text-stone-500 mt-1">Tells you exactly how to remix non-uniform forage cores.</div>
              </div>
            </div>

            <button
              onClick={() => onEnterApp("dashboard")}
              className="px-6 py-3.5 rounded-full bg-[#1b4332] text-white font-bold text-xs hover:bg-[#2d6a4f] transition flex items-center gap-2 shadow-md"
            >
              <span>Explore Farmer Mode Interface</span>
              <ArrowRight className="w-4 h-4 text-[#74c69d]" />
            </button>
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 13. SECTION 14: INTERACTIVE PRODUCT DEMO PREVIEW                         */}
      {/* ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1b4332] text-[#74c69d] text-xs font-black uppercase tracking-wider">
            <BarChart3 className="w-4 h-4 text-[#52b788]" />
            <span>Interactive Application Demo</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1a1e1b] tracking-tight">
            Explore the Live FeedSure 360 Platform
          </h2>
          <p className="text-lg text-stone-600">
            Click any module below to jump directly into the active software prototype.
          </p>
        </div>

        {/* 5-Module Direct Launcher Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { id: "dashboard", title: "Executive Dashboard", desc: "Herd overview, alert feed & rapid testing status.", badge: "Overview" },
            { id: "nir-scan", title: "NIR Multi-Point Scan", desc: "5-point spatial grid & heterogeneity engine.", badge: "Spectrometry" },
            { id: "evidence", title: "Evidence Engine", desc: "Mahalanobis distance & uncertainty band checks.", badge: "AI Verification" },
            { id: "ration", title: "Dairy Ration Balancer", desc: "ICAR/NRC protein & fiber herd requirement balancer.", badge: "Advisory" },
            { id: "passport", title: "Quality Passport", desc: "Flieg fermentation score & SHA-256 batch ledger.", badge: "Traceability" },
          ].map((mod) => (
            <div
              key={mod.id}
              onClick={() => onEnterApp(mod.id)}
              className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs hover:shadow-xl hover:border-[#1b4332] hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
                  {mod.badge}
                </span>
                <h3 className="font-black text-lg text-stone-900 mt-4 mb-2 group-hover:text-[#1b4332] transition-colors">
                  {mod.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {mod.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#1b4332] group-hover:text-[#2d6a4f]">
                <span>Launch Module</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

      </section>


      {/* ========================================================================= */}
      {/* 14. SECTION 15: FINAL CINEMATIC CALL TO ACTION                           */}
      {/* ========================================================================= */}
      <section className="py-24 bg-gradient-to-b from-[#0e271b] via-[#122f20] to-[#0a1f15] text-white text-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        
        {/* Background Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#52b788_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#52b788]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10 space-y-8">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#52b788]/20 border border-[#52b788]/40 text-[#74c69d] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Start Smarter Dairy Testing</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            “Test Smarter.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#74c69d] via-[#d4a373] to-amber-300">
              Trust the Evidence. Protect the Feed.”
            </span>
          </h2>

          <p className="text-base sm:text-xl text-emerald-100/90 font-normal max-w-2xl mx-auto leading-relaxed">
            FeedSure 360 brings rapid testing, evidence-aware AI safeguards, storage intelligence, and dairy nutrition together in one unified platform.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onEnterApp("dashboard")}
              className="w-full sm:w-auto px-10 py-5 rounded-full bg-gradient-to-r from-[#52b788] via-[#74c69d] to-[#52b788] text-[#1b4332] font-black text-lg shadow-2xl hover:scale-105 hover:shadow-emerald-500/20 transition-all flex items-center justify-center space-x-3 cursor-pointer"
            >
              <span>Explore the Platform</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => onEnterApp("nir-scan")}
              className="w-full sm:w-auto px-9 py-5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/25 font-bold text-lg backdrop-blur-md hover:scale-105 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Run a Feed Test</span>
            </button>
          </div>

          <div className="pt-8 text-xs text-stone-400 font-mono">
            Zero physical hardware required for demonstration &bull; 100% software simulated telemetry
          </div>

        </div>
      </section>


      {/* ========================================================================= */}
      {/* 15. ENTERPRISE FOOTER                                                    */}
      {/* ========================================================================= */}
      <footer className="bg-[#071710] text-stone-400 text-xs py-16 px-4 sm:px-6 lg:px-8 border-t border-[#1b4332]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#52b788] to-[#74c69d] flex items-center justify-center text-[#1b4332] shadow-sm">
                <CattleLogo className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                FeedSure <span className="text-[#52b788]">360</span>
              </span>
            </div>
            
            <p className="text-stone-400 text-xs leading-relaxed max-w-sm">
              Adaptive evidence-aware feed &amp; silage intelligence platform for progressive Indian dairy farmers, cooperatives, and agronomic nutritionists.
            </p>

            <div className="text-[11px] font-mono text-stone-400 space-y-1">
              <div>Ministry of Fisheries, Animal Husbandry &amp; Dairying</div>
              <div>ISO 12099 / ASTM E1655 Chemometrics Compliant</div>
            </div>
          </div>

          {/* Col 2: Core Platform Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs font-mono">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onEnterApp("dashboard")} className="hover:text-[#74c69d] transition">Executive Dashboard</button>
              </li>
              <li>
                <button onClick={() => onEnterApp("nir-scan")} className="hover:text-[#74c69d] transition">Rapid NIR Feed Scan</button>
              </li>
              <li>
                <button onClick={() => onEnterApp("evidence")} className="hover:text-[#74c69d] transition">Evidence Gating Engine</button>
              </li>
              <li>
                <button onClick={() => onEnterApp("ration")} className="hover:text-[#74c69d] transition">Dairy Ration Assessor</button>
              </li>
              <li>
                <button onClick={() => onEnterApp("passport")} className="hover:text-[#74c69d] transition">Digital Twin Passport</button>
              </li>
            </ul>
          </div>

          {/* Col 3: Technology */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs font-mono">Technology</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => scrollToSection("evidence-ai")} className="hover:text-[#74c69d] transition">NIR Spectroscopy</button></li>
              <li><button onClick={() => scrollToSection("evidence-ai")} className="hover:text-[#74c69d] transition">Computer Vision Texture</button></li>
              <li><button onClick={() => scrollToSection("evidence-ai")} className="hover:text-[#74c69d] transition">Mahalanobis OOD Gating</button></li>
              <li><button onClick={() => scrollToSection("smart-feed-zone")} className="hover:text-[#74c69d] transition">Smart Feed Zone IoT</button></li>
              <li><button onClick={() => scrollToSection("hardware")} className="hover:text-[#74c69d] transition">Hardware Edge Nodes</button></li>
            </ul>
          </div>

          {/* Col 4: Languages & Support */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs font-mono">Languages</h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => changeLanguage('en')}
                className={`text-left text-xs ${lang === 'en' ? 'text-[#74c69d] font-bold' : 'hover:text-white'}`}
              >
                English (Default)
              </button>
              <button
                onClick={() => changeLanguage('hi')}
                className={`text-left text-xs ${lang === 'hi' ? 'text-[#74c69d] font-bold' : 'hover:text-white'}`}
              >
                हिन्दी (Hindi)
              </button>
              <button
                onClick={() => changeLanguage('mr')}
                className={`text-left text-xs ${lang === 'mr' ? 'text-[#74c69d] font-bold' : 'hover:text-white'}`}
              >
                मराठी (Marathi)
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Strip */}
        <div className="max-w-7xl mx-auto pt-10 mt-10 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-400">
          <div>
            &copy; 2026 FeedSure 360 &bull; All Rights Reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>&bull;</span>
            <span>Terms of Use</span>
            <span>&bull;</span>
            <span>Agricultural Safety Guidelines</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
