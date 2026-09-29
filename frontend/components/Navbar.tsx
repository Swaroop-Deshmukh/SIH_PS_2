"use client";

import React from "react";
import { Globe, UserCheck, User, BellRing, History, Cpu } from "lucide-react";
import { dictionary, Language } from "../lib/dictionary";
import { AuthUser } from "../lib/api";

interface NavbarProps {
  lang: Language;
  setLang: (l: Language) => void;
  farmerMode: boolean;
  setFarmerMode: (m: boolean) => void;
  activeTab: string;
  setActiveTab: (t: string) => void;
  currentUser?: AuthUser | null;
  onOpenAuth?: () => void;
  alertCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  setLang,
  farmerMode,
  setFarmerMode,
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  alertCount = 0,
}) => {
  const t = dictionary[lang];

  return (
    <header className="sticky top-0 z-50 bg-[#1b4332]/95 backdrop-blur-md text-white border-b border-[#2d6a4f] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div
            onClick={() => setActiveTab("landing")}
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
          <nav className="hidden lg:flex space-x-1 text-xs font-bold">
            {[
              { id: "landing", label: t.nav.overview },
              { id: "dashboard", label: t.nav.dashboard },
              { id: "testing", label: t.nav.testing },
              { id: "feedzone", label: "Smart Feed Zone" },
              { id: "silage", label: t.nav.silage },
              { id: "ration", label: t.nav.ration },
              { id: "twin", label: t.nav.twin },
              { id: "history", label: "History" },
              { id: "alerts", label: "Alerts" },
              { id: "benchmarks", label: "ML & Hardware" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                  activeTab === item.id
                    ? "bg-[#2d6a4f] text-[#74c69d] font-bold border border-[#40916c]/40"
                    : "text-gray-200 hover:text-white hover:bg-[#2d6a4f]/50"
                }`}
              >
                <span>{item.label}</span>
                {item.id === "alerts" && alertCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500 text-white font-mono">
                    {alertCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Right Controls: Language & Farmer/Expert Mode & Auth */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
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
              className={`flex shrink-0 items-center justify-center space-x-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                farmerMode
                  ? "bg-amber-600/30 text-amber-200 border-amber-500/50"
                  : "bg-emerald-600/30 text-emerald-200 border-emerald-500/50"
              }`}
              onClick={() => setFarmerMode(!farmerMode)}
              title="Toggle between Farmer Mode (simplified) and Expert Mode (technical parameters)"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{farmerMode ? t.farmerMode : t.expertMode}</span>
            </button>

            {/* Auth / User Profile */}
            <button
              onClick={onOpenAuth}
              className="flex shrink-0 items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition"
              title="User Account & RBAC Roles"
            >
              <User className="w-3.5 h-3.5 text-[#74c69d]" />
              <span className="hidden md:inline font-mono text-[11px]">
                {currentUser ? currentUser.username : "Login"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
