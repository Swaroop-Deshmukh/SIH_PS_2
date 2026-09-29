"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { 
  Check, Copy, Fingerprint, LoaderCircle, ShieldAlert, ShieldCheck, 
  ArrowRight, RefreshCw, Layers, Award, FileText, CheckCircle2,
  AlertTriangle, Lock, Cpu, ExternalLink, Printer
} from "lucide-react";
import { 
  API_BASE_URL, BatchAnalyzeResponse, BatchImage, getBatchImages, 
  verifyBatchIntegrity, getDigitalTwinLedger, transitionDigitalTwin,
  LifecycleEvent 
} from "../lib/api";
import { Language } from "../lib/dictionary";

interface Props { 
  lang: Language; 
  data: BatchAnalyzeResponse; 
}

const LIFECYCLE_STEPS = [
  { state: "INITIAL_TEST", label: "Initial Test", sub: "NIR & Vision QC" },
  { state: "BASKET_ALLOCATION", label: "Basket Allocation", sub: "Ration Integration" },
  { state: "STORAGE_MONITORING", label: "Storage Monitoring", sub: "Silage Pit Telemetry" },
  { state: "RETEST_ALERT", label: "Retest / Alert", sub: "Variance & Heating Hold" },
  { state: "FEEDING_DISPOSITION", label: "Feeding Disposition", sub: "Dairy Herd Fed" },
];

export const DigitalTwinPassport: React.FC<Props> = ({ data }) => {
  const { digital_twin: twin, data_provenance: provenance } = data;
  
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [integrityReport, setIntegrityReport] = useState<any | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [images, setImages] = useState<BatchImage[]>([]);
  
  // Phase 5 State Machine & Ledger State
  const [currentState, setCurrentState] = useState<string>(
    twin.current_state || (twin.passport as any)?.current_lifecycle_state || "STORAGE_MONITORING"
  );
  const [events, setEvents] = useState<LifecycleEvent[]>(twin.lifecycle_events || []);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionSuccess, setTransitionSuccess] = useState<string | null>(null);

  // Load photos and latest cryptographic ledger
  useEffect(() => { 
    void getBatchImages(data.batch_id).then(setImages).catch(() => setImages([])); 
    void getDigitalTwinLedger(data.batch_id)
      .then((res) => {
        if (res.events && res.events.length > 0) {
          setEvents(res.events);
          setCurrentState(res.events[res.events.length - 1].state);
        }
      })
      .catch(() => {});
  }, [data.batch_id]);

  const copyHash = async (hashToCopy: string) => { 
    try { 
      await navigator.clipboard.writeText(hashToCopy); 
      setCopied(true); 
      window.setTimeout(() => setCopied(false), 1600); 
    } catch { 
      setVerifyError("Clipboard access is unavailable in this browser."); 
    } 
  };

  const verifyLedger = async () => { 
    setChecking(true); 
    setVerifyError(null); 
    try { 
      const result = await verifyBatchIntegrity(data.batch_id); 
      setIntegrityReport(result); 
    } catch (error) { 
      setVerifyError(error instanceof Error ? error.message : "Could not verify this record."); 
    } finally { 
      setChecking(false); 
    } 
  };

  const handleTransition = async (targetState: string, actionDesc: string) => {
    setTransitioning(true);
    setTransitionSuccess(null);
    setVerifyError(null);
    try {
      const res = await transitionDigitalTwin(
        data.batch_id,
        targetState,
        actionDesc,
        "FARM_SUPERVISOR_CONSOLE",
        `Manual lifecycle transition initiated to ${targetState}.`
      );
      setCurrentState(res.current_state);
      setEvents((prev) => [...prev, res.transitioned_event]);
      setTransitionSuccess(`Batch state updated to ${targetState}. New cryptographic block appended.`);
      // Refresh verification
      void verifyLedger();
    } catch (err: any) {
      setVerifyError(err.message || String(err));
    } finally {
      setTransitioning(false);
    }
  };

  const hideValues = ["RESULT NOT TRUSTED", "SUSPECTED ADULTERATION"].includes(data.evidence.trust_status);
  const activeStepIdx = LIFECYCLE_STEPS.findIndex((s) => s.state === currentState);

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>DIGITAL TWIN LIFECYCLE & CRYPTOGRAPHIC LEDGER</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">PHASE 5 LIVE</span>
          </div>
          <h2 className="text-2xl font-black text-[#1a1e1b]">Feed Quality Passport: {data.batch_id}</h2>
          <p className="text-xs text-stone-500 mt-1">
            Immutable SHA-256 event chaining logging batch state transitions from NIR calibration, bunker storage, to dairy herd feeding.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono bg-[#1b4332] text-[#74c69d] px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            STATE: {currentState}
          </span>
        </div>
      </div>

      {/* Formal Lifecycle State Machine Stepper */}
      <section className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-[#2d6a4f]" />
            <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wide">
              Lifecycle State Machine Engine
            </h3>
          </div>
          <span className="text-[11px] font-mono text-stone-500">
            Current Active State: <b className="text-emerald-800">{currentState}</b>
          </span>
        </div>

        {/* Visual Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          {LIFECYCLE_STEPS.map((step, idx) => {
            const isCurrent = step.state === currentState;
            const isPassed = activeStepIdx > idx;

            return (
              <div 
                key={step.state}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCurrent 
                    ? 'bg-[#1b4332] text-white border-[#2d6a4f] shadow-md ring-2 ring-emerald-500/20' 
                    : isPassed 
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                    : 'bg-stone-50 border-stone-200 text-stone-500'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span>STEP 0{idx + 1}</span>
                  {isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  ) : isPassed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  ) : null}
                </div>
                <div className="text-xs font-bold mt-1.5">{step.label}</div>
                <div className={`text-[10px] mt-0.5 ${isCurrent ? 'text-emerald-200' : 'text-stone-500'}`}>
                  {step.sub}
                </div>
              </div>
            );
          })}
        </div>

        {/* Transition Controller Buttons */}
        <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-stone-600 font-medium">
            Advance State:
          </div>
          <div className="flex flex-wrap gap-2">
            {currentState === "INITIAL_TEST" && (
              <button
                onClick={() => handleTransition("BASKET_ALLOCATION", "QC_PASSED_ASSIGN_BASKET")}
                disabled={transitioning}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800 disabled:opacity-50"
              >
                Assign to Feed Basket →
              </button>
            )}

            {currentState === "BASKET_ALLOCATION" && (
              <button
                onClick={() => handleTransition("STORAGE_MONITORING", "BEGIN_SILAGE_MONITORING")}
                disabled={transitioning}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800 disabled:opacity-50"
              >
                Begin Storage Monitoring →
              </button>
            )}

            {currentState === "STORAGE_MONITORING" && (
              <>
                <button
                  onClick={() => handleTransition("FEEDING_DISPOSITION", "DISPATCH_FOR_HERD_FEEDING")}
                  disabled={transitioning}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800 disabled:opacity-50"
                >
                  Authorize Herd Feeding →
                </button>
                <button
                  onClick={() => handleTransition("RETEST_ALERT", "FLAG_THERMAL_VARIANCE_ANOMALY")}
                  disabled={transitioning}
                  className="px-3 py-1.5 rounded-lg bg-amber-800 text-white font-bold hover:bg-amber-900 disabled:opacity-50"
                >
                  Flag Retest Alert
                </button>
              </>
            )}

            {currentState === "RETEST_ALERT" && (
              <>
                <button
                  onClick={() => handleTransition("STORAGE_MONITORING", "RETEST_CONFIRMED_SAFE")}
                  disabled={transitioning}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800 disabled:opacity-50"
                >
                  Confirm Retest Safe →
                </button>
                <button
                  onClick={() => handleTransition("FEEDING_DISPOSITION", "QUARANTINE_DISPOSITION")}
                  disabled={transitioning}
                  className="px-3 py-1.5 rounded-lg bg-rose-800 text-white font-bold hover:bg-rose-900 disabled:opacity-50"
                >
                  Quarantine / Discard Batch
                </button>
              </>
            )}

            {currentState === "FEEDING_DISPOSITION" && (
              <span className="text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                Batch Lifecycle Completed
              </span>
            )}
          </div>
        </div>

        {transitionSuccess && (
          <p className="text-xs text-emerald-700 font-medium bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
            ✓ {transitionSuccess}
          </p>
        )}
      </section>

      {/* ISO 12099 / BIS Feed Quality Passport Card */}
      <section className="max-w-3xl mx-auto bg-gradient-to-b from-[#1b4332] to-[#122b20] text-white p-6 sm:p-8 rounded-3xl border border-[#52b788]/40 shadow-xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[#2d6a4f] pb-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
              <Fingerprint className="w-6 h-6 text-[#74c69d]"/>
            </div>
            <div>
              <div className="text-[11px] font-mono text-[#74c69d] uppercase tracking-wider">
                ISO 12099 / BIS Standard Certified Record
              </div>
              <h3 className="text-xl font-black mt-0.5">
                {twin.passport?.passport_id || `PASSPORT-${data.batch_id}`}
              </h3>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 px-3 py-1 text-[11px] font-bold">
            {twin.passport?.verification_badge || "SHA-256 HASH CHAIN VALIDATED"}
          </span>
        </header>

        {/* Nutritional & Chemical Specifications */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="text-stone-400 text-[11px]">Feed Type</div>
            <b className="text-sm font-bold text-white mt-1 block">{data.feed_type}</b>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="text-stone-400 text-[11px]">Dry Matter (DM)</div>
            <b className="text-sm font-bold text-emerald-300 mt-1 block">
              {data.nutritional_analysis.dry_matter_pct}%
            </b>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="text-stone-400 text-[11px]">Crude Protein (CP)</div>
            <b className="text-sm font-bold text-emerald-300 mt-1 block">
              {data.nutritional_analysis.crude_protein_pct}%
            </b>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="text-stone-400 text-[11px]">Fermentation pH</div>
            <b className="text-sm font-bold text-white mt-1 block">
              {data.storage_telemetry.ph}
            </b>
          </div>
        </div>

        {/* Standards Compliance List */}
        <div className="bg-black/20 p-4 rounded-xl border border-white/10 text-xs space-y-2">
          <div className="flex items-center space-x-1.5 text-[#74c69d] font-bold">
            <Award className="w-4 h-4" />
            <span>Analytical & Regulatory Compliance Standards:</span>
          </div>
          <ul className="grid sm:grid-cols-2 gap-1.5 text-[11px] text-stone-300">
            <li>• ISO 12099:2017 Animal Feeding Stuffs (NIR)</li>
            <li>• ASTM E1655 Chemometrics Multivariate Analysis</li>
            <li>• ICAR / NRC 2001 Dairy Cattle Nutrient Baseline</li>
            <li>• Bureau of Indian Standards (BIS) Silage Quality</li>
          </ul>
        </div>

        {/* Cryptographic Chain Seal & Verification Action */}
        <div className="rounded-xl bg-black/30 p-4 space-y-3 border border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-1.5">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold">Chain Tip Digest (Latest Block Hash)</span>
            </div>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => copyHash(events[events.length - 1]?.block_hash || twin.integrity_hash)} 
                className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Copy className="w-3.5 h-3.5"/>
                {copied ? "Copied" : "Copy Hash"}
              </button>
              <button 
                type="button" 
                onClick={verifyLedger} 
                disabled={checking} 
                className="text-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#52b788] text-[#122b20] font-bold disabled:opacity-60 hover:bg-[#74c69d] transition-colors"
              >
                {checking ? <LoaderCircle className="w-3.5 h-3.5 animate-spin"/> : <ShieldCheck className="w-3.5 h-3.5"/>}
                {checking ? "Auditing Chain…" : "Verify Cryptographic Ledger"}
              </button>
            </div>
          </div>

          <div className="text-[11px] font-mono text-emerald-300 break-all bg-black/40 p-2.5 rounded-lg">
            {events[events.length - 1]?.block_hash || twin.integrity_hash}
          </div>

          {integrityReport && (
            <div className={`text-xs p-3 rounded-xl border flex items-start gap-2.5 ${
              integrityReport.integrity_valid 
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200' 
                : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
            }`}>
              {integrityReport.integrity_valid ? <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400 flex-shrink-0" /> : <ShieldAlert className="w-4 h-4 mt-0.5 text-rose-400 flex-shrink-0" />}
              <div>
                <b className="block">
                  {integrityReport.integrity_valid 
                    ? `Cryptographic Audit Valid: All ${integrityReport.total_lifecycle_blocks} event blocks chained with zero tampering.` 
                    : "Cryptographic Audit Failed: Block chain or payload digest discrepancy detected."}
                </b>
                <span className="text-[10px] text-stone-300 block mt-1">
                  Genesis Root: {integrityReport.genesis_hash ? integrityReport.genesis_hash.substring(0, 24) + "…" : "Validated"} · Algorithm: SHA-256 Block Chaining
                </span>
              </div>
            </div>
          )}

          {verifyError && <p role="alert" className="text-xs text-rose-300">{verifyError}</p>}
        </div>

        {/* Print / Export Bar */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10 text-stone-400">
          <span>Digital Passport Serial: {data.batch_id}</span>
          <button 
            onClick={() => window.print()} 
            className="inline-flex items-center gap-1 hover:text-white transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Passport</span>
          </button>
        </div>
      </section>

      {/* Complete Immutable Cryptographic Event Ledger */}
      <section className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-stone-900">Cryptographic Lifecycle Audit Trail</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Chronological ledger of signed state blocks (H_k = SHA-256(H_k-1 || Index || State || Actor || Digest)).
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-stone-100 text-stone-700 px-3 py-1 rounded-lg">
            {events.length} Blocks In Chain
          </span>
        </div>

        <div className="space-y-3">
          {events.map((evt, idx) => (
            <article 
              key={evt.event_id || idx} 
              className="bg-stone-50 p-4 rounded-xl border border-stone-200 hover:border-emerald-300 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                    BLOCK #{evt.block_index ?? idx}
                  </span>
                  <span className="font-bold text-stone-800">{evt.action}</span>
                </div>
                <time className="text-[11px] text-stone-500 font-mono">
                  {new Date(evt.timestamp).toLocaleString()}
                </time>
              </div>

              <p className="text-xs text-stone-600 mt-2">
                {evt.detail || `Action ${evt.action} recorded by actor ${evt.actor}.`}
              </p>

              <div className="mt-3 pt-2 border-t border-stone-200/60 grid sm:grid-cols-2 gap-2 text-[10px] font-mono text-stone-500">
                <div className="truncate">
                  <span className="font-bold text-stone-400">Prev Hash: </span>
                  {evt.previous_hash ? evt.previous_hash.substring(0, 28) + "…" : "0000000000000000…"}
                </div>
                <div className="truncate text-right sm:text-left">
                  <span className="font-bold text-emerald-700">Block Hash: </span>
                  {evt.block_hash ? evt.block_hash.substring(0, 28) + "…" : "Calculated"}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Batch Photo Attachments Review */}
      {images.length > 0 && (
        <section className="bg-white p-5 rounded-2xl border border-stone-200">
          <h3 className="font-bold text-sm text-stone-900">Photos Saved with Batch Record</h3>
          <p className="mt-0.5 text-xs text-stone-500">
            Automated computer vision features extracted and archived with batch hash.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {images.map((image) => {
              const url = image.url?.startsWith("/api/") 
                ? new URL(API_BASE_URL).origin + image.url 
                : API_BASE_URL + (image.url ?? `/batches/${data.batch_id}/images/${image.attachment_id}`);
              return (
                <a 
                  key={image.attachment_id} 
                  href={url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-2 rounded-xl border p-2 text-xs hover:border-emerald-500 transition-colors"
                >
                  <Image unoptimized width={64} height={64} src={url} alt={image.original_name} className="h-16 w-16 rounded-lg object-cover"/>
                  <span className="max-w-40 truncate font-medium">{image.original_name}</span>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* Provenance Footer */}
      <section className="bg-white p-5 rounded-2xl border border-stone-200">
        <h3 className="font-bold text-xs uppercase tracking-wide text-stone-500">System Data Provenance</h3>
        <dl className="grid sm:grid-cols-2 gap-3 mt-3 text-xs">
          {Object.entries(provenance).filter(([key]) => key !== "record_created_at").map(([key, value]) => (
            <div key={key} className="bg-stone-50 p-2.5 rounded-lg border border-stone-100">
              <dt className="font-bold uppercase text-[10px] text-stone-400">{key.replaceAll("_", " ")}</dt>
              <dd className="mt-0.5 text-stone-800 font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

    </div>
  );
};
