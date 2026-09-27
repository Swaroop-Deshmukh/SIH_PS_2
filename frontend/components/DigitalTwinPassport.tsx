"use client";

import React, { useState } from 'react';
import { ShieldCheck, FileText, CheckCircle2, Lock, Sparkles, Printer, Copy, Check } from 'lucide-react';
import { dictionary, Language } from '../lib/dictionary';
import { BatchAnalyzeResponse } from '../lib/api';

interface DigitalTwinPassportProps {
  lang: Language;
  data: BatchAnalyzeResponse;
}

export const DigitalTwinPassport: React.FC<DigitalTwinPassportProps> = ({ lang, data }) => {
  const t = dictionary[lang];
  const { digital_twin, nutritional_analysis, evidence, storage_telemetry, feed_type, batch_id } = data;
  const { timeline, passport, integrity_hash } = digital_twin;

  const [copied, setCopied] = useState(false);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(integrity_hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      
      {/* 1. FEED DIGITAL TWIN LIFECYCLE TIMELINE */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2d6a4f] uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-[#52b788]" />
            <span>FEED DIGITAL TWIN • LIFECYCLE TRACEABILITY</span>
          </div>
          <h2 className="text-2xl font-black text-[#1a1e1b]">Feed Batch #{batch_id} Digital Twin</h2>
          <p className="text-xs text-stone-500 mt-1">
            Connected digital twin maintaining end-to-end history from NIR test scan to storage telemetry and dairy ration consumption.
          </p>
        </div>

        {/* 5-Step Lifecycle Visualizer */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {timeline.map((item, idx) => (
            <div key={idx} className="bg-stone-50 p-4 rounded-xl border border-stone-200 relative">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-400 mb-2">
                <span>STEP 0{idx + 1}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] ${item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'}`}>
                  {item.status}
                </span>
              </div>
              <h4 className="text-xs font-black text-[#1b4332]">{item.title}</h4>
              <p className="text-[11px] text-stone-600 mt-1 leading-normal">{item.detail}</p>
              <div className="text-[10px] text-stone-400 font-mono mt-2">{item.timestamp}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. OFFICIAL FEEDSURE QUALITY PASSPORT */}
      <div className="max-w-3xl mx-auto bg-gradient-to-b from-[#1b4332] to-[#122b20] text-white p-8 rounded-3xl border-2 border-[#52b788]/40 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Background Watermark Pattern */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#52b788]/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Passport Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#2d6a4f] gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-[#74c69d] tracking-widest uppercase">
              <ShieldCheck className="w-4 h-4 text-[#52b788]" />
              <span>{passport.title}</span>
            </div>
            <h3 className="text-2xl font-black text-white mt-1">{passport.passport_id}</h3>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-full font-bold">
              {passport.verification_badge}
            </span>
          </div>
        </div>

        {/* Passport Body Parameters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
          <div className="bg-[#1b4332]/60 p-3 rounded-xl border border-[#40916c]/30">
            <div className="text-[10px] text-stone-400 uppercase font-bold">Feed Type</div>
            <div className="text-sm font-black text-white mt-0.5">{feed_type}</div>
          </div>
          <div className="bg-[#1b4332]/60 p-3 rounded-xl border border-[#40916c]/30">
            <div className="text-[10px] text-stone-400 uppercase font-bold">Crude Protein</div>
            <div className="text-sm font-black text-[#74c69d] mt-0.5">{nutritional_analysis.crude_protein_pct}%</div>
          </div>
          <div className="bg-[#1b4332]/60 p-3 rounded-xl border border-[#40916c]/30">
            <div className="text-[10px] text-stone-400 uppercase font-bold">Dry Matter</div>
            <div className="text-sm font-black text-[#d4a373] mt-0.5">{nutritional_analysis.dry_matter_pct}%</div>
          </div>
          <div className="bg-[#1b4332]/60 p-3 rounded-xl border border-[#40916c]/30">
            <div className="text-[10px] text-stone-400 uppercase font-bold">Trust Status</div>
            <div className="text-sm font-black text-emerald-300 mt-0.5">{evidence.trust_status}</div>
          </div>
        </div>

        {/* SHA-256 Tamper-Proof Cryptographic Hash Block */}
        <div className="p-4 bg-[#122b20] rounded-xl border border-[#2d6a4f] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#74c69d] font-mono">
            <span className="flex items-center space-x-1.5 font-bold">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>SHA-256 INTEGRITY SIGNATURE</span>
            </span>
            <button
              onClick={handleCopyHash}
              className="text-stone-300 hover:text-white flex items-center space-x-1 text-[11px] transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Hash'}</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-gray-300 bg-black/40 p-2.5 rounded-lg break-all select-all">
            {integrity_hash}
          </div>
        </div>

        {/* Passport Footer */}
        <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-[#2d6a4f]">
          <div>Model: <span className="text-stone-200">{passport.model_version}</span></div>
          <div>Issued: <span className="text-stone-200">{new Date(passport.issued_at).toLocaleDateString()}</span></div>
        </div>

      </div>

    </div>
  );
};
