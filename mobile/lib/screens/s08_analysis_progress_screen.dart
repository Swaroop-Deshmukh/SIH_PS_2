import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 's09_feed_analysis_results_screen.dart';

class S08AnalysisProgressScreen extends StatefulWidget {
  final String feedType;
  final String scenario;
  final String? imagePath;
  const S08AnalysisProgressScreen({
    super.key,
    this.feedType = 'Maize Silage',
    this.scenario = 'healthy',
    this.imagePath,
  });
  @override
  State<S08AnalysisProgressScreen> createState() =>
      _S08AnalysisProgressScreenState();
}

class _S08AnalysisProgressScreenState extends State<S08AnalysisProgressScreen> {
  String? _error;
  bool _loading = false;
  @override
  void initState() {
    super.initState();
    _runAnalysis();
  }

  Future<void> _runAnalysis() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final result = await ApiService.analyzeBatch(
        feedType: widget.feedType,
        scenario: widget.scenario,
      );
      if (!mounted) return;
      var photoAttached = false;
      String? photoError;
      if (widget.imagePath != null) {
        try {
          await ApiService.attachBatchImage(
            batchId: result.batchId,
            imagePath: widget.imagePath!,
          );
          photoAttached = true;
        } catch (error) {
          photoError = error.toString().replaceFirst('Exception: ', '');
        }
      }
      if (!mounted) return;
      final withheld = [
        'RESULT NOT TRUSTED',
        'SUSPECTED ADULTERATION',
      ].contains(result.evidence.trustStatus);
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => S09FeedAnalysisResultsScreen(
            scanResult: {
              'batch_id': result.batchId,
              'feed_type': result.feedType,
              'crude_protein': result.nutritionalAnalysis.crudeProteinPct,
              'dry_matter': result.nutritionalAnalysis.dryMatterPct,
              'ndf': result.nutritionalAnalysis.ndfPct,
              'adf': result.nutritionalAnalysis.adfPct,
              'trust_status': result.evidence.trustStatus,
              'evidence_score': result.evidence.evidenceScore,
              'recommendation': result.evidence.recommendation,
              'withhold_values': withheld,
              'data_badge': result.nutritionalAnalysis.dataBadge,
              'screening_summary': result.cvScreening.screeningSummary,
              'advisories': result.advisories
                  .map((item) => item.message)
                  .toList(),
              'photo_attached': photoAttached,
              'photo_error': photoError,
            },
          ),
        ),
      );
    } catch (error) {
      if (mounted)
        setState(() {
          _loading = false;
          _error = error.toString().replaceFirst('Exception: ', '');
        });
    }
  }

  @override
  Widget build(BuildContext context) {
    final content = _error != null
        ? Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.wifi_off, size: 42, color: Colors.orange),
              const SizedBox(height: 14),
              const Text(
                'Could not reach the FeedSure backend',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(_error!, textAlign: TextAlign.center),
              const SizedBox(height: 18),
              FilledButton.icon(
                onPressed: _runAnalysis,
                icon: const Icon(Icons.refresh),
                label: const Text('Try again'),
              ),
            ],
          )
        : Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.science_outlined, size: 42, color: Colors.green),
              const SizedBox(height: 14),
              const Text(
                'Running scenario analysis',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
              const SizedBox(height: 8),
              Text(widget.feedType + ' · ' + widget.scenario),
              const SizedBox(height: 18),
              if (_loading) const LinearProgressIndicator(),
              const SizedBox(height: 14),
              const Text(
                'Software-generated demo data. No physical scan or trained nutrient model is connected.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12),
              ),
            ],
          );
    return Scaffold(
      appBar: AppBar(
        title: const Text('Demo analysis'),
        leading: const BackButton(),
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 500),
          child: Padding(padding: const EdgeInsets.all(24), child: content),
        ),
      ),
    );
  }
}
