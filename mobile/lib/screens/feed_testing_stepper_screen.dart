import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:fl_chart/fl_chart.dart';
import '../config/theme.dart';
import '../models/batch_analysis.dart';

class FeedTestingStepperScreen extends StatefulWidget {
  final BatchAnalysisResponse data;
  final Function(String feedType) onSelectFeedType;

  const FeedTestingStepperScreen({
    Key? key,
    required this.data,
    required this.onSelectFeedType,
  }) : super(key: key);

  @override
  State<FeedTestingStepperScreen> createState() => _FeedTestingStepperScreenState();
}

class _FeedTestingStepperScreenState extends State<FeedTestingStepperScreen> {
  int _currentStep = 0;
  String _selectedFeed = 'Maize Silage';
  int _scannedPoints = 0;
  bool _isAnalyzing = false;

  void _runPointScan() {
    if (_scannedPoints < 5) {
      setState(() {
        _scannedPoints++;
      });
    }
  }

  void _triggerFullAnalysis() {
    setState(() {
      _isAnalyzing = true;
    });
    Future.delayed(const Duration(milliseconds: 1200), () {
      if (mounted) {
        setState(() {
          _isAnalyzing = false;
          _currentStep = 3; // Jump to Result step
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final evidence = widget.data.evidence;

    return Scaffold(
      backgroundColor: AppTheme.bgOffWhite,
      body: SafeArea(
        child: Column(
          children: [
            // Top Stepper Progress Header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              color: AppTheme.primaryDark,
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'STEP-BY-STEP FEED TESTING',
                        style: TextStyle(
                          color: AppTheme.accentMint,
                          fontSize: 11,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.5,
                        ),
                      ),
                      Text(
                        'Step ${_currentStep + 1} of 4',
                        style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  LinearProgressIndicator(
                    value: (_currentStep + 1) / 4,
                    backgroundColor: Colors.white12,
                    valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.accentLight),
                    minHeight: 6,
                  ),
                ],
              ),
            ),

            // Step Content
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: _buildStepContent(evidence),
              ),
            ),

            // Bottom Navigation Actions
            Container(
              padding: const EdgeInsets.all(16),
              color: Colors.white,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (_currentStep > 0)
                    OutlinedButton(
                      onPressed: () => setState(() => _currentStep--),
                      child: const Text('BACK'),
                    )
                  else
                    const SizedBox.shrink(),

                  ElevatedButton(
                    onPressed: () {
                      if (_currentStep == 0) {
                        setState(() => _currentStep = 1);
                      } else if (_currentStep == 1) {
                        setState(() => _currentStep = 2);
                      } else if (_currentStep == 2) {
                        _triggerFullAnalysis();
                      } else {
                        setState(() {
                          _currentStep = 0;
                          _scannedPoints = 0;
                        });
                      }
                    },
                    style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryDark),
                    child: Text(
                      _currentStep == 2
                          ? 'RUN SIMULATED ANALYZER'
                          : _currentStep == 3
                              ? 'TEST ANOTHER BATCH'
                              : 'CONTINUE',
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStepContent(EvidenceResult evidence) {
    if (_currentStep == 0) {
      // Step 1: Select Feed Type
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Step 1: Select Feed Type', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
          const SizedBox(height: 6),
          const Text('Choose the crop or feed sample to scan.', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
          const SizedBox(height: 16),
          ...['Maize Silage', 'Green Fodder', 'Dry Fodder', 'Concentrate'].map((f) {
            final isSelected = _selectedFeed == f;
            return Card(
              color: isSelected ? AppTheme.primaryDark.withOpacity(0.08) : Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: BorderSide(color: isSelected ? AppTheme.primaryDark : const Color(0xFFE2D9CD)),
              ),
              child: ListTile(
                onTap: () {
                  setState(() => _selectedFeed = f);
                  widget.onSelectFeedType(f);
                },
                leading: Icon(LucideIcons.wheat, color: isSelected ? AppTheme.primaryDark : AppTheme.textMuted),
                title: Text(f, style: TextStyle(fontWeight: FontWeight.bold, color: isSelected ? AppTheme.primaryDark : AppTheme.textDark)),
                trailing: isSelected ? const Icon(LucideIcons.checkCircle2, color: AppTheme.primaryDark) : null,
              ),
            );
          }).toList(),
        ],
      );
    } else if (_currentStep == 1) {
      // Step 2: Sampling Instructions & Core Points
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Step 2: 5-Point Core Sampling', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
          const SizedBox(height: 6),
          const Text('Take 5 core samples across different pit depths to avoid moisture bias.', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
          const SizedBox(height: 20),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  const Icon(LucideIcons.layers, size: 48, color: AppTheme.primaryDark),
                  const SizedBox(height: 12),
                  Text('Scanned Points: $_scannedPoints / 5', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                  const SizedBox(height: 12),
                  LinearProgressIndicator(value: _scannedPoints / 5, minHeight: 8),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: _scannedPoints < 5 ? _runPointScan : null,
                    icon: const Icon(LucideIcons.scanLine),
                    label: Text(_scannedPoints < 5 ? 'SCAN POINT #${_scannedPoints + 1}' : 'ALL 5 POINTS SCANNED ✓'),
                  ),
                ],
              ),
            ),
          ),
        ],
      );
    } else if (_currentStep == 2) {
      // Step 3: Simulated Analyzer Screen
      return SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Step 3: Simulated Analyzer & NIR Scan', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: Colors.amber.shade100, borderRadius: BorderRadius.circular(8)),
              child: const Text('PROTOTYPE SIMULATION • ZERO HARDWARE DEPENDENCY', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.amber)),
            ),
            const SizedBox(height: 16),

            // NIR Spectral Curve Chart (fl_chart)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Overlaid NIR Spectrum (800nm - 1050nm)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    const SizedBox(height: 16),
                    SizedBox(
                      height: 180,
                      child: LineChart(
                        LineChartData(
                          gridData: const FlGridData(show: false),
                          titlesData: const FlTitlesData(show: false),
                          borderData: FlBorderData(show: false),
                          lineBarsData: [
                            LineChartBarData(
                              spots: const [
                                FlSpot(0, 0.42),
                                FlSpot(1, 0.47),
                                FlSpot(2, 0.53),
                                FlSpot(3, 0.49),
                                FlSpot(4, 0.57),
                                FlSpot(5, 0.50),
                              ],
                              isCurved: true,
                              color: AppTheme.accentLight,
                              barWidth: 3,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
    } else {
      // Step 4: Evidence Result Screen ("AI That Knows When Not to Trust Itself")
      return SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: evidence.trustStatus == 'TRUSTED' ? AppTheme.trustGreen.withOpacity(0.15) : AppTheme.untrustedRed.withOpacity(0.15),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: evidence.trustStatus == 'TRUSTED' ? AppTheme.trustGreen : AppTheme.untrustedRed),
              ),
              child: Column(
                children: [
                  Text(
                    evidence.trustStatus,
                    style: TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 20,
                      color: evidence.trustStatus == 'TRUSTED' ? AppTheme.trustGreen : AppTheme.untrustedRed,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Overall Evidence Certainty: ${evidence.evidenceScore}%',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Nutritional Results', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                    const SizedBox(height: 12),
                    _buildResultRow('Crude Protein (CP)', '${widget.data.nutritionalAnalysis.crudeProteinPct}%'),
                    _buildResultRow('Dry Matter (DM)', '${widget.data.nutritionalAnalysis.dryMatterPct}%'),
                    _buildResultRow('Moisture Content', '${widget.data.nutritionalAnalysis.moisturePct}%'),
                    _buildResultRow('NDF Fiber', '${widget.data.nutritionalAnalysis.ndfPct}%'),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
    }
  }

  Widget _buildResultRow(String label, String val) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 13, color: AppTheme.textMuted)),
          Text(val, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppTheme.primaryDark)),
        ],
      ),
    );
  }
}
