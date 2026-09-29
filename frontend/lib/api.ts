export type FeedType = "Maize Silage" | "Green Fodder" | "Dry Fodder" | "Concentrate";
export type ScenarioId = "healthy" | "heterogeneous" | "ood" | "storage_warning" | "adulteration";
export interface BasketItem { name: string; quantity_kg: number; cp_pct: number; dm_pct: number; data_source: string; }
export interface FarmProfile {
  farm_name: string; location: string; lactating_animals: number; dry_animals: number;
  daily_milk_yield_liters: number; ration_group: "lactating" | "dry"; lactation_stage?: string; data_source: string;
}
export interface FarmContext { farm_profile: FarmProfile; feed_basket: BasketItem[]; updated_at?: string; }
export interface SilageTelemetryReading {
  hour_offset: number;
  timestamp: string;
  core_temp_c: number;
  ambient_temp_c: number;
  temp_delta_c: number;
  ph: number;
  humidity_pct: number;
  moisture_pct: number;
  feed_mass_kg: number;
  dT_dt: number;
  cumulative_heat_units: number;
  status: string;
}

export interface FliegAcidProfile {
  lactic_acid_pct: number;
  acetic_acid_pct: number;
  butyric_acid_pct: number;
  lactic_to_acetic_ratio: number;
  ideal_ratio_benchmark: string;
}

export interface AcidInsolubleAshResult {
  estimated_aia_pct: number;
  baseline_tilt_delta_r: number;
  baseline_mean_r: number;
  risk_level: "LOW_CLEAN" | "MODERATE_DUST" | "HIGH_SILICA_RISK" | string;
  risk_label: string;
  badge_color: "EMERALD" | "AMBER" | "RED" | string;
  advisory: string;
}

export interface MineralBalanceResult {
  estimated_ca_pct: number;
  estimated_p_pct: number;
  ca_to_p_ratio: number;
  status: "OPTIMAL" | "ACCEPTABLE" | "INVERTED_DEFICIENT_CALCIUM" | "HIGH_CALCIUM_IMBALANCE" | string;
  status_label: string;
  badge_color: "EMERALD" | "BLUE" | "AMBER" | "RED" | string;
  ideal_range: string;
  advisory: string;
}

export interface RationAllocationItem {
  name: string;
  price_per_kg_inr: number;
  optimal_as_fed_kg: number;
  optimal_dm_kg: number;
  optimal_daily_cost_inr: number;
  current_as_fed_kg: number;
  current_daily_cost_inr: number;
  pct_of_dmi: number;
  is_forage: boolean;
  cp_pct: number;
  dm_pct: number;
  ndf_pct: number;
}

export interface RationOptimizerResult {
  status: "OPTIMAL_FEASIBLE" | "RELAXED_FEASIBLE" | "INFEASIBLE" | string;
  solver: string;
  herd_context: {
    lactation_stage: string;
    animal_count: number;
    daily_milk_yield_liters: number;
    target_dmi_kg: number;
    target_cp_pct: number;
    target_cp_kg: number;
    target_ndf_min_pct: number;
    target_ndf_max_pct: number;
  };
  cost_summary: {
    current_cost_per_cow_day_inr: number;
    optimal_cost_per_cow_day_inr: number;
    daily_saving_per_cow_inr: number;
    daily_herd_saving_inr: number;
    monthly_herd_saving_inr: number;
    savings_pct: number;
  };
  nutrition_balance: {
    current_dmi_kg: number;
    optimal_dmi_kg: number;
    current_cp_pct: number;
    optimal_cp_pct: number;
    optimal_cp_kg: number;
    current_ndf_pct: number;
    optimal_ndf_pct: number;
    forage_to_concentrate_ratio: string;
    rumen_acidosis_risk: string;
  };
  allocation_table: RationAllocationItem[];
  advisory: string;
}

export interface RationOptimizeRequest {
  farm_profile?: Partial<FarmProfile>;
  feed_basket?: BasketItem[];
  price_overrides?: Record<string, number>;
  allow_catalog_expansion?: boolean;
}

export interface FliegEvaluation {
  flieg_score: number;
  grade: string;
  grade_label: string;
  badge_color: string;
  description: string;
  ph_evaluated: number;
  dry_matter_pct: number;
  acid_profile: FliegAcidProfile;
}

export interface StorageTelemetry {
  ph: number;
  temperature_celsius: number;
  ambient_temp_c?: number;
  temp_differential_c?: number;
  humidity_pct: number;
  moisture_pct: number;
  feed_mass_kg?: number;
  exposure_days: number;
  spoilage_risk_index: number;
  status: string;
  status_color?: string;
  status_label?: string;
  telemetry_badge: string;
  dT_dt?: number;
  max_dT_dt?: number;
  delta_t_24h?: number;
  aerobic_heating_detected?: boolean;
  flieg_evaluation?: FliegEvaluation;
  cumulative_heat_units?: number;
  shelf_life_hours_remaining?: number;
  advisory_message?: string;
  recommended_action?: string;
  recent_time_series?: SilageTelemetryReading[];
}

export interface LifecycleEvent {
  event_id: string;
  batch_id: string;
  block_index: number;
  timestamp: string;
  state: string;
  action: string;
  actor: string;
  payload: Record<string, any>;
  previous_hash: string;
  block_hash: string;
  detail?: string;
}

export interface SpatialGridCell {
  row: number;
  col: number;
  position_name: string;
  label: string;
  is_sampled: boolean;
  point_id: string | null;
  dry_matter_pct: number | null;
  moisture_pct: number | null;
  crude_protein_pct: number | null;
  ndf_pct: number | null;
  adf_pct: number | null;
  mahalanobis_distance: number | null;
  is_anomalous: boolean;
  is_ood: boolean;
  status: string;
  reflectance: number[];
}

export interface SpatialMetrics {
  sample_points_count: number;
  spectral_cv_pct: number;
  moisture_cv_pct: number;
  crude_protein_cv_pct: number;
  max_cv_pct: number;
  cv_threshold_pct: number;
  is_heterogeneous: boolean;
  heterogeneity_verdict: string;
  anomalous_point_id: string | null;
  anomalous_location: string | null;
  mean_reflectance: number;
  reflectance_std: number;
}

export interface AdaptiveEscalation {
  escalation_code: string;
  urgency: string;
  badge_color: string;
  title: string;
  reason: string;
  recommended_action: string;
  target_point: string | null;
  suggested_tool: string;
  action_steps: string[];
}

export interface SpatialNutritionMap {
  grid_3x3: SpatialGridCell[];
  spatial_metrics: SpatialMetrics;
  adaptive_escalation: AdaptiveEscalation;
}

export interface BatchAnalyzeResponse {
  batch_id: string; feed_type: string; scenario: string;
  nir_data: { wavelengths: number[]; points: Array<{ point_id: string; reflectance: number[] }>; scenario: string };
  cv_screening: { visual_anomaly_detected: boolean; anomaly_score: number; mould_risk_level: string; mould_coverage_pct: number; foreign_material_detected: boolean; texture_uniformity: number; color_consistency_score: number; screening_summary: string };
  storage_telemetry: StorageTelemetry;
  spatial_sampling?: SpatialNutritionMap;
  evidence: { evidence_score: number; evidence_level: string; trust_status: string; metrics: { spectral_quality: number; sample_consistency: number; calibration_fit: number; prediction_uncertainty: number; visual_agreement: number; ood_distance: number }; untrusted_reasons: string[]; recommendation: string };
  nutritional_analysis: {
    dry_matter_pct: number;
    moisture_pct: number;
    crude_protein_pct: number;
    ndf_pct: number;
    adf_pct: number;
    is_simulated_data: boolean;
    data_badge: string;
    mahalanobis_distance?: number;
    is_ood?: boolean;
    domain_status?: string;
    calibration_fit_pct?: number;
    uncertainty_sigma?: Record<string, number>;
    confidence_intervals?: Record<string, [number, number]>;
    spatial_metrics?: {
      sample_points_count: number;
      spectral_cv_pct: number;
      is_heterogeneous: boolean;
      anomalous_point_id?: string;
      cv_threshold_pct: number;
    };
    point_predictions?: Array<{
      point_id: string;
      dry_matter_pct: number;
      crude_protein_pct: number;
      ndf_pct: number;
      adf_pct: number;
      moisture_pct: number;
      mahalanobis_distance: number;
      is_ood: boolean;
      domain_status: string;
    }>;
    preprocessing?: {
      raw: number[];
      snv: number[];
      savgol_1st_derivative: number[];
      savgol_2nd_derivative: number[];
      detrended: number[];
      recommended_processed: number[];
      pipeline_signature: string;
    };
    sand_silica_screening?: AcidInsolubleAshResult;
    mineral_balance?: MineralBalanceResult;
  };
  dairy_ration: {
    herd_summary: { lactating_animals: number; dry_animals: number; total_herd: number };
    ration_analysis: {
      tested_feed_cp_pct: number;
      basket_weighted_cp_pct: number;
      target_cp_pct: number;
      cp_gap_pct: number;
      cp_status: string;
      fiber_status: string;
      ration_group?: string;
      basis?: string;
      stage_name?: string;
      required_dm_total_kg?: number;
      required_dmi_per_animal_kg?: number;
      available_dm_total_kg?: number;
    };
    dairy_interpretation: string;
  };
  ration_optimizer?: RationOptimizerResult;
  advisories: Array<{ id: string; severity: string; category: string; title: string; message: string; verification_required: boolean }>;
  digital_twin: {
    batch_id: string;
    feed_type: string;
    scenario: string;
    current_state?: string;
    integrity_hash: string;
    created_at: string;
    timeline: Array<{ step: string; title: string; timestamp: string; status: string; detail: string }>;
    lifecycle_events?: LifecycleEvent[];
    passport: {
      title: string;
      passport_id: string;
      issued_at: string;
      device_node?: string;
      model_version: string;
      current_lifecycle_state?: string;
      genesis_hash?: string;
      chain_tip_hash?: string;
      total_lifecycle_blocks?: number;
      standards_compliance?: string[];
      verification_status: string;
      verification_badge: string;
    };
  };
  farm_profile: FarmProfile; feed_basket: BasketItem[];
  data_provenance: { mode: string; measurement_source: string; nutrition_source: string; vision_source: string; evidence_source: string; storage_source: string; record_created_at: string };
}
export interface FeedVisionAnalysis {
  analysis_type: string;
  feed_type_evaluated?: string;
  image_quality?: {
    verdict: string;
    is_acceptable: boolean;
    sharpness_score: number;
    mean_brightness: number;
    quality_issues: string[];
  };
  visual_anomaly_detected?: boolean;
  anomaly_score?: number;
  mould_risk_level?: string;
  mould_coverage_pct?: number;
  foreign_material_detected?: boolean;
  texture_uniformity?: number;
  color_consistency_score?: number;
  color_distribution?: {
    green_foliage_pct: number;
    golden_cured_pct: number;
    dark_spoilage_pct: number;
    pale_mould_like_pct: number;
  };
  screening_summary?: string;
  scientific_boundary_notice?: string;
}

export interface UreaStripAnalysis {
  analysis_type: string;
  strip_status: string;
  risk_level: string;
  estimated_urea_equivalent: string;
  confidence: string;
  colorimetric_data: {
    pad_hex_color: string;
    rgb: number[];
    hsv: { hue_deg: number; saturation: number; value: number };
    cielab: { L: number; a: number; b: number };
  };
  advisory: string;
  scientific_boundary_notice: string;
}

export interface ApiHealth { status: string; system: string; storage: string; data_mode: string; version: string; }
export interface BatchImage {
  attachment_id: string;
  batch_id: string;
  original_name: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
  url?: string;
  image_analysis?: FeedVisionAnalysis | any;
  analysis?: FeedVisionAnalysis | any;
  message?: string;
}
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

export async function analyzeFeedPhoto(file: File, feedType: string = "Maize Silage"): Promise<FeedVisionAnalysis> {
  const form = new FormData();
  form.append("image", file);
  const response = await fetch(`${API_BASE_URL}/vision/feed-surface?feed_type=${encodeURIComponent(feedType)}`, {
    method: "POST",
    body: form,
    cache: "no-store",
  });
  if (!response.ok) {
    let detail = "Visual analysis failed (" + response.status + ")";
    try { const body = await response.json(); if (body.detail) detail = body.detail; } catch {}
    throw new Error(detail);
  }
  return response.json() as Promise<FeedVisionAnalysis>;
}

export async function analyzeUreaStripPhoto(file: File): Promise<UreaStripAnalysis> {
  const form = new FormData();
  form.append("image", file);
  const response = await fetch(`${API_BASE_URL}/vision/urea-strip`, {
    method: "POST",
    body: form,
    cache: "no-store",
  });
  if (!response.ok) {
    let detail = "Urea strip test failed (" + response.status + ")";
    try { const body = await response.json(); if (body.detail) detail = body.detail; } catch {}
    throw new Error(detail);
  }
  return response.json() as Promise<UreaStripAnalysis>;
}

export const getChemometricsMetrics = () => request<any>("/chemometrics/models/metrics");
export const preprocessSpectrum = (spectrum: number[]) =>
  request<any>("/chemometrics/preprocess", {
    method: "POST",
    body: JSON.stringify({ spectrum }),
  });

// Phase 5: Silage Longitudinal Telemetry & Digital Twin State Machine
export interface SilageTelemetryResponse {
  batch_id: string;
  total_readings: number;
  summary: StorageTelemetry;
  time_series: SilageTelemetryReading[];
  telemetry_badge: string;
}

export const getSilageTelemetry = (batchId: string) =>
  request<SilageTelemetryResponse>(`/silage/telemetry/${encodeURIComponent(batchId)}`);

export const simulateSilageHour = (
  batchId: string,
  triggerBreach: boolean = false,
  customTempDelta?: number
) =>
  request<{
    batch_id: string;
    new_reading: SilageTelemetryReading;
    summary: StorageTelemetry;
    recent_time_series: SilageTelemetryReading[];
    auto_transitioned: boolean;
    transition_message?: string;
  }>(`/silage/telemetry/${encodeURIComponent(batchId)}/simulate-hour`, {
    method: "POST",
    body: JSON.stringify({ trigger_breach: triggerBreach, custom_temp_delta: customTempDelta }),
  });

export const resetSilageTelemetry = (batchId: string, scenario: string = "healthy") =>
  request<{
    batch_id: string;
    message: string;
    summary: StorageTelemetry;
    recent_time_series: SilageTelemetryReading[];
  }>(`/silage/telemetry/${encodeURIComponent(batchId)}/reset?scenario=${encodeURIComponent(scenario)}`, {
    method: "POST",
  });

export interface DigitalTwinLedgerResponse {
  batch_id: string;
  verification: {
    is_valid: boolean;
    total_blocks: number;
    genesis_hash?: string;
    latest_block_hash?: string;
    chain_algorithm?: string;
    verified_at?: string;
    error?: string;
    broken_at_block?: number;
  };
  events: LifecycleEvent[];
  available_states: string[];
}

export const getDigitalTwinLedger = (batchId: string) =>
  request<DigitalTwinLedgerResponse>(`/digital-twin/${encodeURIComponent(batchId)}/ledger`);

export const transitionDigitalTwin = (
  batchId: string,
  targetState: string,
  action: string = "MANUAL_STATUS_ADVANCEMENT",
  actor: string = "FARM_MANAGER",
  notes?: string
) =>
  request<{
    batch_id: string;
    current_state: string;
    transitioned_event: LifecycleEvent;
    chain_verification: any;
    message: string;
  }>(`/digital-twin/${encodeURIComponent(batchId)}/transition`, {
    method: "POST",
    body: JSON.stringify({ target_state: targetState, action, actor, notes }),
  });

export const getDigitalTwinPassport = (batchId: string) =>
  request<any>(`/digital-twin/${encodeURIComponent(batchId)}/passport`);

export const getSpatialNutritionMap = (payload: {
  nir_data: any;
  nutrition_data: any;
  cv_data?: any;
  storage_data?: any;
  scenario?: string;
}) =>
  request<SpatialNutritionMap>("/sampling/spatial-map", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getFliegIndex = (ph: number, dryMatterPct: number) =>
  request<FliegEvaluation>("/silage/flieg-index", {
    method: "POST",
    body: JSON.stringify({ ph, dry_matter_pct: dryMatterPct }),
  });

export const optimizeRation = (req: RationOptimizeRequest) =>
  request<RationOptimizerResult>("/dairy/optimize-ration", {
    method: "POST",
    body: JSON.stringify(req),
  });



