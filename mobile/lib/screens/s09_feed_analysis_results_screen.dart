import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../config/theme.dart';

class S09FeedAnalysisResultsScreen extends StatelessWidget {
  final Map<String, dynamic>? scanResult;
  const S09FeedAnalysisResultsScreen({Key? key, this.scanResult})
    : super(key: key);
  double _number(String key) => (scanResult?[key] as num?)?.toDouble() ?? 0;
  @override
  Widget build(BuildContext context) {
    final result = scanResult;
    final status = result?['trust_status']?.toString() ?? 'NO ANALYSIS RESULT';
    final withheld = result?['withhold_values'] == true;
    final color = status == 'TRUSTED'
        ? Colors.green
        : status == 'RETEST RECOMMENDED'
        ? Colors.orange
        : Colors.red;
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Analysis Results',
          style: GoogleFonts.outfit(
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: AppTheme.primaryColor,
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      backgroundColor: AppTheme.backgroundColor,
      body: result == null
          ? const Center(
              child: Text(
                'No backend analysis was received. Start a feed test to continue.',
              ),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.08),
                      border: Border.all(color: color.withOpacity(0.5)),
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          status,
                          style: TextStyle(
                            color: color,
                            fontWeight: FontWeight.w900,
                            fontSize: 20,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text('Batch ' + (result['batch_id']?.toString() ?? '')),
                        const SizedBox(height: 8),
                        Text(
                          result['recommendation']?.toString() ?? '',
                          style: const TextStyle(fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  if (result['photo_attached'] == true)
                    const Padding(
                      padding: EdgeInsets.only(bottom: 12),
                      child: Text(
                        'Photo saved with this batch for human review. It was not analyzed by AI.',
                        style: TextStyle(fontSize: 12, color: Colors.green),
                      ),
                    ),
                  if (result['photo_error'] != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Text(
                        'Analysis completed, but the photo could not be attached: ' +
                            result['photo_error'].toString(),
                        style: const TextStyle(fontSize: 12, color: Colors.red),
                      ),
                    ),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(13),
                    decoration: BoxDecoration(
                      color: Colors.amber.shade50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.amber.shade200),
                    ),
                    child: Text(
                      'DEMO ONLY · ' +
                          (result['data_badge']?.toString() ??
                              'Simulated scenario data') +
                          ' · no physical analyzer, trained nutrient model, or image model is connected.',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'Nutritional screening values',
                    style: GoogleFonts.outfit(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.primaryColor,
                    ),
                  ),
                  const SizedBox(height: 10),
                  if (withheld)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.red.shade50,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Text(
                        'Quantitative values are withheld because this scenario is flagged. Obtain suitable additional evidence or laboratory confirmation before using this feed decision.',
                        style: TextStyle(fontSize: 13, color: Colors.red),
                      ),
                    ),
                  if (!withheld)
                    GridView.count(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisCount: 2,
                      mainAxisSpacing: 10,
                      crossAxisSpacing: 10,
                      childAspectRatio: 1.5,
                      children: [
                        _metric(
                          'Crude Protein · % DM',
                          _number('crude_protein'),
                        ),
                        _metric('Dry Matter', _number('dry_matter')),
                        _metric('NDF Fiber', _number('ndf')),
                        _metric('ADF Fiber', _number('adf')),
                      ],
                    ),
                  if (result['screening_summary'] != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 16),
                      child: Text(
                        'Scenario screening note: ' +
                            result['screening_summary'].toString(),
                        style: const TextStyle(fontSize: 12),
                      ),
                    ),
                  if (result['evidence_score'] != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 10),
                      child: Text(
                        'Heuristic demo score: ' +
                            result['evidence_score'].toString() +
                            '/100 · not a probability or validated accuracy.',
                        style: const TextStyle(
                          fontSize: 11,
                          color: Colors.black54,
                        ),
                      ),
                    ),
                  if (result['advisories'] is List &&
                      (result['advisories'] as List).isNotEmpty) ...[
                    const SizedBox(height: 18),
                    Text(
                      'Backend advisories',
                      style: GoogleFonts.outfit(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primaryColor,
                      ),
                    ),
                    const SizedBox(height: 8),
                    for (final advisory in result['advisories'] as List)
                      Container(
                        width: double.infinity,
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.borderLight),
                        ),
                        child: Text(
                          advisory.toString(),
                          style: const TextStyle(fontSize: 13),
                        ),
                      ),
                  ],
                  const SizedBox(height: 12),
                  const Text(
                    'This mobile prototype currently displays analysis and advisories returned by the API. Ration editing, passport history, and live storage telemetry are available in the web dashboard only.',
                    style: TextStyle(fontSize: 11, color: Colors.black54),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _metric(String label, double value) => Container(
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(14),
      border: Border.all(color: AppTheme.borderLight),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
        ),
        const SizedBox(height: 8),
        Text(
          value.toStringAsFixed(1) + '%',
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: AppTheme.primaryDark,
          ),
        ),
      ],
    ),
  );
}
