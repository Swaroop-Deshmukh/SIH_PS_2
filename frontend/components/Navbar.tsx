"use client";

import React from 'react';
import { Globe, UserCheck, Trophy } from 'lucide-react';
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

  const navItems = [
    { id: 'landing', label: t.nav.overview, activeMatch: ['landing'] },
    { id: 'dashboard', label: t.nav.dashboard, activeMatch: ['dashboard'] },
    { id: 'feed-type', label: 'Feed Matrix', activeMatch: ['feed-type'] },
    { id: 'nir-scan', label: 'NIR Scan', activeMatch: ['nir-scan', 'testing'] },
    { id: 'evidence', label: 'Evidence', activeMatch: ['evidence'] },
    { id: 'nutrition', label: 'Nutrition', activeMatch: ['nutrition'] },
    { id: 'camera', label: 'Camera & Urea', activeMatch: ['camera'] },
    { id: 'ration', label: t.nav.ration, activeMatch: ['ration'] },
    { id: 'passport', label: 'Passport & IoT', activeMatch: ['passport', 'silage', 'twin'] }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#1b4332]/95 backdrop-blur-md text-white border-b border-[#2d6a4f] shadow-md no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center space-x-3 cursor-pointer group shrink-0"
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
          <nav className="hidden lg:flex space-x-1 text-xs font-medium overflow-x-auto py-1">
            {navItems.map((item) => {
              const isItemActive = item.activeMatch.includes(activeTab);
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    isItemActive
                      ? 'bg-[#2d6a4f] text-[#74c69d] font-bold border border-[#40916c]/40'
                      : 'text-gray-200 hover:text-white hover:bg-[#2d6a4f]/50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Language & Farmer/Expert Mode */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            
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
              className={`flex shrink-0 items-center justify-center space-x-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                farmerMode
                  ? 'bg-amber-600/30 text-amber-200 border-amber-500/50'
                  : 'bg-emerald-600/30 text-emerald-200 border-emerald-500/50'
              }`}
              onClick={() => setFarmerMode(!farmerMode)}
              title="Toggle between Farmer Mode (simplified) and Expert Mode (technical parameters)"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{farmerMode ? t.farmerMode : t.expertMode}</span>
            </button>

          </div>
        </div>

      </div>
    </header>
  );
};
