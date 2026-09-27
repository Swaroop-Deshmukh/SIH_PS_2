"use client";

import React from 'react';
import { Sliders, CheckCircle2, AlertOctagon, RefreshCw, Flame, ShieldAlert } from 'lucide-react';
import { dictionary, Language } from '../lib/dictionary';

interface ScenarioBarProps {
  lang: Language;
  currentScenario: string;
  onSelectScenario: (scenarioId: string) => void;
  loading: boolean;
}

export const ScenarioBar: React.FC<ScenarioBarProps> = ({
  lang,
  currentScenario,
  onSelectScenario,
  loading
}) => {
  const t = dictionary[lang];

  const scenarios = [
    {
      id: 'healthy',
      label: 'Scenario A: Healthy',
      badge: 'TRUSTED',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: CheckCircle2
    },
    {
      id: 'heterogeneous',
      label: 'Scenario B: Heterogeneous',
      badge: 'RETEST',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: RefreshCw
    },
    {
      id: 'ood',
      label: 'Scenario C: Out-of-Distribution',
      badge: 'NOT TRUSTED',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      icon: AlertOctagon
    },
    {
      id: 'storage_warning',
      label: 'Scenario D: Storage Spoilage',
      badge: 'STORAGE ALERT',
      badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      icon: Flame
    },
    {
      id: 'adulteration',
      label: 'Scenario E: Adulteration',
      badge: 'SUSPECTED UREA',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      icon: ShieldAlert
    }
  ];

  return (
    <div className="bg-[#122b20] border-b border-[#2d6a4f] py-2 px-4 text-white shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-xs text-[#74c69d]">
          <Sliders className="w-4 h-4 text-amber-400" />
          <span className="font-bold tracking-wide uppercase">{t.scenariosLabel}</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            const isSelected = currentScenario === sc.id;

            return (
              <button
                key={sc.id}
                disabled={loading}
                onClick={() => onSelectScenario(sc.id)}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-[#2d6a4f] text-white border-[#52b788] shadow-lg ring-2 ring-[#52b788]/50 scale-105'
                    : 'bg-[#1b4332]/80 text-gray-300 border-[#2d6a4f] hover:bg-[#2d6a4f]/50 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#74c69d]' : 'text-gray-400'}`} />
                <span>{sc.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold border ${sc.badgeBg}`}>
                  {sc.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
