"use client";

import React, { useEffect, useState } from "react";
import { History, Search, RefreshCw, CheckCircle2, AlertTriangle, XCircle, ArrowRight, Eye, ShieldCheck } from "lucide-react";
import { BatchAnalyzeResponse, listBatches } from "../lib/api";
import { Language } from "../lib/dictionary";

interface BatchHistoryProps {
  lang: Language;
  onSelectBatch: (batch: BatchAnalyzeResponse) => void;
  currentBatchId?: string;
}

export const BatchHistory: React.FC<BatchHistoryProps> = ({
  lang,
  onSelectBatch,
  currentBatchId,
}) => {
  const [batches, setBatches] = useState<BatchAnalyzeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterScenario, setFilterScenario] = useState("all");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listBatches(50);
      setBatches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load batch records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filtered = batches.filter((b) => {
    const matchesSearch =
      b.batch_id.toLowerCase().includes(search.toLowerCase()) ||
      b.feed_type.toLowerCase().includes(search.toLowerCase()) ||
      b.evidence.trust_status.toLowerCase().includes(search.toLowerCase());
    const matchesScenario = filterScenario === "all" || b.scenario === filterScenario;
    return matchesSearch && matchesScenario;
  });

  const getStatusBadge = (status: string) => {
    if (status.includes("TRUSTED")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          {status}
        </span>
      );
    }
    if (status.includes("RETEST") || status.includes("STORAGE")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
        <XCircle className="w-3 h-3 text-rose-600" />
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#2d6a4f] uppercase tracking-wider">
            <History className="w-4 h-4" />
            <span>Farm Records · SQLite Audit Trail</span>
          </div>
          <h2 className="text-2xl font-black text-stone-900 mt-1">Batch Testing History</h2>
          <p className="text-xs text-stone-600 mt-1">
            Historical rapid test records stored locally on-device. Each batch retains cryptographic SHA-256 integrity hash and multi-source evidence.
          </p>
        </div>
        <button
          onClick={() => void loadData()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Records
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by Batch ID, feed type, or trust status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]"
          />
        </div>
        <select
          value={filterScenario}
          onChange={(e) => setFilterScenario(e.target.value)}
          className="w-full sm:w-auto px-3 py-2.5 text-xs bg-white border border-stone-300 rounded-xl font-bold text-stone-700"
        >
          <option value="all">All Scenarios</option>
          <option value="healthy">Scenario A: Healthy</option>
          <option value="heterogeneous">Scenario B: Heterogeneous</option>
          <option value="ood">Scenario C: Out-of-Domain</option>
          <option value="storage_warning">Scenario D: Storage Spoilage</option>
          <option value="adulteration">Scenario E: Adulteration Flag</option>
        </select>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          {error}
        </div>
      )}

      {/* Batch Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200">
          Loading batch records from local SQLite database...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200">
          No batch records matched your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => {
            const isCurrent = b.batch_id === currentBatchId;
            const evidencePct = Math.round(b.evidence.evidence_score * 100);

            return (
              <div
                key={b.batch_id}
                className={`bg-white rounded-2xl border p-5 transition hover:shadow-md flex flex-col justify-between ${
                  isCurrent ? "border-[#2d6a4f] ring-2 ring-[#2d6a4f]/20 bg-emerald-50/20" : "border-stone-200"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-[#1b4332]">{b.batch_id}</span>
                    {getStatusBadge(b.evidence.trust_status)}
                  </div>
                  <h3 className="font-bold text-stone-900 mt-2 text-sm">{b.feed_type}</h3>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    {new Date(b.digital_twin.created_at).toLocaleString()}
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-3 gap-2 text-center">
                    <div className="bg-stone-50 p-2 rounded-lg">
                      <div className="text-[10px] text-stone-500 font-bold">DM %</div>
                      <div className="text-xs font-black text-stone-800 mt-0.5">
                        {b.nutritional_analysis.dry_matter_pct.toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-stone-50 p-2 rounded-lg">
                      <div className="text-[10px] text-stone-500 font-bold">CP %</div>
                      <div className="text-xs font-black text-stone-800 mt-0.5">
                        {b.nutritional_analysis.crude_protein_pct.toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-stone-50 p-2 rounded-lg">
                      <div className="text-[10px] text-stone-500 font-bold">Evidence</div>
                      <div className="text-xs font-black text-[#2d6a4f] mt-0.5">
                        {evidencePct}%
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-stone-500 truncate">
                    <ShieldCheck className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">Hash: {b.digital_twin.integrity_hash.slice(0, 16)}...</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-500 capitalize">
                    {b.scenario.replace("_", " ")}
                  </span>
                  <button
                    onClick={() => onSelectBatch(b)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#1b4332] hover:text-[#2d6a4f]"
                  >
                    <span>View Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
