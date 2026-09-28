"use client";
import React from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, Flame, Milk, ShieldAlert } from "lucide-react";
import { BatchAnalyzeResponse } from "../lib/api";
import { dictionary, Language } from "../lib/dictionary";
interface Props { lang: Language; data: BatchAnalyzeResponse; farmerMode: boolean; onNavigateTab: (tab: string) => void; }
export const Dashboard: React.FC<Props> = ({ data, farmerMode, onNavigateTab, lang }) => {
  const t = dictionary[lang];
  const { evidence, nutritional_analysis: nutrition, dairy_ration: ration, storage_telemetry: storage, advisories } = data;
  const profile = data.farm_profile;
  const withhold = ["RESULT NOT TRUSTED", "SUSPECTED ADULTERATION"].includes(evidence.trust_status);
  const statusLabel = lang === "mr"
    ? ({ TRUSTED: "डेमो: विशेष इशारा नाही", "RETEST RECOMMENDED": "पुन्हा तपासण्याचा डेमो इशारा", "RESULT NOT TRUSTED": "डेमो आकडे रोखले", "SUSPECTED ADULTERATION": "भेसळीचा डेमो इशारा", "TRUSTED WITH STORAGE WARNING": "साठवणीचा डेमो इशारा" }[evidence.trust_status] ?? evidence.trust_status)
    : evidence.trust_status;
  return <div className="space-y-6">
    <section className="bg-[#1b4332] text-white p-6 sm:p-8 rounded-3xl border border-[#2d6a4f] shadow-xl flex flex-col md:flex-row justify-between gap-5">
      <div><div className="flex items-center gap-2 text-xs font-bold text-[#74c69d] uppercase mb-2"><Milk className="w-4 h-4"/>{profile.farm_name} · {profile.location}</div><h1 className="text-2xl sm:text-3xl font-black">{t.demo.farmSummary}</h1><p className="text-sm text-emerald-100 mt-1">{profile.lactating_animals} · {lang === 'mr' ? 'दुभती जनावरे' : lang === 'hi' ? 'दुधारू पशु' : 'lactating'} · {profile.dry_animals} · {lang === 'mr' ? 'भाकड जनावरे' : lang === 'hi' ? 'सूखे पशु' : 'dry'} · {profile.daily_milk_yield_liters} L/day</p></div>
      <button onClick={() => onNavigateTab("testing")} className="self-start px-5 py-3 rounded-xl bg-[#74c69d] text-[#1b4332] font-extrabold text-sm flex items-center gap-2">{t.demo.resultDetails} <ArrowRight className="w-4 h-4"/></button>
    </section>
    <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"><strong>{t.demo.intro}</strong> <span className="text-xs">{data.data_provenance.nutrition_source}</span></div>
    <h2 className="text-lg font-extrabold">{t.demo.nextSteps}</h2>
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {[["ration", t.demo.profileAction], ["ration", t.demo.rationAction], ["silage", t.demo.storageAction], ["twin", t.demo.batchAction]].map(([tab, label]) => <button key={label} onClick={() => onNavigateTab(tab)} className="bg-white p-4 rounded-2xl border border-stone-200 text-left font-bold text-sm text-[#1b4332] hover:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-700">{label}<ArrowRight className="w-4 h-4 inline ml-2"/></button>)}
    </section>
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <article className="bg-white p-5 rounded-2xl border border-stone-200"><div className="text-xs text-stone-500 font-bold">{t.demo.latestResult} · {data.batch_id}</div><div className="text-lg font-black mt-2">{statusLabel}</div><div className="text-xs text-stone-600 mt-1">{t.demo.noLiveData}</div></article>
      <article className="bg-white p-5 rounded-2xl border border-stone-200"><div className="text-xs text-stone-500 font-bold">CRUDE PROTEIN · {data.feed_type}</div><div className="text-2xl font-black mt-2">{withhold ? "Withheld" : nutrition.crude_protein_pct + "%"}</div><div className="text-xs text-stone-600 mt-1">{withhold ? "Result not suitable for a quantitative decision" : "Synthetic reference profile · not a lab result"}</div></article>
      <article className="bg-white p-5 rounded-2xl border border-stone-200"><div className="flex justify-between text-xs text-stone-500 font-bold">SIMULATED STORAGE<Flame className="w-4 h-4 text-amber-500"/></div><div className="text-2xl font-black mt-2">{storage.spoilage_risk_index}/100</div><div className="text-xs text-stone-600 mt-1">{storage.temperature_celsius}°C · inspect and confirm with suitable sensors</div></article>
      <article className="bg-white p-5 rounded-2xl border border-stone-200"><div className="text-xs text-stone-500 font-bold">EXAMPLE RATION GAP · {ration.ration_analysis.ration_group}</div><div className="text-2xl font-black mt-2">{ration.ration_analysis.cp_gap_pct} pp</div><div className="text-xs text-stone-600 mt-1">{ration.ration_analysis.basket_weighted_cp_pct}% basket CP vs illustrative {ration.ration_analysis.target_cp_pct}% target</div></article>
    </section>
    {withhold && <div className="rounded-2xl border border-rose-300 bg-rose-50 p-5 text-rose-950"><div className="flex gap-2 font-bold"><ShieldAlert className="w-5 h-5"/>Do not use these nutrient values to make a feeding decision.</div><p className="text-sm mt-1">The scenario is flagged for confirmation. Values are hidden here to avoid implying unsupported precision.</p></div>}
    <section className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 space-y-4"><div className="flex justify-between items-center border-b border-stone-100 pb-3"><h2 className="font-bold flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500"/>Advisories</h2><span className="text-xs text-stone-500">{advisories.length} for this demo run</span></div>
      {advisories.map((item) => <div key={item.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex gap-3"><CheckCircle2 className="w-4 h-4 mt-0.5 text-[#2d6a4f] shrink-0"/><div><div className="font-bold text-sm">{item.title}</div><p className="text-xs mt-1 text-stone-700">{item.message}</p><div className="text-[10px] uppercase tracking-wide text-stone-500 mt-2">{item.severity} · {item.category}{item.verification_required ? " · confirmation recommended" : ""}</div></div></div>)}
    </section>
    {!farmerMode && <details className="bg-white rounded-2xl p-5 border border-stone-200"><summary className="font-bold cursor-pointer">Data provenance and technical notes</summary><dl className="grid sm:grid-cols-2 gap-3 mt-4 text-xs">{Object.entries(data.data_provenance).map(([key,value]) => <div key={key}><dt className="font-bold uppercase text-stone-500">{key.replaceAll("_", " ")}</dt><dd className="mt-1">{value}</dd></div>)}</dl></details>}
    <p className="text-[11px] text-stone-500">Farm and feed basket shown from local saved prototype context. Values are not verified feed analyses or validated dairy formulations.</p>
  </div>;
};
