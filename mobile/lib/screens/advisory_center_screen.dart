import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../config/theme.dart';
import '../models/batch_analysis.dart';

class AdvisoryCenterScreen extends StatelessWidget {
  final List<AdvisoryItem> advisories;

  const AdvisoryCenterScreen({Key? key, required this.advisories}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Advisory Center & Safety Alerts', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20)),
          const SizedBox(height: 6),
          const Text('Actionable feeding & storage advisories prioritized by operational severity.', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
          const SizedBox(height: 16),

          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: advisories.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, idx) {
              final adv = advisories[idx];
              final isCritical = adv.severity == 'CRITICAL';
              final isHigh = adv.severity == 'HIGH';

              final cardBg = isCritical ? Colors.red.shade50 : isHigh ? Colors.amber.shade50 : AppTheme.accentMint.withOpacity(0.15);
              final borderColor = isCritical ? Colors.red.shade300 : isHigh ? Colors.amber.shade400 : AppTheme.accentLight;
              final textColor = isCritical ? Colors.red.shade900 : isHigh ? Colors.amber.shade900 : AppTheme.primaryDark;

              return Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: cardBg,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: borderColor),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          isCritical ? LucideIcons.alertTriangle : LucideIcons.info,
                          color: borderColor,
                          size: 18,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          adv.category.toUpperCase(),
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: textColor),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      adv.title,
                      style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: textColor),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      adv.message,
                      style: TextStyle(fontSize: 12, color: textColor.withOpacity(0.9), height: 1.4),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
