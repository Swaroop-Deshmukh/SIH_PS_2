"use client";
import React, { useEffect, useMemo, useState } from "react";
import { 
  Check, Lightbulb, LoaderCircle, Milk, Save, Sparkles, 
  IndianRupee, TrendingDown, ShieldCheck, AlertCircle, ArrowRight, RefreshCw
} from "lucide-react";
import { dictionary, Language } from "../lib/dictionary";
import { BatchAnalyzeResponse, FarmContext, optimizeRation, RationOptimizerResult } from "../lib/api";
import { offlineQueue } from "../lib/offlineQueue";

interface Props {
  lang: Language;
  data: BatchAnalyzeResponse;
  farmerMode: boolean;
  context: FarmContext;
  onSaveContext: (context: FarmContext) => Promise<boolean>;
  saving: boolean;
}

const DEFAULT_PRICES: Record<string, number> = {
  "Green Fodder": 2.5,
  "Dry Fodder": 6.0,
  "Maize Silage": 4.5,
  "Concentrate": 24.0,
  "Cattle Concentrate": 24.0,
  "Mustard Oil Cake": 32.0,
  "Groundnut Cake": 36.0,
  "Rice Bran": 16.0,
  "Mineral Mixture": 65.0,
};

export const DairyRationAssessor: React.FC<Props> = ({
  lang,
  data,
  context,
  onSaveContext,
  saving,
}) => {
  const [draft, setDraft] = useState<FarmContext>(context);
  const [saved, setSaved] = useState(false);
  const [prices, setPrices] = useState<Record<string, number>>(DEFAULT_PRICES);
  const [optimizerResult, setOptimizerResult] = useState<RationOptimizerResult | null>(
    data.ration_optimizer || null
  );
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    setDraft(context);
  }, [context]);

  useEffect(() => {
    if (data.ration_optimizer) {
      setOptimizerResult(data.ration_optimizer);
    }
  }, [data.ration_optimizer]);

  const ration = data.dairy_ration.ration_analysis;
  const interpretation = data.dairy_ration.dairy_interpretation;
  const mr = lang === "mr";
  const dict = dictionary[lang] || dictionary.en;

  const copy = mr
    ? {
        title: "शेत आणि पशुखाद्य माहिती",
        subtitle: "जतन केलेली माहिती दुग्ध अवस्था व पोषण गणनेत वापरली जाईल.",
        save: "माहिती जतन करा व मोजा",
        saved: "जतन झाले",
        farm: "शेताची व दुग्ध अवस्थेची माहिती",
        example: "शेतकऱ्याची खरी माहिती व दुग्ध अवस्था निवडा.",
        name: "शेताचे नाव",
        location: "गाव / ठिकाण",
        lactating: "दुभती जनावरे",
        dry: "भाकड जनावरे",
        milk: "दररोजचे दूध (लिटर/पशू)",
        stage: "दुग्ध अवस्था (Lactation Stage)",
        feed: "उपलब्ध चारा (Feed Basket)",
        reference: "खालील पोषण आकडे NIR व प्रयोगशाळा चाचणीवर आधारित आहेत.",
        ingredient: "चारा प्रकार",
        quantity: "प्रमाण (किलो)",
        cp: "प्रथिने % (CP)",
        dm: "कोरडा पदार्थ % (DM)",
        price: "दर (₹/किलो)",
        calc: "दुग्ध अवस्था पोषण विश्लेषण",
        caution: "ही प्रमाणित पोषण गणना NRC/ICAR मानकांनुसार आहे.",
      }
    : {
        title: "Farm profile and feed basket",
        subtitle: "Saved details calculate stage-specific DM and CP requirements.",
        save: "Save details and recalculate",
        saved: "Saved",
        farm: "Farm profile & lactation stage",
        example: "Select the herd's current lactation stage and production details.",
        name: "Farm name",
        location: "Village / location",
        lactating: "Lactating animals",
        dry: "Dry animals",
        milk: "Daily milk yield (L/cow/day)",
        stage: "Lactation stage",
        feed: "Available feed basket",
        reference: "Nutrition figures incorporate NIR test results.",
        ingredient: "Feed type",
        quantity: "Quantity kg",
        cp: "Protein % (CP)",
        dm: "Dry matter % (DM)",
        price: "Price (₹/kg)",
        calc: "Lactation Stage Ration Assessment",
        caution: "Requirements are dynamically computed using stage DMI & CP standards.",
      };

  const totalAsFed = useMemo(
    () => draft.feed_basket.reduce((sum, item) => sum + Number(item.quantity_kg || 0), 0),
    [draft]
  );

  const updateProfile = (key: keyof FarmContext["farm_profile"], value: string | number) => {
    setDraft((current) => {
      const updatedProfile = { ...current.farm_profile, [key]: value };
      if (key === "lactation_stage" && value === "dry_period") {
        updatedProfile.ration_group = "dry";
      } else if (key === "lactation_stage") {
        updatedProfile.ration_group = "lactating";
      }
      return { ...current, farm_profile: updatedProfile };
    });
    setSaved(false);
  };

  const updateItem = (index: number, key: "quantity_kg" | "cp_pct" | "dm_pct", value: number) => {
    setDraft((current) => ({
      ...current,
      feed_basket: current.feed_basket.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    }));
    setSaved(false);
  };

  const updatePrice = (feedName: string, price: number) => {
    setPrices((prev) => ({ ...prev, [feedName]: price }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      offlineQueue.enqueue("SAVE_FARM_CONTEXT", draft);
      setSaved(true);
      return;
    }
    setSaved(await onSaveContext(draft));
  };

  const handleRunOptimizer = async () => {
    setOptimizing(true);
    try {
      const result = await optimizeRation({
        farm_profile: draft.farm_profile,
        feed_basket: draft.feed_basket,
        price_overrides: prices,
        allow_catalog_expansion: true,
      });
      setOptimizerResult(result);
    } catch (err) {
      console.error("Optimizer execution error:", err);
    } finally {
      setOptimizing(false);
    }
  };

  const currentStage = draft.farm_profile.lactation_stage || "early_lactation";

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">
            <Milk className="w-4 h-4" />
            {mr ? "दुग्ध पोषण निर्णय प्रणाली" : "Dairy nutrition decision support"}
          </div>
          <h2 className="text-xl sm:text-2xl font-black">{copy.title}</h2>
          <p className="text-xs text-stone-600 mt-1">{copy.subtitle}</p>
        </div>
        <button
          disabled={saving || !draft.feed_basket.length}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1b4332] text-white px-4 py-3 font-bold text-sm disabled:opacity-60 hover:bg-[#2d6a4f] transition shadow-sm"
        >
          {saving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? copy.saved : copy.save}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Farm Profile & Lactation Stage */}
        <section className="bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
          <div>
            <h3 className="font-bold">{copy.farm}</h3>
            <p className="text-[11px] text-amber-800 mt-1">{copy.example}</p>
          </div>

          <label className="block text-xs font-semibold text-stone-600">
            {copy.name}
            <input
              value={draft.farm_profile.farm_name}
              onChange={(e) => updateProfile("farm_name", e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm text-stone-900"
            />
          </label>

          <label className="block text-xs font-semibold text-stone-600">
            {copy.location}
            <input
              value={draft.farm_profile.location}
              onChange={(e) => updateProfile("location", e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm text-stone-900"
            />
          </label>

          <label className="block text-xs font-semibold text-stone-600">
            {copy.stage}
            <select
              value={currentStage}
              onChange={(e) => updateProfile("lactation_stage", e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm text-stone-900 font-bold text-[#1b4332]"
            >
              <option value="early_lactation">{dict.stages.early_lactation}</option>
              <option value="mid_lactation">{dict.stages.mid_lactation}</option>
              <option value="late_lactation">{dict.stages.late_lactation}</option>
              <option value="dry_period">{dict.stages.dry_period}</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-stone-600">
              {copy.lactating}
              <input
                type="number"
                min="0"
                value={draft.farm_profile.lactating_animals}
                onChange={(e) => updateProfile("lactating_animals", Number(e.target.value))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm text-stone-900"
              />
            </label>
            <label className="text-xs font-semibold text-stone-600">
              {copy.dry}
              <input
                type="number"
                min="0"
                value={draft.farm_profile.dry_animals}
                onChange={(e) => updateProfile("dry_animals", Number(e.target.value))}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm text-stone-900"
              />
            </label>
          </div>

          <label className="block text-xs font-semibold text-stone-600">
            {copy.milk}
            <input
              type="number"
              min="0"
              step="0.5"
              value={draft.farm_profile.daily_milk_yield_liters}
              onChange={(e) => updateProfile("daily_milk_yield_liters", Number(e.target.value))}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm text-stone-900"
            />
          </label>

          <p className="text-[11px] text-stone-500 font-medium pt-1">
            Total herd count: {Number(draft.farm_profile.lactating_animals) + Number(draft.farm_profile.dry_animals)} animals
          </p>
        </section>

        {/* Right Column: Feed Basket Table & Lactation Stage Analysis */}
        <section className="lg:col-span-2 bg-white p-5 rounded-2xl border border-stone-200 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="font-bold">{copy.feed}</h3>
              <p className="text-[11px] text-stone-600 mt-1">{copy.reference}</p>
            </div>
            <span className="text-xs text-stone-600">
              {mr ? "एकूण रोजचा चारा:" : "As-fed total:"} {totalAsFed.toFixed(1)} kg/day
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs">
              <thead>
                <tr className="border-b text-stone-500 font-mono text-[11px]">
                  <th className="py-2">{copy.ingredient}</th>
                  <th className="py-2">{copy.quantity}</th>
                  <th className="py-2">{copy.cp}</th>
                  <th className="py-2">{copy.dm}</th>
                  <th className="py-2">{copy.price}</th>
                </tr>
              </thead>
              <tbody>
                {draft.feed_basket.map((item, index) => {
                  const currentPrice = prices[item.name] ?? DEFAULT_PRICES[item.name] ?? 10.0;
                  return (
                    <tr key={item.name} className="border-b border-stone-100 hover:bg-stone-50/50">
                      <td className="py-3 pr-3 font-semibold text-stone-800">
                        {item.name}
                        <div className="text-[10px] text-amber-800 font-normal">{item.data_source}</div>
                      </td>
                      {(["quantity_kg", "cp_pct", "dm_pct"] as const).map((key) => (
                        <td key={key} className="py-2 pr-2">
                          <input
                            aria-label={item.name + " " + key}
                            type="number"
                            min="0"
                            max="1000"
                            step="0.1"
                            value={item[key]}
                            onChange={(e) => updateItem(index, key, Number(e.target.value))}
                            className="w-20 rounded-lg border border-stone-300 px-2 py-1.5 font-mono text-xs"
                          />
                        </td>
                      ))}
                      <td className="py-2 pr-2">
                        <div className="flex items-center gap-1">
                          <span className="text-stone-400 font-bold">₹</span>
                          <input
                            type="number"
                            min="0"
                            max="200"
                            step="0.5"
                            value={currentPrice}
                            onChange={(e) => updatePrice(item.name, Number(e.target.value))}
                            className="w-16 rounded-lg border border-stone-300 px-2 py-1.5 font-mono text-xs text-[#1b4332] font-bold"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Lactation Stage Analysis Card */}
          <div
            className={
              "p-5 rounded-xl border space-y-3 " +
              (ration.cp_status === "DEFICIENT"
                ? "bg-amber-50/80 border-amber-200 text-amber-950"
                : ration.cp_status === "EXCESS"
                ? "bg-blue-50/80 border-blue-200 text-blue-950"
                : "bg-emerald-50/80 border-emerald-200 text-emerald-950")
            }
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Lightbulb className="w-4 h-4 text-[#1b4332]" />
                {copy.calc} · {ration.stage_name || currentStage}
              </div>
              <span
                className={
                  "px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider " +
                  (ration.cp_status === "DEFICIENT"
                    ? "bg-amber-200 text-amber-900"
                    : ration.cp_status === "EXCESS"
                    ? "bg-blue-200 text-blue-900"
                    : "bg-emerald-200 text-emerald-900")
                }
              >
                {ration.cp_status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="bg-white/70 p-2.5 rounded-lg border border-stone-200">
                <div className="text-[10px] text-stone-500 font-medium">Target CP %</div>
                <div className="font-bold text-sm text-stone-900">{ration.target_cp_pct}%</div>
              </div>
              <div className="bg-white/70 p-2.5 rounded-lg border border-stone-200">
                <div className="text-[10px] text-stone-500 font-medium">Basket CP %</div>
                <div className="font-bold text-sm text-stone-900">{ration.basket_weighted_cp_pct}%</div>
              </div>
              <div className="bg-white/70 p-2.5 rounded-lg border border-stone-200">
                <div className="text-[10px] text-stone-500 font-medium">Required DM Total</div>
                <div className="font-bold text-sm text-stone-900">
                  {ration.required_dm_total_kg ?? (ration.required_dmi_per_animal_kg ? (ration.required_dmi_per_animal_kg * (draft.farm_profile.lactating_animals || 1)).toFixed(1) : "-")} kg/day
                </div>
              </div>
              <div className="bg-white/70 p-2.5 rounded-lg border border-stone-200">
                <div className="text-[10px] text-stone-500 font-medium">Available DM Total</div>
                <div className="font-bold text-sm text-stone-900">{ration.available_dm_total_kg ?? "-"} kg/day</div>
              </div>
            </div>

            <p className="text-xs font-medium leading-relaxed pt-1">{interpretation}</p>
            <p className="text-[10px] text-stone-500">{copy.caution}</p>
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 8: MATHEMATICAL LEAST-COST RATION OPTIMIZER (MILP / SCIPY HIGHS) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-emerald-950 p-6 sm:p-8 rounded-3xl border border-emerald-800/40 text-white shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Section 8: Mathematical Least-Cost Ration Formulation (Linear Programming)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Ration Cost Optimizer &amp; Savings Engine
            </h3>
            <p className="text-xs text-stone-300 mt-1 max-w-2xl leading-relaxed">
              Solves the cost minimization linear program (SciPy HiGHS simplex/interior-point): 
              minimizes ₹/cow/day subject to NRC crude protein, DMI capacity, and rumen fiber (NDF &ge; 28%) safety limits.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRunOptimizer}
            disabled={optimizing}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-stone-950 font-black text-xs hover:from-emerald-400 hover:to-teal-400 transition flex items-center gap-2 shrink-0 shadow-lg disabled:opacity-60"
          >
            {optimizing ? (
              <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
            ) : (
              <Sparkles className="w-4 h-4 text-stone-950" />
            )}
            <span>{optimizing ? "Solving Linear Program..." : "⚡ Run LP Ration Optimizer"}</span>
          </button>
        </div>

        {optimizerResult && (
          <div className="space-y-6">
            {/* Cost Comparison Metric Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                <span className="text-[11px] text-stone-400 font-medium uppercase tracking-wider">Current Daily Cost</span>
                <div className="text-2xl font-black font-mono text-stone-200 mt-1 flex items-baseline">
                  <span>₹{optimizerResult.cost_summary.current_cost_per_cow_day_inr}</span>
                  <span className="text-xs text-stone-400 font-sans ml-1">/cow/day</span>
                </div>
                <div className="text-[10px] text-stone-400 mt-1">Based on farmer's basket inputs</div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl">
                <span className="text-[11px] text-emerald-300 font-medium uppercase tracking-wider">Optimized Formulation</span>
                <div className="text-2xl font-black font-mono text-emerald-300 mt-1 flex items-baseline">
                  <span>₹{optimizerResult.cost_summary.optimal_cost_per_cow_day_inr}</span>
                  <span className="text-xs text-emerald-400 font-sans ml-1">/cow/day</span>
                </div>
                <div className="text-[10px] text-emerald-400 mt-1">Global minimum feasible solution</div>
              </div>

              <div className="bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-emerald-400/40 p-4 rounded-2xl">
                <span className="text-[11px] text-emerald-200 font-medium uppercase tracking-wider flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Daily Savings Per Cow</span>
                </span>
                <div className="text-2xl font-black font-mono text-emerald-300 mt-1 flex items-baseline">
                  <span>₹{optimizerResult.cost_summary.daily_saving_per_cow_inr}</span>
                  <span className="text-xs text-emerald-200 font-sans ml-1">
                    {optimizerResult.cost_summary.savings_pct > 0 ? `(${optimizerResult.cost_summary.savings_pct}% cut)` : "/day"}
                  </span>
                </div>
                <div className="text-[10px] text-emerald-200 mt-1">Protects milk while eliminating feed waste</div>
              </div>

              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-2xl shadow-lg">
                <span className="text-[11px] text-emerald-100 font-bold uppercase tracking-wider">
                  Monthly Herd Savings ({optimizerResult.herd_context.animal_count} cows)
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono mt-1">
                  ₹{optimizerResult.cost_summary.monthly_herd_saving_inr.toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-100 mt-1">Net profit boost for farmer</div>
              </div>
            </div>

            {/* Optimal Ingredient Allocation Breakdown Table */}
            <div className="bg-black/25 rounded-2xl border border-white/10 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-stone-200">
                  Optimal Daily Ingredient Allocation (Per Cow)
                </h4>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Status: {optimizerResult.status}
                  </span>
                  <span className="text-stone-400 hidden sm:inline">{optimizerResult.solver}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-stone-400 font-mono text-[10px] uppercase">
                      <th className="py-2.5 px-3">Ingredient</th>
                      <th className="py-2.5 px-3">Optimal As-Fed (kg)</th>
                      <th className="py-2.5 px-3">Optimal DM (kg)</th>
                      <th className="py-2.5 px-3">% of Ration DMI</th>
                      <th className="py-2.5 px-3">Price (₹/kg)</th>
                      <th className="py-2.5 px-3">Daily Cost (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-stone-200">
                    {optimizerResult.allocation_table.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition">
                        <td className="py-2.5 px-3 font-sans font-semibold text-white flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${item.is_forage ? "bg-emerald-400" : "bg-amber-400"}`} />
                          <span>{item.name}</span>
                          <span className="text-[10px] text-stone-400 font-normal">
                            ({item.is_forage ? "Forage" : "Concentrate"})
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-emerald-300">{item.optimal_as_fed_kg} kg</td>
                        <td className="py-2.5 px-3">{item.optimal_dm_kg} kg</td>
                        <td className="py-2.5 px-3">{item.pct_of_dmi}%</td>
                        <td className="py-2.5 px-3">₹{item.price_per_kg_inr}</td>
                        <td className="py-2.5 px-3 font-bold text-stone-100">₹{item.optimal_daily_cost_inr}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rumen Health & Biological Safety Check */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1">
                <span className="text-[10px] text-stone-400 uppercase font-mono">Rumen Acidosis (SARA) Guard</span>
                <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{optimizerResult.nutrition_balance.rumen_acidosis_risk}</span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Total ration NDF is {optimizerResult.nutrition_balance.optimal_ndf_pct}% (min required: {optimizerResult.herd_context.target_ndf_min_pct}%).
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1">
                <span className="text-[10px] text-stone-400 uppercase font-mono">Forage-to-Concentrate Ratio</span>
                <div className="font-bold text-emerald-300 text-sm font-mono">
                  {optimizerResult.nutrition_balance.forage_to_concentrate_ratio}
                </div>
                <p className="text-[11px] text-stone-400">
                  Maintains rumination chewing time and milk fat % synthesis.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1">
                <span className="text-[10px] text-stone-400 uppercase font-mono">Crude Protein Satisfaction</span>
                <div className="font-bold text-emerald-300 text-sm font-mono">
                  {optimizerResult.nutrition_balance.optimal_cp_pct}% CP ({optimizerResult.nutrition_balance.optimal_cp_kg} kg/day)
                </div>
                <p className="text-[11px] text-stone-400">
                  Matches ICAR target ({optimizerResult.herd_context.target_cp_pct}% CP) without overpaying for nitrogen.
                </p>
              </div>
            </div>

            {/* Explainable Dairy Formulation Advisory */}
            <div className="bg-emerald-950/60 border border-emerald-500/30 p-4 rounded-2xl flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-xs text-emerald-300 uppercase tracking-wide">
                  Practical Feeding Advisory &amp; Optimization Insight
                </h5>
                <p className="text-xs text-stone-200 mt-1 leading-relaxed">
                  {optimizerResult.advisory}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};
