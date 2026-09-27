import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../config/theme.dart';

class NutritionMapScreen extends StatelessWidget {
  const NutritionMapScreen({super.key});

  final List<Map<String, dynamic>> gridPoints = const [
    {'val': '17.2%', 'status': 'GOOD'},
    {'val': '17.5%', 'status': 'GOOD'},
    {'val': '17.0%', 'status': 'GOOD'},
    {'val': '16.9%', 'status': 'GOOD'},
    {'val': '12.8%', 'status': 'ANOMALY'}, // Moisture / CP spatial spot
    {'val': '17.1%', 'status': 'GOOD'},
    {'val': '17.0%', 'status': 'GOOD'},
    {'val': '16.8%', 'status': 'GOOD'},
    {'val': '17.3%', 'status': 'GOOD'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgOffWhite,
      appBar: AppBar(
        title: const Text('Spatial Nutrition Map (3x3 Core Grid)'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Sample Point Heterogeneity Map', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
              const SizedBox(height: 4),
              const Text('Detects spatial variation across pit core layers to prevent sampling bias.', style: TextStyle(fontSize: 12, color: AppTheme.textMuted)),
              const SizedBox(height: 20),

              // 3x3 Spatial Grid
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                ),
                itemCount: gridPoints.length,
                itemBuilder: (context, idx) {
                  final pt = gridPoints[idx];
                  final isAnomaly = pt['status'] == 'ANOMALY';

                  return Container(
                    decoration: BoxDecoration(
                      color: isAnomaly ? Colors.amber.shade100 : AppTheme.primaryDark.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isAnomaly ? Colors.amber.shade700 : AppTheme.primaryDark.withValues(alpha: 0.3),
                        width: isAnomaly ? 2 : 1,
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Point 0${idx + 1}', style: const TextStyle(fontSize: 10, color: AppTheme.textMuted, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text(
                          pt['val'],
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            color: isAnomaly ? Colors.amber.shade900 : AppTheme.primaryDark,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Icon(
                          isAnomaly ? LucideIcons.alertTriangle : LucideIcons.checkCircle2,
                          size: 14,
                          color: isAnomaly ? Colors.amber.shade800 : AppTheme.trustGreen,
                        ),
                      ],
                    ),
                  );
                },
              ),
              const SizedBox(height: 24),

              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.amber.shade50,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.amber.shade300),
                ),
                child: Row(
                  children: [
                    const Icon(LucideIcons.alertTriangle, color: Colors.amber),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Point 5 shows localized moisture deviation (12.8% vs 17.0% avg). Remix trench section before TMR feeding.',
                        style: TextStyle(fontSize: 12, color: Colors.amber.shade900, fontWeight: FontWeight.bold),
                      ),
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
}
