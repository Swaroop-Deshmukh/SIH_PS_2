import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/theme.dart';
import 's09_feed_analysis_results_screen.dart';

class S08AnalysisProgressScreen extends StatefulWidget {
  final VoidCallback? onAnalysisComplete;

  const S08AnalysisProgressScreen({super.key, this.onAnalysisComplete});

  @override
  State<S08AnalysisProgressScreen> createState() => _S08AnalysisProgressScreenState();
}

class _S08AnalysisProgressScreenState extends State<S08AnalysisProgressScreen> {
  double _progress = 0.25;

  @override
  void initState() {
    super.initState();
    _startProgress();
  }

  void _startProgress() async {
    await Future.delayed(const Duration(milliseconds: 500));
    if (mounted) setState(() => _progress = 0.50);
    await Future.delayed(const Duration(milliseconds: 500));
    if (mounted) setState(() => _progress = 0.75);
    await Future.delayed(const Duration(milliseconds: 600));
    if (mounted) setState(() => _progress = 1.0);
    await Future.delayed(const Duration(milliseconds: 400));
    if (mounted) {
      if (widget.onAnalysisComplete != null) {
        widget.onAnalysisComplete!();
      } else {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const S09FeedAnalysisResultsScreen()),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(title: const Text('Analysis'), leading: const SizedBox.shrink()),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Analyzing...', style: GoogleFonts.plusJakartaSans(fontSize: 22, fontWeight: FontWeight.w900)),
              const SizedBox(height: 32),

              // Animated Circular Progress Ring 75% matching Screen 8
              Stack(
                alignment: Alignment.center,
                children: [
                  SizedBox(
                    width: 140,
                    height: 140,
                    child: CircularProgressIndicator(
                      value: _progress,
                      strokeWidth: 10,
                      backgroundColor: Colors.grey.shade200,
                      valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.forestGreen),
                    ),
                  ),
                  Text(
                    '${(_progress * 100).toInt()}%',
                    style: GoogleFonts.plusJakartaSans(fontSize: 28, fontWeight: FontWeight.w900, color: AppTheme.forestGreen),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Text('AI is analyzing your sample', style: GoogleFonts.plusJakartaSans(color: AppTheme.textMuted, fontSize: 13)),
              const SizedBox(height: 32),

              // Checklist Items matching Screen 8
              _buildCheckItem('Processing image', isDone: _progress >= 0.25),
              _buildCheckItem('NIR spectral analysis', isDone: _progress >= 0.50),
              _buildCheckItem('Checking for contaminants', isDone: _progress >= 0.75),
              _buildCheckItem('Calculating nutrition values', isDone: _progress >= 1.0),

              const SizedBox(height: 40),

              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: AppTheme.lightMint, borderRadius: BorderRadius.circular(12)),
                child: Row(
                  children: const [
                    Icon(Icons.info_outline, color: AppTheme.forestGreen, size: 18),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text('This usually takes 1-2 minutes...', style: TextStyle(fontSize: 11, color: AppTheme.forestGreen, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCheckItem(String label, {required bool isDone}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(isDone ? Icons.check_circle : Icons.radio_button_unchecked, color: isDone ? AppTheme.forestGreen : Colors.grey, size: 20),
          const SizedBox(width: 12),
          Text(label, style: TextStyle(fontSize: 14, fontWeight: isDone ? FontWeight.bold : FontWeight.normal, color: isDone ? AppTheme.textDark : AppTheme.textMuted)),
        ],
      ),
    );
  }
}
