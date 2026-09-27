"use client";

import React from 'react';
import { ShieldCheck, Cpu, Globe, UserCheck, AlertTriangle } from 'lucide-react';
import { dictionary, Language } from '../lib/dictionary';

interface NavbarProps {
  lang: Language;
  setLang: (l: Language) => void;
  farmerMode: boolean;
  setFarmerMode: (m: boolean) => void;
  activeTab: string;
  setActiveTab: (t: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  setLang,
  farmerMode,
  setFarmerMode,
  activeTab,
  setActiveTab
}) => {
  const t = dictionary[lang];

  return (
    <header className="sticky top-0 z-50 bg-[#1b4332]/95 backdrop-blur-md text-white border-b border-[#2d6a4f] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#52b788] to-[#74c69d] flex items-center justify-center text-[#1b4332] font-black text-xl shadow-inner group-hover:scale-105 transition-transform">
              360
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-[#d4a373] to-[#52b788]">
                {t.appName}
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#2d6a4f] text-[#74c69d] border border-[#40916c]/40">
                SIH 2026
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2 text-sm font-medium">
            {[
              { id: 'landing', label: 'Overview' },
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'testing', label: 'Feed Testing' },
              { id: 'silage', label: 'Silage Telemetry' },
              { id: 'ration', label: 'Dairy Ration' },
              { id: 'twin', label: 'Digital Twin & Passport' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-[#2d6a4f] text-[#74c69d] font-semibold border border-[#40916c]/40'
                    : 'text-gray-200 hover:text-white hover:bg-[#2d6a4f]/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Controls: Language & Farmer/Expert Mode */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Language Dropdown */}
            <div className="flex items-center bg-[#2d6a4f]/60 border border-[#40916c]/40 rounded-lg px-2 py-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-[#74c69d] mr-1" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Language)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="en" className="bg-[#1b4332]">English</option>
                <option value="hi" className="bg-[#1b4332]">हिंदी (Hindi)</option>
                <option value="mr" className="bg-[#1b4332]">मराठी (Marathi)</option>
              </select>
            </div>

            {/* Mode Switcher */}
            <button
              onClick={() => setFarmerMode(!farmerMode)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                farmerMode
                  ? 'bg-amber-600/30 text-amber-200 border-amber-500/50'
                  : 'bg-emerald-600/30 text-emerald-200 border-emerald-500/50'
              }`}
              title="Toggle between Farmer Mode (simplified) and Expert Mode (technical parameters)"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{farmerMode ? t.farmerMode : t.expertMode}</span>
            </button>

          </div>
        </div>

        {/* Sub-header Notice */}
        <div className="py-1 border-t border-[#2d6a4f]/50 flex items-center justify-between text-[11px] text-[#74c69d]">
          <div className="flex items-center space-x-1.5">
            <Cpu className="w-3 h-3 text-amber-400 animate-pulse" />
            <span className="font-semibold text-amber-300 tracking-wide">
              {t.simulatedDeviceBadge}
            </span>
          </div>
          <div className="hidden sm:flex items-center space-x-2">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>{t.offlineNotice}</span>
          </div>
        </div>

      </div>
    </header>
  );
};
