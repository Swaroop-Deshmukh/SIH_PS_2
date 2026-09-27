import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/batch_analysis.dart';

class ApiService {
  // 10.0.2.2 is Android Emulator localhost, localhost works for web/desktop/physical USB debugging via adb reverse
  static const String baseUrl = 'http://localhost:8000/api';
  static const String androidBaseUrl = 'http://10.0.2.2:8000/api';

  static Future<BatchAnalysisResponse> analyzeBatch({
    String feedType = 'Maize Silage',
    String scenario = 'healthy',
  }) async {
    final payload = {
      'batch_id': 'FS-2026-${(1000 + (9000 * (DateTime.now().millisecond / 1000))).toInt()}',
      'feed_type': feedType,
      'scenario': scenario,
    };

    try {
      // Attempt localhost first
      var response = await http
          .post(
            Uri.parse('$baseUrl/analyze-batch'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(payload),
          )
          .timeout(const Duration(seconds: 3));

      if (response.statusCode == 200) {
        return BatchAnalysisResponse.fromJson(jsonDecode(response.body));
      }
    } catch (_) {
      try {
        // Fallback to Android emulator URL
        var response = await http
            .post(
              Uri.parse('$androidBaseUrl/analyze-batch'),
              headers: {'Content-Type': 'application/json'},
              body: jsonEncode(payload),
            )
            .timeout(const Duration(seconds: 3));

        if (response.statusCode == 200) {
          return BatchAnalysisResponse.fromJson(jsonDecode(response.body));
        }
      } catch (err) {
        // Offline Fallback
      }
    }

    // Offline / Local Simulation Fallback
    return getOfflineFallback(feedType, scenario);
  }

  static BatchAnalysisResponse getOfflineFallback(String feedType, String scenario) {
    final isHealthy = scenario == 'healthy';
    final isOod = scenario == 'ood';
    final isHet = scenario == 'heterogeneous';
    final isAdult = scenario == 'adulteration';
    final isStorage = scenario == 'storage_warning';

    final wavelengths = List.generate(21, (i) => 800 + i * 10);
    final points = List.generate(5, (id) {
      return SamplingPoint(
        pointId: 'Sampling Point ${id + 1}',
        reflectance: wavelengths.map((w) => (0.4 + (id * 0.02)).toDouble()).toList(),
      );
    });

    final trustStatus = isHealthy
        ? 'TRUSTED'
        : isOod
            ? 'RESULT NOT TRUSTED'
            : isHet
                ? 'RETEST RECOMMENDED'
                : isAdult
                    ? 'SUSPECTED ADULTERATION'
                    : 'STORAGE ALERT';

    final score = isHealthy ? 92.5 : isOod ? 34.0 : isHet ? 64.5 : isAdult ? 58.0 : 88.0;

    return BatchAnalysisResponse(
      batchId: 'FS-2026-0104',
      feedType: feedType,
      scenario: scenario,
      nirData: NirData(wavelengths: wavelengths, points: points, scenario: scenario),
      cvScreening: CvScreening(
        visualAnomalyDetected: !isHealthy,
        anomalyScore: isHealthy ? 4.0 : isAdult ? 84.0 : 65.0,
        mouldRiskLevel: isStorage ? 'HIGH' : 'LOW',
        mouldCoveragePct: isStorage ? 12.4 : 0.2,
        foreignMaterialDetected: isAdult || isOod,
        textureUniformity: isHealthy ? 95 : 60,
        colorConsistencyScore: isHealthy ? 96 : 58,
        screeningSummary: isHealthy
            ? 'Visually uniform sample core.'
            : isOod
                ? 'Calibration domain mismatch.'
                : isAdult
                    ? 'Suspected Urea particulate residue.'
                    : 'Storage deterioration patches indicated.',
      ),
      storageTelemetry: StorageTelemetry(
        ph: isStorage ? 4.8 : isAdult ? 6.8 : 4.0,
        temperatureCelsius: isStorage ? 33.4 : 24.5,
        humidityPct: isStorage ? 79.2 : 62.0,
        moisturePct: isStorage ? 68.5 : 63.5,
        exposureDays: isStorage ? 21 : 14,
        spoilageRiskIndex: isStorage ? 76 : 12,
        status: isStorage ? 'CRITICAL_WARNING' : 'STABLE',
        telemetryBadge: 'SIMULATED STORAGE TELEMETRY',
      ),
      evidence: EvidenceResult(
        evidenceScore: score,
        evidenceLevel: isHealthy ? 'HIGH' : isOod ? 'LOW' : 'MEDIUM',
        trustStatus: trustStatus,
        metrics: EvidenceMetrics(
          spectralQuality: isHealthy ? 96.0 : 74.0,
          sampleConsistency: isHet ? 54.0 : 94.0,
          calibrationFit: isOod ? 38.0 : 95.0,
          predictionUncertainty: isOod ? 85.0 : 12.0,
          visualAgreement: isHealthy ? 95.0 : 50.0,
          oodDistance: isOod ? 4.85 : 0.85,
        ),
        untrustedReasons: isHealthy
            ? []
            : [
                'Sample spectrum differs from validated calibration domain.',
                'Prediction uncertainty band exceeds safe limits (>80%).'
              ],
        recommendation: isHealthy
            ? 'Safe for daily lactating ration formulation.'
            : 'Collect fresh representative sample or request laboratory verification.',
      ),
      nutritionalAnalysis: NutritionalAnalysis(
        dryMatterPct: 34.5,
        moisturePct: 65.5,
        crudeProteinPct: isAdult ? 24.8 : 8.8,
        ndfPct: 46.2,
        adfPct: 26.1,
        isSimulatedData: true,
        dataBadge: 'SIMULATED PROTOTYPE DATA',
      ),
      dairyRation: DairyRation(
        lactatingAnimals: 17,
        dryAnimals: 7,
        basketWeightedCpPct: 11.2,
        targetCpPct: 13.5,
        cpGapPct: 2.3,
        cpStatus: 'DEFICIENT',
        dairyInterpretation:
            'Current ration crude protein contribution is 11.2% vs target of 13.5%. Supplement Groundnut Cake.',
      ),
      advisories: [
        AdvisoryItem(
          id: 'ADV-001',
          severity: isHealthy ? 'INFO' : 'HIGH',
          category: 'Feed Safety',
          title: trustStatus,
          message: isHealthy
              ? 'Feed parameters within safe operational limits.'
              : 'Review evidence breakdown and re-test sample.',
          verificationRequired: !isHealthy,
        )
      ],
      digitalTwin: DigitalTwinData(
        batchId: 'FS-2026-0104',
        integrityHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        timeline: [
          TimelineItem(
            step: 'TEST',
            title: 'Representative Sampling & Scan',
            timestamp: 'Today',
            status: 'COMPLETED',
            detail: '5-point NIR scan completed.',
          ),
          TimelineItem(
            step: 'STORE',
            title: 'Storage Trench Allocation',
            timestamp: 'Today',
            status: 'COMPLETED',
            detail: 'Assigned to Trench Silo 2.',
          ),
          TimelineItem(
            step: 'MONITOR',
            title: 'Telemetry Monitoring',
            timestamp: 'Active',
            status: 'ACTIVE',
            detail: 'pH and Temperature tracking active.',
          ),
          TimelineItem(
            step: 'RETEST',
            title: 'Scheduled Adaptive Retest',
            timestamp: 'In 14 days',
            status: 'SCHEDULED',
            detail: 'Routine re-test prior to ration transition.',
          ),
          TimelineItem(
            step: 'USE',
            title: 'Dairy Ration Feeding',
            timestamp: 'Pending',
            status: 'APPROVED',
            detail: 'Approved for Lactating Herd Feed Basket.',
          ),
        ],
        passport: PassportData(
          title: 'FEEDSURE QUALITY PASSPORT',
          passportId: 'PASSPORT-FS-2026-0104',
          issuedAt: DateTime.now().toIso8601String(),
          modelVersion: 'FeedSure-v2026.1-CALIB_V4',
          verificationBadge: 'SHA-256 SECURED',
        ),
      ),
    );
  }
}
