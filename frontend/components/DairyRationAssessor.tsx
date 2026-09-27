"use client";

import React, { useState } from 'react';
import { Milk, Lightbulb } from 'lucide-react';
import { dictionary, Language } from '../lib/dictionary';
import { BatchAnalyzeResponse } from '../lib/api';

interface DairyRationAssessorProps {
  lang: Language;
  data: BatchAnalyzeResponse;
  farmerMode: boolean;
}

export const DairyRationAssessor: React.FC<DairyRationAssessorProps> = ({ data }) => {
  const { nutritional_analysis } = data;

  // Editable Dairy Profile & Feed Basket State
  const [lactatingCount, setLactatingCount] = useState(17);
  const [dryCount, setDryCount] = useState(7);

  const [basketItems, setBasketItems] = useState([
    { id: 1, name: "Maize Silage (Tested Batch)", quantityKg: 20, cpPct: nutritional_analysis.crude_protein_pct, dmPct: nutritional_analysis.dry_matter_pct },
    { id: 2, name: "Green Napier Grass", quantityKg: 10, cpPct: 11.2, dmPct: 22.0 },
    { id: 3, name: "Wheat Straw", quantityKg: 4, cpPct: 4.2, dmPct: 88.5 },
    { id: 4, name: "Compound Feed Concentrate", quantityKg: 5, cpPct: 18.5, dmPct: 90.0 }
  ]);

  // Recalculate Weighted CP
  const totalKg = basketItems.reduce((acc, item) => acc + item.quantityKg, 0) || 1;
  const weightedCp = basketItems.reduce((acc, item) => acc + (item.quantityKg * item.cpPct), 0) / totalKg;
  const targetCp = 13.5;
  const cpGap = Number((targetCp - weightedCp).toFixed(1));

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">
            <Milk className="w-4 h-4 text-[#52b788]" />
            <span>LEVEL 3 INTELLIGENCE • DAIRY FEEDING DECISION-SUPPORT</span>
          </div>
          <h2 className="text-2xl font-black text-[#1a1e1b]">Dairy Nutrition Profile & Ration Assessment</h2>
          <p className="text-xs text-stone-500 mt-1">
            Integrates actual measured feed quality into daily total mixed ration (TMR) balance.
          </p>
        </div>

        <div className="bg-[#1b4332] text-white px-4 py-3 rounded-xl border border-[#2d6a4f] text-right">
          <div className="text-[11px] text-[#74c69d] font-bold">RATION PROTEIN CONTRIBUTION</div>
          <div className="text-xl font-black">{weightedCp.toFixed(1)}% <span className="text-xs text-stone-300">vs {targetCp}% Target</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Dairy Herd Profile */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#1a1e1b] pb-3 border-b border-stone-100 flex items-center justify-between">
            <span>Dairy Herd Context</span>
            <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Shiv Dairy Farm</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <label className="text-xs text-stone-500 font-semibold block mb-1">Lactating Cows (High Yielding):</label>
              <input
                type="number"
                value={lactatingCount}
                onChange={(e) => setLactatingCount(Number(e.target.value))}
                className="w-full bg-white border border-stone-300 rounded-lg p-2 text-sm font-bold text-[#1b4332]"
              />
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <label className="text-xs text-stone-500 font-semibold block mb-1">Dry Cows / Young Stock:</label>
              <input
                type="number"
                value={dryCount}
                onChange={(e) => setDryCount(Number(e.target.value))}
                className="w-full bg-white border border-stone-300 rounded-lg p-2 text-sm font-bold text-[#1b4332]"
              />
            </div>
          </div>

          <div className="pt-2 text-xs text-stone-500">
            <span className="font-bold text-stone-700">Total Herd Size:</span> {lactatingCount + dryCount} Animals
          </div>
        </div>

        {/* Right 2 Cols: Feed Basket Manager */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="text-base font-bold text-[#1a1e1b]">Daily Feed Basket Formulation</h3>
            <span className="text-xs text-stone-500">Total Intake: {totalKg} kg / cow / day</span>
          </div>

          <div className="divide-y divide-stone-100">
            {basketItems.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="font-bold text-stone-900 w-1/3">{item.name}</div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-stone-500 font-medium">Quantity:</span>
                  <input
                    type="number"
                    value={item.quantityKg}
                    onChange={(e) => {
                      const newQty = Number(e.target.value);
                      setBasketItems(basketItems.map(i => i.id === item.id ? { ...i, quantityKg: newQty } : i));
                    }}
                    className="w-16 p-1 bg-stone-50 border border-stone-300 rounded text-center font-bold text-[#1b4332]"
                  />
                  <span className="text-stone-500 font-medium">kg</span>
                </div>

                <div className="text-stone-600 font-medium">
                  CP: <span className="font-bold text-[#2d6a4f]">{item.cpPct}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Nutritional Gap Advisory Banner */}
          <div className={`p-4 rounded-xl border ${cpGap > 0 ? 'bg-amber-500/10 border-amber-500/30 text-amber-900' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900'}`}>
            <div className="font-bold text-xs flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>Dairy Nutrition Guidance:</span>
            </div>
            <p className="text-xs mt-1 font-medium leading-relaxed">
              {cpGap > 0
                ? `Current ration has a crude protein deficit of ${cpGap}%. Consider increasing Groundnut / Cottonseed Oil Cake by 1.2 kg per lactating cow to balance milk yield.`
                : `Daily ration crude protein contribution is optimal (${weightedCp.toFixed(1)}%) for your lactating herd.`}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
