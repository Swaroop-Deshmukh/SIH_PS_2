const API_BASE_URL = "http://localhost:8000/api";

export interface BatchAnalyzeResponse {
  batch_id: string;
  feed_type: string;
  scenario: string;
  nir_data: {
    wavelengths: number[];
    points: Array<{ point_id: string; reflectance: number[] }>;
    scenario: string;
  };
  cv_screening: {
    visual_anomaly_detected: boolean;
    anomaly_score: number;
    mould_risk_level: string;
    mould_coverage_pct: number;
    foreign_material_detected: boolean;
    texture_uniformity: number;
    color_consistency_score: number;
    screening_summary: string;
  };
  storage_telemetry: {
    ph: number;
    temperature_celsius: number;
    humidity_pct: number;
    moisture_pct: number;
    exposure_days: number;
    spoilage_risk_index: number;
    status: string;
    telemetry_badge: string;
  };
  evidence: {
    evidence_score: number;
    evidence_level: string;
    trust_status: string;
    metrics: {
      spectral_quality: number;
      sample_consistency: number;
      calibration_fit: number;
      prediction_uncertainty: number;
      visual_agreement: number;
      ood_distance: number;
    };
    untrusted_reasons: string[];
    recommendation: string;
  };
  nutritional_analysis: {
    dry_matter_pct: number;
    moisture_pct: number;
    crude_protein_pct: number;
    ndf_pct: number;
    adf_pct: number;
    is_simulated_data: boolean;
    data_badge: string;
  };
  dairy_ration: {
    herd_summary: {
      lactating_animals: number;
      dry_animals: number;
      total_herd: number;
    };
    ration_analysis: {
      tested_feed_cp_pct: number;
      basket_weighted_cp_pct: number;
      target_cp_pct: number;
      cp_gap_pct: number;
      cp_status: string;
      fiber_status: string;
    };
    dairy_interpretation: string;
  };
  advisories: Array<{
    id: string;
    severity: string;
    category: string;
    title: string;
    message: string;
    verification_required: boolean;
  }>;
  digital_twin: {
    batch_id: string;
    feed_type: string;
    scenario: string;
    integrity_hash: string;
    created_at: string;
    timeline: Array<{
      step: string;
      title: string;
      timestamp: string;
      status: string;
      detail: string;
    }>;
    passport: {
      title: string;
      passport_id: string;
      issued_at: string;
      model_version: string;
      verification_status: string;
      verification_badge: string;
    };
  };
}

export async function analyzeBatch(feedType: string = "Maize Silage", scenario: string = "healthy"): Promise<BatchAnalyzeResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/analyze-batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batch_id: `FS-2026-${Math.floor(1000 + Math.random() * 9000)}`, feed_type: feedType, scenario }),
    });

    if (!res.ok) throw new Error("Backend request failed");
    return await res.json();
  } catch (err) {
    console.warn("Backend offline or unreachable. Falling back to local offline simulator.", err);
    return getOfflineFallbackAnalysis(feedType, scenario);
  }
}

function getOfflineFallbackAnalysis(feedType: string, scenario: string): BatchAnalyzeResponse {
  const isHealthy = scenario === "healthy";
  const isOod = scenario === "ood";
  const isHet = scenario === "heterogeneous";
  const isAdult = scenario === "adulteration";
  const isStorage = scenario === "storage_warning";

  const wavelengths = Array.from({ length: 21 }, (_, i) => 800 + i * 10);
  const points = [1, 2, 3, 4, 5].map((id) => ({
    point_id: `Sampling Point ${id}`,
    reflectance: wavelengths.map((w) => Number((0.4 + Math.sin(w / 100) * 0.1 + (isHet ? (id - 3) * 0.05 : 0)).toFixed(4))),
  }));

  const trust_status = isHealthy
    ? "TRUSTED"
    : isOod
    ? "RESULT NOT TRUSTED"
    : isHet
    ? "RETEST RECOMMENDED"
    : isAdult
    ? "SUSPECTED ADULTERATION"
    : "TRUSTED WITH STORAGE WARNING";

  const evidence_score = isHealthy ? 92.5 : isOod ? 34.0 : isHet ? 64.5 : isAdult ? 58.0 : 88.0;

  return {
    batch_id: "FS-2026-0104",
    feed_type: feedType,
    scenario,
    nir_data: { wavelengths, points, scenario },
    cv_screening: {
      visual_anomaly_detected: !isHealthy,
      anomaly_score: isHealthy ? 4.0 : isAdult ? 84.0 : 65.0,
      mould_risk_level: isStorage ? "HIGH" : "LOW",
      mould_coverage_pct: isStorage ? 12.4 : 0.2,
      foreign_material_detected: isAdult || isOod,
      texture_uniformity: isHealthy ? 95 : 60,
      color_consistency_score: isHealthy ? 96 : 58,
      screening_summary: isHealthy
        ? "Visually uniform sample."
        : isOod
        ? "Calibration mismatch."
        : isAdult
        ? "Suspected Urea particulate residue."
        : "Storage deterioration patches.",
    },
    storage_telemetry: {
      ph: isStorage ? 4.8 : isAdult ? 6.8 : 4.0,
      temperature_celsius: isStorage ? 33.4 : 24.5,
      humidity_pct: isStorage ? 79.2 : 62.0,
      moisture_pct: isStorage ? 68.5 : 63.5,
      exposure_days: isStorage ? 21 : 14,
      spoilage_risk_index: isStorage ? 76 : 12,
      status: isStorage ? "CRITICAL_WARNING" : "STABLE",
      telemetry_badge: "SIMULATED STORAGE TELEMETRY",
    },
    evidence: {
      evidence_score,
      evidence_level: isHealthy ? "HIGH" : isOod ? "LOW" : "MEDIUM",
      trust_status,
      metrics: {
        spectral_quality: isHealthy ? 96.0 : 74.0,
        sample_consistency: isHet ? 54.0 : 94.0,
        calibration_fit: isOod ? 38.0 : 95.0,
        prediction_uncertainty: isOod ? 85.0 : 12.0,
        visual_agreement: isHealthy ? 95.0 : 50.0,
        ood_distance: isOod ? 4.85 : 0.85,
      },
      untrusted_reasons: isHealthy ? [] : ["Sample differs from validated calibration domain.", "Prediction uncertainty exceeds limits."],
      recommendation: isHealthy ? "Safe for daily feeding." : "Request confirmatory laboratory test.",
    },
    nutritional_analysis: {
      dry_matter_pct: 34.5,
      moisture_pct: 65.5,
      crude_protein_pct: isAdult ? 24.8 : 8.8,
      ndf_pct: 46.2,
      adf_pct: 26.1,
      is_simulated_data: true,
      data_badge: "SIMULATED PROTOTYPE DATA",
    },
    dairy_ration: {
      herd_summary: { lactating_animals: 17, dry_animals: 7, total_herd: 24 },
      ration_analysis: {
        tested_feed_cp_pct: isAdult ? 24.8 : 8.8,
        basket_weighted_cp_pct: 11.2,
        target_cp_pct: 13.5,
        cp_gap_pct: 2.3,
        cp_status: "DEFICIENT",
        fiber_status: "OPTIMAL",
      },
      dairy_interpretation: "Current ration crude protein contribution is 11.2% vs target of 13.5%. Supplement groundnut cake.",
    },
    advisories: [
      {
        id: "ADV-001",
        severity: isHealthy ? "INFO" : "HIGH",
        category: "Feed Safety",
        title: trust_status,
        message: isHealthy ? "Feed parameters within range." : "Review evidence panel and re-test.",
        verification_required: !isHealthy,
      },
    ],
    digital_twin: {
      batch_id: "FS-2026-0104",
      feed_type: feedType,
      scenario,
      integrity_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      created_at: new Date().toISOString(),
      timeline: [
        { step: "TEST", title: "Representative Sampling & Scan", timestamp: "Today", status: "COMPLETED", detail: "5-point NIR scan completed." },
        { step: "STORE", title: "Storage Pit Allocation", timestamp: "Today", status: "COMPLETED", detail: "Assigned to Trench Silo 2." },
        { step: "MONITOR", title: "Telemetry Monitoring", timestamp: "Active", status: "ACTIVE", detail: "pH and Temperature tracking active." },
        { step: "RETEST", title: "Scheduled Adaptive Retest", timestamp: "In 14 days", status: "SCHEDULED", detail: "Routine check." },
        { step: "USE", title: "Dairy Ration Feeding", timestamp: "Pending", status: "APPROVED", detail: "Approved for feeding." },
      ],
      passport: {
        title: "FEEDSURE QUALITY PASSPORT",
        passport_id: "PASSPORT-FS-2026-0104",
        issued_at: new Date().toISOString(),
        model_version: "FeedSure-v2026.1-CALIB_V4",
        verification_status: "INTEGRITY VERIFIED",
        verification_badge: "SHA-256 SECURED",
      },
    },
  };
}
