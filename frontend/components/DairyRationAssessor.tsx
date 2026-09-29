"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Check, Lightbulb, LoaderCircle, Milk, Save } from "lucide-react";
import { dictionary, Language } from "../lib/dictionary";
import { BatchAnalyzeResponse, FarmContext } from "../lib/api";

interface Props {
  lang: Language;
  data: BatchAnalyzeResponse;
  farmerMode: boolean;
  context: FarmContext;
  onSaveContext: (context: FarmContext) => Promise<boolean>;
  saving: boolean;
}

export const DairyRationAssessor: React.FC<Props> = ({
  lang,
  data,
  context,
  onSaveContext,
  saving,
}) => {
  const [draft, setDraft] = useState<FarmContext>(context);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(context);
  }, [context]);

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

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaved(await onSaveContext(draft));
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
          className="inline-flex items-center gap-2 rounded-xl bg-[#1b4332] text-white px-4 py-3 font-bold text-sm disabled:opacity-60"
        >
          {saving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? copy.saved : copy.save}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
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

          <p className="text-[11px] text-stone-500 font-medium">
            Total herd count: {Number(draft.farm_profile.lactating_animals) + Number(draft.farm_profile.dry_animals)} animals
          </p>
        </section>

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
                <tr className="border-b text-stone-500">
                  <th className="py-2">{copy.ingredient}</th>
                  <th className="py-2">{copy.quantity}</th>
                  <th className="py-2">{copy.cp}</th>
                  <th className="py-2">{copy.dm}</th>
                </tr>
              </thead>
              <tbody>
                {draft.feed_basket.map((item, index) => (
                  <tr key={item.name} className="border-b border-stone-100">
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
                          className="w-24 rounded-lg border border-stone-300 px-2 py-2"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detailed Lactation Stage Ration Results */}
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

          <p className="text-[10px] text-stone-500">
            Batch ID: {data.batch_id} · Measured Feed DM: {data.nutritional_analysis.dry_matter_pct}% · CP: {data.nutritional_analysis.crude_protein_pct}%
          </p>
        </section>
      </div>
    </form>
  );
};
