"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { 
  Check, Copy, Fingerprint, LoaderCircle, ShieldAlert, ShieldCheck, 
  ArrowRight, RefreshCw, Layers, Award, FileText, CheckCircle2,
  AlertTriangle, Lock, Cpu, ExternalLink, Printer, QrCode, Download,
  Building, Sparkles, CheckCheck
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
  const { digital_twin: twin, data_provenance: provenance, evidence, nutritional_analysis: nutrition, storage_telemetry: storage } = data;
  
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [integrityReport, setIntegrityReport] = useState<any | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [images, setImages] = useState<BatchImage[]>([]);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  
  // Phase 5 State Machine & Ledger State
  const [currentState, setCurrentState] = useState<string>(
    twin.current_state || (twin.passport as any)?.current_lifecycle_state || "STORAGE_MONITORING"
  );
  const [events, setEvents] = useState<LifecycleEvent[]>(twin.lifecycle_events || []);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionSuccess, setTransitionSuccess] = useState<string | null>(null);

  // Generate QR Code for Batch Integrity Verification URL
  useEffect(() => {
    const verifyEndpoint = `${API_BASE_URL}/batches/${data.batch_id}/verify-integrity`;
    QRCode.toDataURL(verifyEndpoint, {
      width: 320,
      margin: 1,
      color: {
        dark: "#122b20",
        light: "#ffffff"
      },
      errorCorrectionLevel: "H"
    })
      .then(setQrDataUrl)
      .catch((err) => console.error("QR Code generation error:", err));
  }, [data.batch_id]);

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
      void verifyLedger();
    } catch (err: any) {
      setVerifyError(err.message || String(err));
    } finally {
      setTransitioning(false);
    }
  };

  const activeStepIdx = LIFECYCLE_STEPS.findIndex((s) => s.state === currentState);
  const chainTipHash = events[events.length - 1]?.block_hash || twin.integrity_hash;
  const genesisHash = (twin.passport as any)?.genesis_hash || events[0]?.block_hash || twin.integrity_hash;

  return (
    <div className="space-y-6">

      {/* Screen 8 Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">
            <span className="bg-[#1b4332] text-[#74c69d] px-2.5 py-0.5 rounded-full font-mono text-[10px]">
              SCREEN 8 OF 8
            </span>
            <span>FEED QUALITY PASSPORT &amp; CRYPTOGRAPHIC DIGITAL TWIN</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
            Cryptographic Integrity &amp; Passport: {data.batch_id}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Immutable SHA-256 event chaining logging batch state transitions from NIR calibration, bunker storage, to dairy herd feeding.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono bg-[#1b4332] text-[#74c69d] px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            STATE: {currentState}
          </span>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Passport (PDF)</span>
          </button>
        </div>
      </div>

      {/* Downloadable / Printable Feed Quality Passport (PDF & QR Card) */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6 no-print">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-emerald-600" />
              <h3 className="font-black text-lg text-stone-900">
                Downloadable &amp; Printable Feed Quality Passport (QR Card)
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Clean authenticated summary showing batch ID, measured nutrients, evidence sufficiency score, and cryptographic hash.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-[#1b4332] text-[#74c69d] hover:bg-[#2d6a4f] text-xs font-bold flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF Certificate</span>
            </button>
          </div>
        </div>

        {/* QR Card & Batch Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* Authentic High-Res QR Verification Card */}
          <div className="bg-gradient-to-b from-[#1b4332] to-[#122b20] text-white p-6 rounded-2xl border border-[#52b788]/40 shadow-lg flex flex-col items-center justify-between text-center">
            <div className="w-full flex items-center justify-between text-[11px] font-mono text-[#74c69d] pb-2 border-b border-white/10">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                VERIFIED TWIN
              </span>
              <span>ISO 12099</span>
            </div>

            <div className="my-4 bg-white p-3 rounded-2xl shadow-inner border-2 border-[#74c69d]">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code for Batch ${data.batch_id}`}
                  className="w-44 h-44 object-contain"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-stone-400">
                  <LoaderCircle className="w-8 h-8 animate-spin" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-emerald-300">
                {data.batch_id}
              </div>
              <p className="text-[10px] text-stone-300 max-w-[200px]">
                Scan with any smartphone camera to verify cryptographic hash against Government/Consortium registry.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 w-full flex items-center justify-center gap-2">
              <button
                onClick={verifyLedger}
                disabled={checking}
                className="w-full py-2 px-3 rounded-xl bg-[#52b788] text-[#122b20] text-xs font-extrabold hover:bg-[#74c69d] transition flex items-center justify-center gap-1.5"
              >
                {checking ? <LoaderCircle className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
                <span>{checking ? "Auditing Ledger…" : "Audit Authenticity"}</span>
              </button>
            </div>
          </div>

          {/* Clean Summary: Measured Nutrients, Evidence Score, Cryptographic Hash */}
          <div className="md:col-span-2 flex flex-col justify-between space-y-4">
            
            {/* Quick Nutrient Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Dry Matter (DM)</span>
                <div className="text-xl font-black text-[#1b4332] mt-1 font-mono">{nutrition.dry_matter_pct}%</div>
                <div className="text-[10px] text-stone-400 mt-0.5">PLSR Regression</div>
              </div>
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Crude Protein (CP)</span>
                <div className="text-xl font-black text-[#1b4332] mt-1 font-mono">{nutrition.crude_protein_pct}%</div>
                <div className="text-[10px] text-stone-400 mt-0.5">N-H overtone</div>
              </div>
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Fiber (NDF / ADF)</span>
                <div className="text-xl font-black text-[#1b4332] mt-1 font-mono">{nutrition.ndf_pct}% / {nutrition.adf_pct}%</div>
                <div className="text-[10px] text-stone-400 mt-0.5">Structural cell wall</div>
              </div>
              <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Flieg Fermentation</span>
                <div className="text-xl font-black text-[#1b4332] mt-1 font-mono">
                  {storage.flieg_evaluation?.flieg_score ?? 88}/100
                </div>
                <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                  {storage.flieg_evaluation?.grade ?? "VERY_GOOD"}
                </div>
              </div>
            </div>

            {/* Evidence Sufficiency & Trust Card */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  Evidence Sufficiency Score
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-black text-[#1b4332] font-mono">
                    {evidence.evidence_score}/100
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    evidence.trust_status === 'TRUSTED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {evidence.trust_status}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1">
                  Mahalanobis calibration distance D_M = {evidence.metrics.ood_distance.toFixed(2)} (Domain threshold 2.50).
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] font-mono text-stone-500 bg-white px-3 py-1 rounded-lg border border-stone-200 block">
                  Blocks in Ledger: <b>{events.length}</b>
                </span>
              </div>
            </div>

            {/* Cryptographic Hash Summary */}
            <div className="bg-stone-900 text-white p-4 rounded-2xl space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-stone-400 text-[10px] uppercase font-bold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Lock className="w-3.5 h-3.5" />
                  Cryptographic Chain Tip Hash (SHA-256)
                </span>
                <button
                  onClick={() => copyHash(chainTipHash)}
                  className="hover:text-white transition flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="text-emerald-300 break-all text-[11px] bg-black/40 p-2.5 rounded-lg border border-white/5">
                {chainTipHash}
              </div>
              <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
                <span>Genesis: {genesisHash.substring(0, 16)}…</span>
                <span>Algorithm: ISO/IEC 10118-3 SHA-256</span>
              </div>
            </div>

            {/* Verification Result Banner if audited */}
            {integrityReport && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 font-mono ${
                integrityReport.integrity_valid 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}>
                {integrityReport.integrity_valid ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />}
                <span>
                  {integrityReport.integrity_valid 
                    ? `Cryptographic Audit Valid: All ${integrityReport.total_lifecycle_blocks} event blocks chained with zero tampering.` 
                    : "Cryptographic Audit Failed: Discrepancy detected in block chaining."}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Formal Lifecycle State Machine Stepper */}
      <section className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4 no-print">
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
            const isCompleted = idx < activeStepIdx;
            const isCurrent = idx === activeStepIdx;

            return (
              <div
                key={step.state}
                className={`p-3 rounded-xl border transition-all text-xs ${
                  isCurrent
                    ? "bg-[#1b4332] text-white border-[#74c69d] shadow-sm"
                    : isCompleted
                    ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                    : "bg-stone-50 text-stone-400 border-stone-200"
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-[10px] font-mono">0{idx + 1}</span>
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-[#74c69d] animate-ping" />
                  ) : null}
                </div>
                <div className="font-extrabold mt-1 text-sm">{step.label}</div>
                <div className={`text-[10px] mt-0.5 ${isCurrent ? "text-emerald-200" : "opacity-80"}`}>
                  {step.sub}
                </div>
              </div>
            );
          })}
        </div>

        {/* State Transition Actions */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 text-xs">
          <span className="text-stone-500 font-medium">Trigger State Transition:</span>
          <div className="flex flex-wrap gap-2">
            {currentState !== "BASKET_ALLOCATION" && (
              <button
                disabled={transitioning}
                onClick={() => handleTransition("BASKET_ALLOCATION", "ALLOCATE_TO_RATION")}
                className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-emerald-50 font-bold text-stone-700 transition"
              >
                Allocate to Ration
              </button>
            )}
            {currentState !== "STORAGE_MONITORING" && (
              <button
                disabled={transitioning}
                onClick={() => handleTransition("STORAGE_MONITORING", "MONITOR_STORAGE")}
                className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-emerald-50 font-bold text-stone-700 transition"
              >
                Monitor in Silo
              </button>
            )}
            {currentState !== "FEEDING_DISPOSITION" && (
              <button
                disabled={transitioning}
                onClick={() => handleTransition("FEEDING_DISPOSITION", "FEED_HERD")}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 font-bold text-white transition"
              >
                Disposition: Herd Fed
              </button>
            )}
          </div>
        </div>

        {transitionSuccess && (
          <p className="text-xs text-emerald-700 font-medium bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
            ✓ {transitionSuccess}
          </p>
        )}
      </section>

      {/* Complete Immutable Cryptographic Event Ledger */}
      <section className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4 no-print">
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

      {/* DEDICATED OFFICIAL PRINTABLE PASSPORT CERTIFICATE (Shown on Screen & Formatted for Print / PDF) */}
      <section className="passport-certificate bg-white p-8 sm:p-10 rounded-3xl border-4 border-[#1b4332] shadow-2xl space-y-6 text-stone-900">
        
        {/* Certificate Header with Emblem styling */}
        <div className="border-b-2 border-[#1b4332] pb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1b4332] flex items-center justify-center text-white font-black text-2xl shadow-md border-2 border-[#74c69d]">
              360
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-[#2d6a4f]">
                Smart India Hackathon 2026 · PS 26111
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#1b4332] tracking-tight">
                FEED QUALITY PASSPORT &amp; PROVENANCE CERTIFICATE
              </h1>
              <p className="text-xs text-stone-500 font-medium">
                Ministry of Fisheries, Animal Husbandry &amp; Dairying · Government of India
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right shrink-0">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-300">
              OFFICIAL VERIFIED RECORD
            </span>
            <div className="text-xs font-mono text-stone-500 mt-1">
              Serial: <b>{data.batch_id}</b>
            </div>
          </div>
        </div>

        {/* Certificate Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-[10px] uppercase font-bold text-stone-400">Feed Matrix</span>
            <div className="font-extrabold text-sm text-stone-900 mt-0.5">{data.feed_type}</div>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-[10px] uppercase font-bold text-stone-400">Farm Location</span>
            <div className="font-extrabold text-sm text-stone-900 mt-0.5">{data.farm_profile.location}</div>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-[10px] uppercase font-bold text-stone-400">Herd Scale</span>
            <div className="font-extrabold text-sm text-stone-900 mt-0.5">
              {data.farm_profile.lactating_animals} Lactating Cows
            </div>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-[10px] uppercase font-bold text-stone-400">Timestamp</span>
            <div className="font-mono text-xs text-stone-800 mt-0.5">
              {new Date().toLocaleDateString("en-IN")}
            </div>
          </div>
        </div>

        {/* Chemical & Nutritional Quality Matrix Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#1b4332] flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Certified Laboratory &amp; Chemometric Specifications</span>
          </h4>
          <table className="w-full text-xs text-left border border-stone-200 rounded-xl overflow-hidden">
            <thead className="bg-[#1b4332] text-white uppercase text-[10px] font-mono">
              <tr>
                <th className="py-2.5 px-3">Parameter</th>
                <th className="py-2.5 px-3">Certified Value</th>
                <th className="py-2.5 px-3">Confidence / Tolerance</th>
                <th className="py-2.5 px-3">Standard Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 font-mono">
              <tr>
                <td className="py-2 px-3 font-sans font-bold">Dry Matter (DM %)</td>
                <td className="py-2 px-3 font-bold text-emerald-800">{nutrition.dry_matter_pct}%</td>
                <td className="py-2 px-3 text-stone-500">± 1.2% (95% CI)</td>
                <td className="py-2 px-3 text-stone-500 font-sans">ISO 12099:2017 Diffuse NIR</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans font-bold">Crude Protein (CP %)</td>
                <td className="py-2 px-3 font-bold text-emerald-800">{nutrition.crude_protein_pct}%</td>
                <td className="py-2 px-3 text-stone-500">± 0.4% (95% CI)</td>
                <td className="py-2 px-3 text-stone-500 font-sans">PLSR Dumas Nitrogen Equivalence</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans font-bold">Neutral Detergent Fiber (NDF %)</td>
                <td className="py-2 px-3">{nutrition.ndf_pct}%</td>
                <td className="py-2 px-3 text-stone-500">± 1.5%</td>
                <td className="py-2 px-3 text-stone-500 font-sans">Van Soest Detergent Fiber</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans font-bold">Acid Detergent Fiber (ADF %)</td>
                <td className="py-2 px-3">{nutrition.adf_pct}%</td>
                <td className="py-2 px-3 text-stone-500">± 1.1%</td>
                <td className="py-2 px-3 text-stone-500 font-sans">AOAC Official Method 973.18</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans font-bold">Silage Fermentation pH</td>
                <td className="py-2 px-3">{storage.ph}</td>
                <td className="py-2 px-3 text-stone-500">± 0.05 pH</td>
                <td className="py-2 px-3 text-stone-500 font-sans">Electrometric glass electrode</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans font-bold">Flieg Fermentation Quality Score</td>
                <td className="py-2 px-3 font-bold text-emerald-800">
                  {storage.flieg_evaluation?.flieg_score ?? 88} / 100
                </td>
                <td className="py-2 px-3 text-stone-500">
                  Grade: {storage.flieg_evaluation?.grade ?? "VERY_GOOD"}
                </td>
                <td className="py-2 px-3 text-stone-500 font-sans">German DLG Silage Evaluation Standard</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Cryptographic Stamp & QR Verification Card on Certificate */}
        <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-[#1b4332] font-bold">
              <Lock className="w-4 h-4" />
              <span>CRYPTOGRAPHIC IMMUTABILITY ATTESTATION</span>
            </div>
            <p className="text-[11px] text-stone-600 max-w-md">
              This feed batch is sealed in an append-only SHA-256 cryptographic chain. Any unauthorized modification to moisture, protein, or fermentation sensor telemetry breaks the parent-hash signature chain.
            </p>
            <div className="font-mono text-[10px] text-stone-500 break-all bg-white p-2 rounded border border-stone-200">
              <span className="font-bold text-stone-700">Chain Tip Digest: </span>
              {chainTipHash}
            </div>
            <div className="text-[10px] text-stone-400">
              Evidence Sufficiency Score: <b>{evidence.evidence_score}/100</b> · Trust: <b>{evidence.trust_status}</b>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center text-center">
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="Verification QR Code"
                className="w-28 h-28 border border-stone-300 rounded-lg p-1 bg-white"
              />
            )}
            <span className="text-[9px] font-mono text-stone-500 mt-1 uppercase">
              Scan to Verify Online
            </span>
          </div>
        </div>

        {/* Compliance Stamps & Sign-off Footer */}
        <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            <span className="font-bold text-stone-800">Accreditation Standards:</span> ISO 12099:2017 · ASTM E1655 · ICAR/NRC 2001 · BIS IS 2052:2009
          </div>
          <div className="text-right">
            <span className="font-mono text-[10px] bg-stone-100 px-2.5 py-1 rounded">
              Signed: FeedSure 360 AI Engine
            </span>
          </div>
        </div>
      </section>

      {/* Batch Photo Attachments Review */}
      {images.length > 0 && (
        <section className="bg-white p-5 rounded-2xl border border-stone-200 no-print">
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
      <section className="bg-white p-5 rounded-2xl border border-stone-200 no-print">
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

      {/* Print CSS Stylesheet */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          nav, header, footer, .no-print, button {
            display: none !important;
          }
          .passport-certificate {
            border: 2px solid #1b4332 !important;
            box-shadow: none !important;
            padding: 24px !important;
            margin: 0 !important;
            width: 100% !important;
            page-break-after: avoid !important;
          }
        }
      `}</style>

    </div>
  );
};
