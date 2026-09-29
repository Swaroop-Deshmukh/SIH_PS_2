"use client";

import React from "react";
import { 
  Wheat, Sprout, Layers, Package, Check, ArrowRight, ShieldCheck, 
  Info, Sparkles, Scale, Gauge, HelpCircle 
} from "lucide-react";
import { FeedType } from "../lib/api";
import { Language } from "../lib/dictionary";

interface FeedTypeMatrixProps {
  lang: Language;
  currentFeedType: FeedType;
  onSelectFeedType: (feed: FeedType) => void;
  onProceedToNIR?: () => void;
}

interface FeedMatrixItem {
  id: FeedType;
  botanicalName: string;
  category: string;
  badge: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  optimalDM: string;
  optimalCP: string;
  optimalNDF_ADF: string;
  targetPH: string;
  sensoryCheck: string[];
  harvestWindow: string;
  typicalIntake: string;
}

const FEED_MATRIX: FeedMatrixItem[] = [
  {
    id: "Maize Silage",
    botanicalName: "Zea mays L.",
    category: "Fermented Roughage",
    badge: "Primary Energy Forage",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
    icon: Layers,
    description: "Anaerobically preserved whole-crop maize with starch-rich kernels and digestible stover. High energy density for lactating ruminants.",
    optimalDM: "32.0 - 36.0%",
    optimalCP: "7.5 - 9.2%",
    optimalNDF_ADF: "42 - 48% / 24 - 28%",
    targetPH: "3.7 - 4.2",
    sensoryCheck: [
      "Pleasant mild lactic/acetic aroma (zero butyric)",
      "Golden-green to olive hue without black/slimy patches",
      "Firm stem structure; kernels crushed or cracked"
    ],
    harvestWindow: "1/2 to 2/3 Milk-line kernel maturity",
    typicalIntake: "15 - 25 kg/cow/day (as-fed)"
  },
  {
    id: "Green Fodder",
    botanicalName: "Pennisetum purpureum × P. glaucum",
    category: "Succulent Roughage",
    badge: "Vitamins & Rumen Fluidity",
    badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
    icon: Sprout,
    description: "Perennial hybrid Napier or multi-cut green grasses providing succulent water, carotene, and natural soluble plant carbohydrates.",
    optimalDM: "16.0 - 22.0%",
    optimalCP: "8.5 - 11.5%",
    optimalNDF_ADF: "56 - 65% / 32 - 38%",
    targetPH: "5.8 - 6.8 (Fresh)",
    sensoryCheck: [
      "Vibrant emerald green foliage; uncurled leaves",
      "Succulent stalks without lignified woodiness",
      "Free of soil splatter and endophyte fungal rust"
    ],
    harvestWindow: "45 - 55 days regrowth interval",
    typicalIntake: "20 - 35 kg/cow/day (as-fed)"
  },
  {
    id: "Dry Fodder",
    botanicalName: "Triticum aestivum / Sorghum bicolor",
    category: "Structural Fiber",
    badge: "Effective Rumen Mat",
    badgeColor: "bg-stone-100 text-stone-800 border-stone-300",
    icon: Wheat,
    description: "Threshed wheat straw, paddy straw, or sorghum stover (kadbi) providing critical effective neutral detergent fiber (peNDF) to stimulate cud chewing.",
    optimalDM: "88.0 - 92.0%",
    optimalCP: "3.0 - 4.5%",
    optimalNDF_ADF: "68 - 76% / 44 - 52%",
    targetPH: "Neutral (Dry)",
    sensoryCheck: [
      "Crisp, dry rustle with bright golden-straw luster",
      "No musty basement dampness or fungal spores",
      "Clean uniform 2 - 4 cm chop length to deter sorting"
    ],
    harvestWindow: "Post-grain harvest curing & baling",
    typicalIntake: "3.5 - 6.0 kg/cow/day"
  },
  {
    id: "Concentrate",
    botanicalName: "Formulated Compound Feed",
    category: "Dense Protein & Energy",
    badge: "Production Balancer",
    badgeColor: "bg-purple-100 text-purple-900 border-purple-300",
    icon: Package,
    description: "Pelleted or mash blend of grain cereals, oilseed cakes (cottonseed, mustard, soya), bypass fats, minerals, and vitamins meeting BIS Type II dairy standards.",
    optimalDM: "89.0 - 92.0%",
    optimalCP: "18.0 - 22.0%",
    optimalNDF_ADF: "24 - 32% / 12 - 16%",
    targetPH: "Buffered (6.0 - 6.8)",
    sensoryCheck: [
      "Uniform pelleted density without crumbly dust",
      "Fresh nutty aroma without rancid oxidized odors",
      "Zero chemical urea adulteration or foreign particulates"
    ],
    harvestWindow: "Certified mill batch manufacturing",
    typicalIntake: "1 kg per 2.5 - 3.0 L milk yield"
  }
];

export const FeedTypeMatrix: React.FC<FeedTypeMatrixProps> = ({
  lang,
  currentFeedType,
  onSelectFeedType,
  onProceedToNIR,
}) => {
  const currentItem = FEED_MATRIX.find((f) => f.id === currentFeedType) || FEED_MATRIX[0];

  return (
    <div className="space-y-6">
      {/* Screen 2 Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">
            <span className="bg-[#1b4332] text-[#74c69d] px-2.5 py-0.5 rounded-full font-mono text-[10px]">
              SCREEN 2 OF 8
            </span>
            <span>FEED MATRIX & INTAKE SELECTION</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
            Feed Chemistry & Quality Baselines
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Select the target forage matrix to configure NIR optical calibrations, 
            Mahalanobis distance reference domains, and ICAR animal intake coefficients.
          </p>
        </div>

        {onProceedToNIR && (
          <button
            onClick={onProceedToNIR}
            className="px-5 py-3 rounded-xl bg-[#1b4332] text-[#74c69d] font-bold text-xs hover:bg-[#2d6a4f] transition flex items-center gap-2 shrink-0 shadow-sm"
          >
            <span>Proceed to 3×3 NIR Scan</span>
            <ArrowRight className="w-4 h-4 text-[#74c69d]" />
          </button>
        )}
      </div>

      {/* 4 Interactive Feed Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEED_MATRIX.map((item) => {
          const isSelected = item.id === currentFeedType;
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              onClick={() => onSelectFeedType(item.id)}
              className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? "bg-[#1b4332] text-white border-[#74c69d] shadow-lg scale-[1.02]"
                  : "bg-white text-stone-800 border-stone-200 hover:border-emerald-300 hover:shadow-md"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div
                    className={`p-2.5 rounded-xl ${
                      isSelected
                        ? "bg-[#2d6a4f] text-[#74c69d]"
                        : "bg-stone-100 text-[#1b4332]"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isSelected
                        ? "bg-emerald-900/60 text-emerald-200 border-emerald-500/40"
                        : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>

                <h3 className="font-extrabold text-base mt-3">{item.id}</h3>
                <p
                  className={`text-[11px] italic mt-0.5 ${
                    isSelected ? "text-emerald-200" : "text-stone-400"
                  }`}
                >
                  {item.botanicalName}
                </p>

                <p
                  className={`text-xs mt-2.5 line-clamp-3 leading-relaxed ${
                    isSelected ? "text-stone-200" : "text-stone-600"
                  }`}
                >
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-current/10 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className={isSelected ? "text-emerald-200" : "text-stone-500"}>
                    Optimal DM:
                  </span>
                  <strong className="font-mono">{item.optimalDM}</strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span className={isSelected ? "text-emerald-200" : "text-stone-500"}>
                    Crude Protein:
                  </span>
                  <strong className="font-mono">{item.optimalCP}</strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span className={isSelected ? "text-emerald-200" : "text-stone-500"}>
                    Target pH:
                  </span>
                  <strong className="font-mono">{item.targetPH}</strong>
                </div>

                <div
                  className={`mt-2 py-2 px-3 rounded-xl text-center text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? "bg-[#74c69d] text-[#1b4332]"
                      : "bg-stone-100 text-stone-700 hover:bg-emerald-50"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Active Calibration Domain</span>
                    </>
                  ) : (
                    <span>Select for Testing</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Feed In-Depth Agronomic Benchmark Panel */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-black text-lg text-stone-900">
                Agronomic Target Profile: {currentItem.id}
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Standards calibrated under Indian Council of Agricultural Research (ICAR) &amp; BIS specifications.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono bg-stone-100 text-stone-700 px-3 py-1 rounded-lg">
              Category: <b>{currentItem.category}</b>
            </span>
          </div>
        </div>

        {/* 4 Key Nutrient Metric Benchmarks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Dry Matter Range</div>
            <div className="text-xl font-black text-[#1b4332] mt-1 font-mono">{currentItem.optimalDM}</div>
            <div className="text-[10px] text-stone-500 mt-1">Basis for dry matter intake calculations</div>
          </div>
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Target Crude Protein</div>
            <div className="text-xl font-black text-[#1b4332] mt-1 font-mono">{currentItem.optimalCP}</div>
            <div className="text-[10px] text-stone-500 mt-1">Dumas combustion / PLSR reference</div>
          </div>
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">NDF / ADF Fiber Ratio</div>
            <div className="text-xl font-black text-[#1b4332] mt-1 font-mono">{currentItem.optimalNDF_ADF}</div>
            <div className="text-[10px] text-stone-500 mt-1">Rumen fill &amp; energy density partition</div>
          </div>
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Fermentation pH</div>
            <div className="text-xl font-black text-[#1b4332] mt-1 font-mono">{currentItem.targetPH}</div>
            <div className="text-[10px] text-stone-500 mt-1">Microbial preservation index</div>
          </div>
        </div>

        {/* Sensory Quality & Harvest Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/70 space-y-2">
            <h4 className="text-xs font-bold text-emerald-950 uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sensory &amp; Organoleptic Acceptance Criteria</span>
            </h4>
            <ul className="text-xs text-emerald-900 space-y-1.5 pl-1">
              {currentItem.sensoryCheck.map((check, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 mt-0.5 text-emerald-700 shrink-0" />
                  <span>{check}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/70 space-y-2">
            <h4 className="text-xs font-bold text-amber-950 uppercase flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-amber-600" />
              <span>Harvest Window &amp; Herd Allocation</span>
            </h4>
            <div className="text-xs text-amber-950 space-y-2">
              <div>
                <span className="font-bold text-amber-900">Optimal Stage: </span>
                <span>{currentItem.harvestWindow}</span>
              </div>
              <div>
                <span className="font-bold text-amber-900">Typical Daily Ration: </span>
                <span>{currentItem.typicalIntake}</span>
              </div>
              <p className="text-[11px] text-amber-800 italic pt-1">
                FeedSure 360 uses these matrix bounds to compute Mahalanobis domain distances (D_M) 
                and alert farmers if an intake batch deviates from standard agronomic curves.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
