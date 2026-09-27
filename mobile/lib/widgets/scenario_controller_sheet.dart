import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../config/theme.dart';

class ScenarioControllerSheet extends StatelessWidget {
  final String currentScenario;
  final ValueChanged<String> onSelectScenario;

  const ScenarioControllerSheet({
    Key? key,
    required this.currentScenario,
    required this.onSelectScenario,
  }) : super(key: key);

  final List<Map<String, String>> scenarios = const [
    {
      'id': 'healthy',
      'label': 'Scenario A: Healthy Feed',
      'badge': 'TRUSTED',
      'desc': 'Consistent 5-point scan, optimal calibration fit.',
    },
    {
      'id': 'heterogeneous',
      'label': 'Scenario B: Heterogeneous Sample',
      'badge': 'RETEST REQUIRED',
      'desc': 'High variance across core sample points.',
    },
    {
      'id': 'ood',
      'label': 'Scenario C: Out-of-Distribution',
      'badge': 'RESULT NOT TRUSTED',
      'desc': 'Wavelength shift outside calibration domain.',
    },
    {
      'id': 'storage_warning',
      'label': 'Scenario D: Storage Spoilage',
      'badge': 'STORAGE ALERT',
      'desc': 'Temperature heating (>33°C) and pH elevation.',
    },
    {
      'id': 'adulteration',
      'label': 'Scenario E: Suspected Adulteration',
      'badge': 'SUSPECTED UREA',
      'desc': 'Absorption anomaly at urea/silica spectral bands.',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: AppTheme.bgSurface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Icon(LucideIcons.sliders, color: AppTheme.primaryDark, size: 20),
                  SizedBox(width: 8),
                  Text(
                    'Demo Scenario Controller',
                    style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
                  ),
                ],
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(LucideIcons.x, size: 20),
              ),
            ],
          ),
          const SizedBox(height: 4),
          const Text(
            'Select a prototype scenario to trigger live state shifts for SIH presentation:',
            style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
          ),
          const SizedBox(height: 16),
          Flexible(
            child: ListView.separated(
              shrinkWrap: true,
              itemCount: scenarios.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, idx) {
                final sc = scenarios[idx];
                final isSelected = currentScenario == sc['id'];
                return InkWell(
                  onTap: () {
                    onSelectScenario(sc['id']!);
                    Navigator.pop(context);
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: isSelected ? AppTheme.primaryDark : AppTheme.bgOffWhite,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected ? AppTheme.accentLight : const Color(0xFFE2D9CD),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          isSelected ? LucideIcons.checkCircle2 : LucideIcons.circle,
                          color: isSelected ? AppTheme.accentMint : AppTheme.textMuted,
                          size: 20,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                sc['label']!,
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                  color: isSelected ? Colors.white : AppTheme.textDark,
                                ),
                              ),
                              Text(
                                sc['desc']!,
                                style: TextStyle(
                                  fontSize: 11,
                                  color: isSelected ? Colors.white70 : AppTheme.textMuted,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: isSelected ? Colors.white24 : AppTheme.primaryDark.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            sc['badge']!,
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w800,
                              color: isSelected ? AppTheme.accentMint : AppTheme.primaryDark,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
