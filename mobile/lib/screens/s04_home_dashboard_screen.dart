import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/theme.dart';
import 's05_quick_test_menu_screen.dart';

class S04HomeDashboardScreen extends StatelessWidget {
  final VoidCallback? onStartTesting;
  final Function(int)? onNavigateActionCard;
  final VoidCallback? onOpenScenarioSheet;

  const S04HomeDashboardScreen({
    super.key,
    this.onStartTesting,
    this.onNavigateActionCard,
    this.onOpenScenarioSheet,
  });

  @override
  Widget build(BuildContext context) {
    final handleStartTesting = onStartTesting ??
        () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const S05QuickTestMenuScreen()),
          );
        };

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // User Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Good Morning, Ramesh!',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      color: AppTheme.forestGreen,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Healthy Feed • Healthy Cows • Better Tomorrow',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textMuted,
                    ),
                  ),
                ],
              ),
              if (onOpenScenarioSheet != null)
                IconButton(
                  icon: const Icon(Icons.tune_rounded, color: AppTheme.forestGreen),
                  onPressed: onOpenScenarioSheet,
                  tooltip: 'Demo Scenario Switcher',
                ),
            ],
          ),
          const SizedBox(height: 20),

          // Quick Test Hero Box matching Screen 4
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppTheme.lightMint,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppTheme.mintAccent.withValues(alpha: 0.5)),
            ),
            child: Row(
              children: [
                Container(
                  width: 54,
                  height: 54,
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.science_outlined, color: AppTheme.forestGreen, size: 28),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Quick Test',
                        style: GoogleFonts.plusJakartaSans(
                          fontWeight: FontWeight.w900,
                          fontSize: 18,
                          color: AppTheme.forestGreen,
                        ),
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        'Test your feed or silage',
                        style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: handleStartTesting,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.forestGreen,
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Start Testing', style: TextStyle(fontSize: 13)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // 4 Action Cards Grid matching Screen 4
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            childAspectRatio: 1.25,
            crossAxisSpacing: 14,
            mainAxisSpacing: 14,
            children: [
              _buildDashboardCard(
                icon: Icons.inventory_2_outlined,
                title: 'My Feed Batches',
                subtitle: 'View history & reports',
                onTap: () => onNavigateActionCard?.call(1),
              ),
              _buildDashboardCard(
                icon: Icons.lightbulb_outline,
                title: 'Dairy Advisory',
                subtitle: 'Ration & nutrition tips',
                onTap: () => onNavigateActionCard?.call(2),
              ),
              _buildDashboardCard(
                icon: Icons.thermostat_outlined,
                title: 'Storage Monitoring',
                subtitle: 'Silage & feed storage',
                onTap: () => onNavigateActionCard?.call(14),
              ),
              _buildDashboardCard(
                icon: Icons.qr_code_scanner_outlined,
                title: 'Traceability',
                subtitle: 'QR & authenticity',
                onTap: () => onNavigateActionCard?.call(15),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDashboardCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: AppTheme.borderLight),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppTheme.lightMint,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: AppTheme.forestGreen, size: 22),
            ),
            const SizedBox(height: 10),
            Text(
              title,
              style: GoogleFonts.plusJakartaSans(
                fontWeight: FontWeight.w800,
                fontSize: 13,
                color: AppTheme.textDark,
              ),
            ),
            Text(
              subtitle,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 10,
                color: AppTheme.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
