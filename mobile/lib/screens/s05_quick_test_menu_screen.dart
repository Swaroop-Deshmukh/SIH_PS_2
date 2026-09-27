import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/theme.dart';
import 's06_feed_analysis_setup_screen.dart';
import 's14_storage_monitoring_screen.dart';

class S05QuickTestMenuScreen extends StatelessWidget {
  final VoidCallback? onSelectFeedAnalysis;
  final VoidCallback? onSelectSilageAnalysis;
  final VoidCallback? onSelectStorageMonitoring;

  const S05QuickTestMenuScreen({
    super.key,
    this.onSelectFeedAnalysis,
    this.onSelectSilageAnalysis,
    this.onSelectStorageMonitoring,
  });

  @override
  Widget build(BuildContext context) {
    final handleFeed = onSelectFeedAnalysis ??
        () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const S06FeedAnalysisSetupScreen()),
          );
        };

    final handleSilage = onSelectSilageAnalysis ??
        () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const S06FeedAnalysisSetupScreen()),
          );
        };

    final handleStorage = onSelectStorageMonitoring ??
        () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const S14StorageMonitoringScreen()),
          );
        };

    return Scaffold(
      backgroundColor: AppTheme.bgLight,
      appBar: AppBar(
        title: const Text('Quick Test'),
        leading: const BackButton(),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Choose what you want to test',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textDark,
                ),
              ),
              const SizedBox(height: 20),

              _buildTestTypeCard(
                icon: Icons.eco_outlined,
                title: 'Feed Analysis',
                description: 'Check nutritional quality & contaminants',
                onTap: handleFeed,
              ),
              const SizedBox(height: 14),

              _buildTestTypeCard(
                icon: Icons.grass_outlined,
                title: 'Silage Analysis',
                description: 'Check pH, fermentation & spoilage',
                onTap: handleSilage,
              ),
              const SizedBox(height: 14),

              _buildTestTypeCard(
                icon: Icons.thermostat_outlined,
                title: 'Storage Monitoring',
                description: 'Monitor temperature & humidity',
                onTap: handleStorage,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTestTypeCard({
    required IconData icon,
    required String title,
    required String description,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppTheme.borderLight),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.lightMint,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: AppTheme.forestGreen, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.plusJakartaSans(
                      fontWeight: FontWeight.w800,
                      fontSize: 16,
                      color: AppTheme.textDark,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    description,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 12,
                      color: AppTheme.textMuted,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, size: 16, color: AppTheme.textMuted),
          ],
        ),
      ),
    );
  }
}
