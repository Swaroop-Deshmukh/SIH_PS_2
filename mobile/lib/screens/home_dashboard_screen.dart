import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../config/theme.dart';
import '../config/dictionary.dart';
import '../models/batch_analysis.dart';

class HomeDashboardScreen extends StatelessWidget {
  final BatchAnalysisResponse data;
  final String lang;
  final bool farmerMode;
  final Function(int) onNavigateTab;
  final VoidCallback onOpenScenarioSheet;

  const HomeDashboardScreen({
    super.key,
    required this.data,
    required this.lang,
    required this.farmerMode,
    required this.onNavigateTab,
    required this.onOpenScenarioSheet,
  });

  @override
  Widget build(BuildContext context) {
    final evidence = data.evidence;
    final storage = data.storageTelemetry;
    final dairyRation = data.dairyRation;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. Farm Overview Banner Card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppTheme.primaryDark, AppTheme.primaryMedium],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primaryDark.withOpacity(0.3),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: const [
                        Icon(LucideIcons.milk, color: AppTheme.accentMint, size: 18),
                        SizedBox(width: 6),
                        Text(
                          'SHIV DAIRY FARM • PUNE REGION',
                          style: TextStyle(
                            color: AppTheme.accentMint,
                            fontWeight: FontWeight.w900,
                            fontSize: 11,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                    InkWell(
                      onTap: onOpenScenarioSheet,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white12,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.white24),
                        ),
                        child: Row(
                          children: const [
                            Icon(LucideIcons.sliders, color: Colors.amber, size: 12),
                            SizedBox(width: 4),
                            Text('SCENARIOS', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  AppDictionary.get('greeting', lang: lang),
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                    fontSize: 22,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  AppDictionary.get('herdSummary', lang: lang),
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // 2. Mobile Quick Action Cards Grid (Section 3)
          Text(
            AppDictionary.get('quickActions', lang: lang),
            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
          ),
          const SizedBox(height: 12),
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            childAspectRatio: 1.5,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            children: [
              _buildQuickActionCard(
                context,
                title: AppDictionary.get('testFeed', lang: lang),
                subtitle: 'Multi-Point Scan',
                icon: LucideIcons.wheat,
                color: AppTheme.primaryMedium,
                onTap: () => onNavigateTab(1),
              ),
              _buildQuickActionCard(
                context,
                title: AppDictionary.get('checkSilage', lang: lang),
                subtitle: 'Pit Telemetry',
                icon: LucideIcons.flame,
                color: const Color(0xFFD97706),
                onTap: () => onNavigateTab(2),
              ),
              _buildQuickActionCard(
                context,
                title: AppDictionary.get('checkRation', lang: lang),
                subtitle: 'Protein Balance',
                icon: LucideIcons.scale,
                color: const Color(0xFF0284C7),
                onTap: () => onNavigateTab(4), // Profile / Ration
              ),
              _buildQuickActionCard(
                context,
                title: AppDictionary.get('viewAlerts', lang: lang),
                subtitle: '${data.advisories.length} Active',
                icon: LucideIcons.bell,
                color: const Color(0xFFDC2626),
                onTap: () => onNavigateTab(3),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // 3. Latest Test Result Summary Card
          const Text(
            'Latest Feed Test & Evidence Status',
            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
          ),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Batch #${data.batchId}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: _getTrustColor(evidence.trustStatus).withOpacity(0.15),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: _getTrustColor(evidence.trustStatus)),
                        ),
                        child: Text(
                          evidence.trustStatus,
                          style: TextStyle(
                            color: _getTrustColor(evidence.trustStatus),
                            fontWeight: FontWeight.w900,
                            fontSize: 11,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildMiniMetric('Crude Protein', '${data.nutritionalAnalysis.crudeProteinPct}%'),
                      _buildMiniMetric('Dry Matter', '${data.nutritionalAnalysis.dryMatterPct}%'),
                      _buildMiniMetric('Evidence Score', '${evidence.evidenceScore}%'),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    evidence.recommendation,
                    style: const TextStyle(fontSize: 12, color: AppTheme.textDark, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // 4. Silage Pit Status Quick Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: storage.status == 'CRITICAL_WARNING' ? Colors.red.shade100 : Colors.amber.shade100,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      LucideIcons.flame,
                      color: storage.status == 'CRITICAL_WARNING' ? Colors.red : Colors.amber.shade900,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Silage Trench Pit #2',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'pH: ${storage.ph} • Temp: ${storage.temperatureCelsius}°C • Spoilage Index: ${storage.spoilageRiskIndex}/100',
                          style: const TextStyle(fontSize: 12, color: AppTheme.textMuted),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => onNavigateTab(2),
                    icon: const Icon(LucideIcons.chevronRight),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Icon(icon, color: color, size: 24),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 13),
                ),
                Text(
                  subtitle,
                  style: TextStyle(color: color.withOpacity(0.8), fontSize: 10, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMiniMetric(String title, String val) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 10, color: AppTheme.textMuted, fontWeight: FontWeight.w600)),
        Text(val, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppTheme.primaryDark)),
      ],
    );
  }

  Color _getTrustColor(String status) {
    if (status == 'TRUSTED') return AppTheme.trustGreen;
    if (status == 'RESULT NOT TRUSTED') return AppTheme.untrustedRed;
    if (status == 'RETEST RECOMMENDED') return AppTheme.retestAmber;
    if (status == 'SUSPECTED ADULTERATION') return AppTheme.adulterationPurple;
    return AppTheme.storageOrange;
  }
}
