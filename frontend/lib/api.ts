export type FeedType = "Maize Silage" | "Green Fodder" | "Dry Fodder" | "Concentrate";
export type ScenarioId = "healthy" | "heterogeneous" | "ood" | "storage_warning" | "adulteration";
export interface BasketItem { name: string; quantity_kg: number; cp_pct: number; dm_pct: number; data_source: string; }
export interface FarmProfile {
  farm_name: string; location: string; lactating_animals: number; dry_animals: number;
  daily_milk_yield_liters: number; ration_group: "lactating" | "dry"; data_source: string;
}
export interface FarmContext { farm_profile: FarmProfile; feed_basket: BasketItem[]; updated_at?: string; }
export interface BatchAnalyzeResponse {
  batch_id: string; feed_type: string; scenario: string;
  nir_data: { wavelengths: number[]; points: Array<{ point_id: string; reflectance: number[] }>; scenario: string };
  cv_screening: { visual_anomaly_detected: boolean; anomaly_score: number; mould_risk_level: string; mould_coverage_pct: number; foreign_material_detected: boolean; texture_uniformity: number; color_consistency_score: number; screening_summary: string };
  storage_telemetry: { ph: number; temperature_celsius: number; humidity_pct: number; moisture_pct: number; exposure_days: number; spoilage_risk_index: number; status: string; telemetry_badge: string };
  evidence: { evidence_score: number; evidence_level: string; trust_status: string; metrics: { spectral_quality: number; sample_consistency: number; calibration_fit: number; prediction_uncertainty: number; visual_agreement: number; ood_distance: number }; untrusted_reasons: string[]; recommendation: string };
  nutritional_analysis: { dry_matter_pct: number; moisture_pct: number; crude_protein_pct: number; ndf_pct: number; adf_pct: number; is_simulated_data: boolean; data_badge: string };
  dairy_ration: { herd_summary: { lactating_animals: number; dry_animals: number; total_herd: number }; ration_analysis: { tested_feed_cp_pct: number; basket_weighted_cp_pct: number; target_cp_pct: number; cp_gap_pct: number; cp_status: string; fiber_status: string; ration_group?: string; basis?: string }; dairy_interpretation: string };
  advisories: Array<{ id: string; severity: string; category: string; title: string; message: string; verification_required: boolean }>;
  digital_twin: { batch_id: string; feed_type: string; scenario: string; integrity_hash: string; created_at: string; timeline: Array<{ step: string; title: string; timestamp: string; status: string; detail: string }>; passport: { title: string; passport_id: string; issued_at: string; model_version: string; verification_status: string; verification_badge: string } };
  farm_profile: FarmProfile; feed_basket: BasketItem[];
  data_provenance: { mode: string; measurement_source: string; nutrition_source: string; vision_source: string; evidence_source: string; storage_source: string; record_created_at: string };
}
export interface ApiHealth { status: string; system: string; storage: string; data_mode: string; version: string; }
export interface BatchImage { attachment_id: string; batch_id: string; original_name: string; content_type: string; size_bytes: number; created_at: string; url?: string; image_analysis?: string; message?: string; }
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(API_BASE_URL + path, {
      ...init, headers: { "Content-Type": "application/json", ...init?.headers }, cache: "no-store",
    });
  } catch {
    throw new Error("FeedSure API is unreachable at " + API_BASE_URL + ". Start the backend and try again.");
  }
  if (!response.ok) {
    let detail = "Request failed (" + response.status + ")";
    try { const body = await response.json(); if (body.detail) detail = Array.isArray(body.detail) ? body.detail.map((x: { msg?: string }) => x.msg).join("; ") : body.detail; } catch { /* Keep HTTP status. */ }
    throw new Error(detail);
  }
  return response.json() as Promise<T>;
}
export const checkApiHealth = () => request<ApiHealth>("/health");
export const getFarmContext = () => request<FarmContext>("/farm-context");
export const saveFarmContext = (context: FarmContext) => request<FarmContext>("/farm-context", { method: "PUT", body: JSON.stringify(context) });
export function analyzeBatch(feedType: FeedType, scenario: ScenarioId, context?: FarmContext): Promise<BatchAnalyzeResponse> {
  return request<BatchAnalyzeResponse>("/analyze-batch", { method: "POST", body: JSON.stringify({ feed_type: feedType, scenario, farm_profile: context?.farm_profile, feed_basket: context?.feed_basket }) });
}
export const verifyBatchIntegrity = (batchId: string) => request<{ batch_id: string; integrity_valid: boolean; algorithm: string; scope: string }>("/batches/" + encodeURIComponent(batchId) + "/verify-integrity", { method: "POST" });
export const getBatchImages = (batchId: string) => request<BatchImage[]>("/batches/" + encodeURIComponent(batchId) + "/images");
export async function uploadBatchImage(batchId: string, file: File): Promise<BatchImage> {
  const form = new FormData();
  form.append("image", file);
  const response = await fetch(API_BASE_URL + "/batches/" + encodeURIComponent(batchId) + "/images", { method: "POST", body: form, cache: "no-store" });
  if (!response.ok) {
    let detail = "Photo upload failed (" + response.status + ")";
    try { const body = await response.json(); if (body.detail) detail = body.detail; } catch { /* Keep HTTP status. */ }
    throw new Error(detail);
  }
  return response.json() as Promise<BatchImage>;
}
