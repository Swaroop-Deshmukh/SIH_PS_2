"use client";

import React, { useState, useEffect } from 'react';
import { Globe, UserCheck, Trophy, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { dictionary, Language } from '../lib/dictionary';
import { offlineQueue, OfflineStatus } from '../lib/offlineQueue';

interface NavbarProps {
  lang: Language;
  setLang: (l: Language) => void;
  farmerMode: boolean;
  setFarmerMode: (m: boolean) => void;
  activeTab: string;
  setActiveTab: (t: string) => void;
}

export const CattleLogo: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    aria-label="Cattle Logo"
  >
    {/* Curved Horns */}
    <path d="M3.5 5.5C4.5 8 6.5 9.5 8.5 10" />
    <path d="M20.5 5.5C19.5 8 17.5 9.5 15.5 10" />
    {/* Ears */}
    <path d="M2.5 11.5C3.5 10.5 6 11 6.5 12.5" />
    <path d="M21.5 11.5C20.5 10.5 18 11 17.5 12.5" />
    {/* Head Outline */}
    <path d="M7 9.5H17C18.5 9.5 19 11 18.5 13.5C18 16 16.5 18 15 20C13.5 21 10.5 21 9 20C7.5 18 6 16 5.5 13.5C5 11 5.5 9.5 7 9.5Z" />
    {/* Eyes */}
    <circle cx="9" cy="13.5" r="1" fill="currentColor" />
    <circle cx="15" cy="13.5" r="1" fill="currentColor" />
    {/* Muzzle & Nostrils */}
    <path d="M8.5 17C8.5 16 10 15.5 12 15.5C14 15.5 15.5 16 15.5 17C15.5 18.5 14 19.5 12 19.5C10 19.5 8.5 18.5 8.5 17Z" />
    <circle cx="10.5" cy="17.5" r="0.6" fill="currentColor" />
    <circle cx="13.5" cy="17.5" r="0.6" fill="currentColor" />
  </svg>
);

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  setLang,
  farmerMode,
  setFarmerMode,
  activeTab,
  setActiveTab
}) => {
  const [offlineStatus, setOfflineStatus] = useState<OfflineStatus>({
    isOnline: true,
    pendingCount: 0,
    isSyncing: false,
    lastSyncedAt: null,
  });

  useEffect(() => {
    return offlineQueue.subscribe((s) => setOfflineStatus(s));
  }, []);

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#52b788] to-[#74c69d] flex items-center justify-center text-[#1b4332] shadow-inner group-hover:scale-105 transition-transform">
              <CattleLogo className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-[#d4a373] to-[#52b788]">
                {t.appName}
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
            
            {/* Rural Offline Sync Status Pill */}
            <button
              onClick={() => offlineQueue.flushQueue()}
              title={
                !offlineStatus.isOnline
                  ? `Offline Mode: ${offlineStatus.pendingCount} actions saved locally. Click to retry sync.`
                  : offlineStatus.pendingCount > 0
                  ? `${offlineStatus.pendingCount} pending actions. Click to sync now.`
                  : "All local farm data synced with server."
              }
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                !offlineStatus.isOnline
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : offlineStatus.pendingCount > 0
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {!offlineStatus.isOnline ? (
                <WifiOff className="w-3 h-3 text-amber-400" />
              ) : offlineStatus.isSyncing ? (
                <RefreshCw className="w-3 h-3 text-blue-300 animate-spin" />
              ) : (
                <Wifi className="w-3 h-3 text-emerald-400" />
              )}
              <span>
                {!offlineStatus.isOnline
                  ? `Offline (${offlineStatus.pendingCount})`
                  : offlineStatus.isSyncing
                  ? 'Syncing...'
                  : offlineStatus.pendingCount > 0
                  ? `Sync (${offlineStatus.pendingCount})`
                  : 'Synced'}
              </span>
            </button>

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
