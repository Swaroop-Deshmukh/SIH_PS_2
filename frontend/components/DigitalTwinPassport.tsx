"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Check, Copy, Fingerprint, LoaderCircle, ShieldAlert, ShieldCheck } from "lucide-react";
import { API_BASE_URL, BatchAnalyzeResponse, BatchImage, getBatchImages, verifyBatchIntegrity } from "../lib/api";
import { Language } from "../lib/dictionary";
import { QRCodeView } from "./QRCodeView";
interface Props { lang: Language; data: BatchAnalyzeResponse; }
export const DigitalTwinPassport: React.FC<Props> = ({ data }) => {
  const { digital_twin: twin, data_provenance: provenance } = data;
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [integrity, setIntegrity] = useState<boolean | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [images, setImages] = useState<BatchImage[]>([]);
  useEffect(() => { void getBatchImages(data.batch_id).then(setImages).catch(() => setImages([])); }, [data.batch_id]);
  const copyHash = async () => { try { await navigator.clipboard.writeText(twin.integrity_hash); setCopied(true); window.setTimeout(() => setCopied(false), 1600); } catch { setVerifyError("Clipboard access is unavailable in this browser."); } };
  const verify = async () => { setChecking(true); setVerifyError(null); try { const result = await verifyBatchIntegrity(data.batch_id); setIntegrity(result.integrity_valid); } catch (error) { setVerifyError(error instanceof Error ? error.message : "Could not verify this record."); } finally { setChecking(false); } };
  const hideValues = ["RESULT NOT TRUSTED", "SUSPECTED ADULTERATION"].includes(data.evidence.trust_status);
  const qrPayload = JSON.stringify({
    passport_id: twin.passport.passport_id,
    batch_id: data.batch_id,
    feed_type: data.feed_type,
    trust: data.evidence.trust_status,
    hash: twin.integrity_hash.slice(0, 16) + "...",
  });
  return <div className="space-y-6">
    <section className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 space-y-5">
      <div><div className="text-xs font-bold text-[#2d6a4f] uppercase">Batch history · local prototype record</div><h2 className="text-2xl font-black mt-1">{data.batch_id}</h2><p className="text-xs text-stone-600 mt-1">This record contains simulated screening inputs. It is not a laboratory certificate, device signature, or independently audited passport.</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">{twin.timeline.map((item) => <article key={item.step} className="bg-stone-50 p-4 rounded-xl border border-stone-200"><div className="flex justify-between gap-2 text-[10px] text-stone-500 font-bold"><span>{item.step}</span><span>{item.status}</span></div><h3 className="text-sm font-bold mt-2">{item.title}</h3><p className="text-xs text-stone-600 mt-1">{item.detail}</p><time className="block text-[10px] text-stone-500 font-mono mt-2">{item.timestamp}</time></article>)}</div>
    </section>
    <section className="max-w-3xl mx-auto bg-gradient-to-b from-[#1b4332] to-[#122b20] text-white p-6 sm:p-8 rounded-3xl border border-[#52b788]/40 shadow-xl space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[#2d6a4f] pb-4">
        <div className="flex gap-2">
          <Fingerprint className="w-5 h-5 text-[#74c69d]"/>
          <div>
            <div className="text-xs font-mono text-[#74c69d] uppercase">Feed quality digital passport</div>
            <h3 className="text-xl font-black mt-1">{twin.passport.passport_id}</h3>
          </div>
        </div>
        <span className="rounded-full bg-amber-500/15 text-amber-200 border border-amber-300/30 px-3 py-1 text-[10px] font-bold">{twin.passport.verification_badge}</span>
      </header>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-black/15 p-4 rounded-2xl border border-white/10">
        <div className="grid grid-cols-2 gap-4 text-xs flex-1">
          <div><div className="text-stone-400">Feed Type</div><b className="text-white text-sm">{data.feed_type}</b></div>
          <div><div className="text-stone-400">Trust Status</div><b className="text-amber-200 text-sm">{data.evidence.trust_status}</b></div>
          <div><div className="text-stone-400">Batch Timestamp</div><b>{new Date(twin.created_at).toLocaleString()}</b></div>
          <div><div className="text-stone-400">Model Version</div><b>{twin.passport.model_version}</b></div>
          <div><div className="text-stone-400">Evidence Level</div><b>{data.evidence.evidence_level} ({Math.round(data.evidence.evidence_score * 100)}%)</b></div>
          <div><div className="text-stone-400">Traceability ID</div><b className="font-mono text-emerald-300">{data.batch_id}</b></div>
        </div>
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <QRCodeView value={qrPayload} size={110} bgColor="#ffffff" fgColor="#122b20" />
          <span className="text-[10px] font-mono text-stone-300">Scan for Verification</span>
        </div>
      </div>

      <div className="rounded-xl bg-black/20 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-stone-200">SHA-256 Digest of Saved Summary</span>
          <div className="flex gap-2">
            <button type="button" onClick={copyHash} className="text-xs inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"><Copy className="w-3.5 h-3.5"/>{copied ? "Copied" : "Copy hash"}</button>
            <button type="button" onClick={verify} disabled={checking} className="text-xs inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#52b788] text-[#122b20] font-bold disabled:opacity-60 hover:bg-[#74c69d] transition">{checking ? <LoaderCircle className="w-3.5 h-3.5 animate-spin"/> : <ShieldCheck className="w-3.5 h-3.5"/>}{checking ? "Checking…" : "Verify record integrity"}</button>
          </div>
        </div>
        <div className="text-[11px] font-mono text-stone-200 break-all bg-black/30 p-2.5 rounded-lg border border-white/10">{twin.integrity_hash}</div>
        {integrity !== null && <div className={integrity ? "text-emerald-200 text-xs flex gap-2 font-bold" : "text-rose-200 text-xs flex gap-2 font-bold"}>{integrity ? <Check className="w-4 h-4"/> : <ShieldAlert className="w-4 h-4"/>}{integrity ? "SHA-256 digest matches stored record. Zero tampering detected." : "Digest mismatch! Stored batch summary may have been altered."}</div>}
        {verifyError && <p role="alert" className="text-xs text-rose-200">{verifyError}</p>}
      </div>
      <p className="text-[11px] text-stone-300">SHA-256 cryptographic digest provides tamper-evidence for stored batch summaries. Demonstrates immutable audit-trail capability for dairy cooperatives and certification bodies.</p>
    </section>
    <section className="bg-white p-5 rounded-2xl border border-stone-200"><h3 className="font-bold">Data sources for this record</h3><dl className="grid sm:grid-cols-2 gap-3 mt-3 text-xs">{Object.entries(provenance).filter(([key]) => key !== "record_created_at").map(([key,value]) => <div key={key}><dt className="font-bold uppercase text-stone-500">{key.replaceAll("_", " ")}</dt><dd className="mt-1 text-stone-800">{value}</dd></div>)}</dl></section>
    {images.length > 0 && <section className="bg-white p-5 rounded-2xl border border-stone-200"><h3 className="font-bold">Photos saved with this batch</h3><p className="mt-1 text-xs text-stone-600">Photos are available for human review. They were not analyzed by AI.</p><div className="mt-3 flex flex-wrap gap-3">{images.map((image) => { const url = image.url?.startsWith("/api/") ? new URL(API_BASE_URL).origin + image.url : API_BASE_URL + (image.url ?? `/batches/${data.batch_id}/images/${image.attachment_id}`); return <a key={image.attachment_id} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border p-2 text-xs"><Image unoptimized width={64} height={64} src={url} alt={image.original_name} className="h-16 w-16 rounded-lg object-cover"/><span className="max-w-40 truncate">{image.original_name}</span></a>; })}</div></section>}
    {!hideValues && <p className="text-[10px] text-stone-500">Nutrient demo values: {data.nutritional_analysis.data_badge}. {data.nutritional_analysis.dry_matter_pct}% DM · {data.nutritional_analysis.crude_protein_pct}% CP.</p>}
  </div>;
};
