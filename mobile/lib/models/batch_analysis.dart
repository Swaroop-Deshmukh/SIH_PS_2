class BatchAnalysisResponse {
  final String batchId;
  final String feedType;
  final String scenario;
  final NirData nirData;
  final CvScreening cvScreening;
  final StorageTelemetry storageTelemetry;
  final EvidenceResult evidence;
  final NutritionalAnalysis nutritionalAnalysis;
  final DairyRation dairyRation;
  final List<AdvisoryItem> advisories;
  final DigitalTwinData digitalTwin;

  BatchAnalysisResponse({
    required this.batchId,
    required this.feedType,
    required this.scenario,
    required this.nirData,
    required this.cvScreening,
    required this.storageTelemetry,
    required this.evidence,
    required this.nutritionalAnalysis,
    required this.dairyRation,
    required this.advisories,
    required this.digitalTwin,
  });

  factory BatchAnalysisResponse.fromJson(Map<String, dynamic> json) {
    return BatchAnalysisResponse(
      batchId: json['batch_id'] ?? 'FS-2026-0104',
      feedType: json['feed_type'] ?? 'Maize Silage',
      scenario: json['scenario'] ?? 'healthy',
      nirData: NirData.fromJson(json['nir_data'] ?? {}),
      cvScreening: CvScreening.fromJson(json['cv_screening'] ?? {}),
      storageTelemetry: StorageTelemetry.fromJson(json['storage_telemetry'] ?? {}),
      evidence: EvidenceResult.fromJson(json['evidence'] ?? {}),
      nutritionalAnalysis: NutritionalAnalysis.fromJson(json['nutritional_analysis'] ?? {}),
      dairyRation: DairyRation.fromJson(json['dairy_ration'] ?? {}),
      advisories: (json['advisories'] as List? ?? [])
          .map((item) => AdvisoryItem.fromJson(item))
          .toList(),
      digitalTwin: DigitalTwinData.fromJson(json['digital_twin'] ?? {}),
    );
  }
}

class NirData {
  final List<int> wavelengths;
  final List<SamplingPoint> points;
  final String scenario;

  NirData({required this.wavelengths, required this.points, required this.scenario});

  factory NirData.fromJson(Map<String, dynamic> json) {
    return NirData(
      wavelengths: (json['wavelengths'] as List? ?? []).map((e) => e as int).toList(),
      points: (json['points'] as List? ?? []).map((e) => SamplingPoint.fromJson(e)).toList(),
      scenario: json['scenario'] ?? 'healthy',
    );
  }
}

class SamplingPoint {
  final String pointId;
  final List<double> reflectance;

  SamplingPoint({required this.pointId, required this.reflectance});

  factory SamplingPoint.fromJson(Map<String, dynamic> json) {
    return SamplingPoint(
      pointId: json['point_id'] ?? 'Point',
      reflectance: (json['reflectance'] as List? ?? []).map((e) => (e as num).toDouble()).toList(),
    );
  }
}

class CvScreening {
  final bool visualAnomalyDetected;
  final double anomalyScore;
  final String mouldRiskLevel;
  final double mouldCoveragePct;
  final bool foreignMaterialDetected;
  final double textureUniformity;
  final double colorConsistencyScore;
  final String screeningSummary;

  CvScreening({
    required this.visualAnomalyDetected,
    required this.anomalyScore,
    required this.mouldRiskLevel,
    required this.mouldCoveragePct,
    required this.foreignMaterialDetected,
    required this.textureUniformity,
    required this.colorConsistencyScore,
    required this.screeningSummary,
  });

  factory CvScreening.fromJson(Map<String, dynamic> json) {
    return CvScreening(
      visualAnomalyDetected: json['visual_anomaly_detected'] ?? false,
      anomalyScore: (json['anomaly_score'] ?? 0).toDouble(),
      mouldRiskLevel: json['mould_risk_level'] ?? 'LOW',
      mouldCoveragePct: (json['mould_coverage_pct'] ?? 0).toDouble(),
      foreignMaterialDetected: json['foreign_material_detected'] ?? false,
      textureUniformity: (json['texture_uniformity'] ?? 95).toDouble(),
      colorConsistencyScore: (json['color_consistency_score'] ?? 95).toDouble(),
      screeningSummary: json['screening_summary'] ?? 'Visually uniform sample.',
    );
  }
}

class StorageTelemetry {
  final double ph;
  final double temperatureCelsius;
  final double humidityPct;
  final double moisturePct;
  final int exposureDays;
  final int spoilageRiskIndex;
  final String status;
  final String telemetryBadge;

  StorageTelemetry({
    required this.ph,
    required this.temperatureCelsius,
    required this.humidityPct,
    required this.moisturePct,
    required this.exposureDays,
    required this.spoilageRiskIndex,
    required this.status,
    required this.telemetryBadge,
  });

  factory StorageTelemetry.fromJson(Map<String, dynamic> json) {
    return StorageTelemetry(
      ph: (json['ph'] ?? 4.0).toDouble(),
      temperatureCelsius: (json['temperature_celsius'] ?? 24.5).toDouble(),
      humidityPct: (json['humidity_pct'] ?? 62.0).toDouble(),
      moisturePct: (json['moisture_pct'] ?? 63.5).toDouble(),
      exposureDays: json['exposure_days'] ?? 14,
      spoilageRiskIndex: json['spoilage_risk_index'] ?? 12,
      status: json['status'] ?? 'STABLE',
      telemetryBadge: json['telemetry_badge'] ?? 'SIMULATED STORAGE TELEMETRY',
    );
  }
}

class EvidenceResult {
  final double evidenceScore;
  final String evidenceLevel;
  final String trustStatus;
  final EvidenceMetrics metrics;
  final List<String> untrustedReasons;
  final String recommendation;

  EvidenceResult({
    required this.evidenceScore,
    required this.evidenceLevel,
    required this.trustStatus,
    required this.metrics,
    required this.untrustedReasons,
    required this.recommendation,
  });

  factory EvidenceResult.fromJson(Map<String, dynamic> json) {
    return EvidenceResult(
      evidenceScore: (json['evidence_score'] ?? 90).toDouble(),
      evidenceLevel: json['evidence_level'] ?? 'HIGH',
      trustStatus: json['trust_status'] ?? 'TRUSTED',
      metrics: EvidenceMetrics.fromJson(json['metrics'] ?? {}),
      untrustedReasons: (json['untrusted_reasons'] as List? ?? []).map((e) => e.toString()).toList(),
      recommendation: json['recommendation'] ?? 'Safe for daily feeding.',
    );
  }
}

class EvidenceMetrics {
  final double spectralQuality;
  final double sampleConsistency;
  final double calibrationFit;
  final double predictionUncertainty;
  final double visualAgreement;
  final double oodDistance;

  EvidenceMetrics({
    required this.spectralQuality,
    required this.sampleConsistency,
    required this.calibrationFit,
    required this.predictionUncertainty,
    required this.visualAgreement,
    required this.oodDistance,
  });

  factory EvidenceMetrics.fromJson(Map<String, dynamic> json) {
    return EvidenceMetrics(
      spectralQuality: (json['spectral_quality'] ?? 95).toDouble(),
      sampleConsistency: (json['sample_consistency'] ?? 94).toDouble(),
      calibrationFit: (json['calibration_fit'] ?? 95).toDouble(),
      predictionUncertainty: (json['prediction_uncertainty'] ?? 12).toDouble(),
      visualAgreement: (json['visual_agreement'] ?? 95).toDouble(),
      oodDistance: (json['ood_distance'] ?? 0.85).toDouble(),
    );
  }
}

class NutritionalAnalysis {
  final double dryMatterPct;
  final double moisturePct;
  final double crudeProteinPct;
  final double ndfPct;
  final double adfPct;
  final bool isSimulatedData;
  final String dataBadge;

  NutritionalAnalysis({
    required this.dryMatterPct,
    required this.moisturePct,
    required this.crudeProteinPct,
    required this.ndfPct,
    required this.adfPct,
    required this.isSimulatedData,
    required this.dataBadge,
  });

  factory NutritionalAnalysis.fromJson(Map<String, dynamic> json) {
    return NutritionalAnalysis(
      dryMatterPct: (json['dry_matter_pct'] ?? 34.5).toDouble(),
      moisturePct: (json['moisture_pct'] ?? 65.5).toDouble(),
      crudeProteinPct: (json['crude_protein_pct'] ?? 8.8).toDouble(),
      ndfPct: (json['ndf_pct'] ?? 46.2).toDouble(),
      adfPct: (json['adf_pct'] ?? 26.1).toDouble(),
      isSimulatedData: json['is_simulated_data'] ?? true,
      dataBadge: json['data_badge'] ?? 'SIMULATED PROTOTYPE DATA',
    );
  }
}

class DairyRation {
  final int lactatingAnimals;
  final int dryAnimals;
  final double basketWeightedCpPct;
  final double targetCpPct;
  final double cpGapPct;
  final String cpStatus;
  final String dairyInterpretation;

  DairyRation({
    required this.lactatingAnimals,
    required this.dryAnimals,
    required this.basketWeightedCpPct,
    required this.targetCpPct,
    required this.cpGapPct,
    required this.cpStatus,
    required this.dairyInterpretation,
  });

  factory DairyRation.fromJson(Map<String, dynamic> json) {
    final herd = json['herd_summary'] ?? {};
    final ration = json['ration_analysis'] ?? {};
    return DairyRation(
      lactatingAnimals: herd['lactating_animals'] ?? 17,
      dryAnimals: herd['dry_animals'] ?? 7,
      basketWeightedCpPct: (ration['basket_weighted_cp_pct'] ?? 11.2).toDouble(),
      targetCpPct: (ration['target_cp_pct'] ?? 13.5).toDouble(),
      cpGapPct: (ration['cp_gap_pct'] ?? 2.3).toDouble(),
      cpStatus: ration['cp_status'] ?? 'DEFICIENT',
      dairyInterpretation: json['dairy_interpretation'] ?? 'Ration crude protein is short by 2.3%. Supplement Groundnut Cake.',
    );
  }
}

class AdvisoryItem {
  final String id;
  final String severity;
  final String category;
  final String title;
  final String message;
  final bool verificationRequired;

  AdvisoryItem({
    required this.id,
    required this.severity,
    required this.category,
    required this.title,
    required this.message,
    required this.verificationRequired,
  });

  factory AdvisoryItem.fromJson(Map<String, dynamic> json) {
    return AdvisoryItem(
      id: json['id'] ?? 'ADV-000',
      severity: json['severity'] ?? 'INFO',
      category: json['category'] ?? 'General',
      title: json['title'] ?? 'Advisory',
      message: json['message'] ?? '',
      verificationRequired: json['verification_required'] ?? false,
    );
  }
}

class DigitalTwinData {
  final String batchId;
  final String integrityHash;
  final List<TimelineItem> timeline;
  final PassportData passport;

  DigitalTwinData({
    required this.batchId,
    required this.integrityHash,
    required this.timeline,
    required this.passport,
  });

  factory DigitalTwinData.fromJson(Map<String, dynamic> json) {
    return DigitalTwinData(
      batchId: json['batch_id'] ?? 'FS-2026-0104',
      integrityHash: json['integrity_hash'] ?? 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      timeline: (json['timeline'] as List? ?? []).map((e) => TimelineItem.fromJson(e)).toList(),
      passport: PassportData.fromJson(json['passport'] ?? {}),
    );
  }
}

class TimelineItem {
  final String step;
  final String title;
  final String timestamp;
  final String status;
  final String detail;

  TimelineItem({
    required this.step,
    required this.title,
    required this.timestamp,
    required this.status,
    required this.detail,
  });

  factory TimelineItem.fromJson(Map<String, dynamic> json) {
    return TimelineItem(
      step: json['step'] ?? 'TEST',
      title: json['title'] ?? 'Title',
      timestamp: json['timestamp'] ?? 'Today',
      status: json['status'] ?? 'COMPLETED',
      detail: json['detail'] ?? '',
    );
  }
}

class PassportData {
  final String title;
  final String passportId;
  final String issuedAt;
  final String modelVersion;
  final String verificationBadge;

  PassportData({
    required this.title,
    required this.passportId,
    required this.issuedAt,
    required this.modelVersion,
    required this.verificationBadge,
  });

  factory PassportData.fromJson(Map<String, dynamic> json) {
    return PassportData(
      title: json['title'] ?? 'FEEDSURE QUALITY PASSPORT',
      passportId: json['passport_id'] ?? 'PASSPORT-FS-2026-0104',
      issuedAt: json['issued_at'] ?? DateTime.now().toIso8601String(),
      modelVersion: json['model_version'] ?? 'FeedSure-v2026.1-CALIB_V4',
      verificationBadge: json['verification_badge'] ?? 'SHA-256 SECURED',
    );
  }
}
