import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../config/theme.dart';
import '../models/batch_analysis.dart';

class DairyProfileScreen extends StatefulWidget {
  final DairyRation ration;

  const DairyProfileScreen({Key? key, required this.ration}) : super(key: key);

  @override
  State<DairyProfileScreen> createState() => _DairyProfileScreenState();
}

class _DairyProfileScreenState extends State<DairyProfileScreen> {
  int _lactating = 17;
  int _dry = 7;

  final List<Map<String, dynamic>> _basket = [
    {'name': 'Maize Silage (Tested Batch)', 'kg': 20.0, 'cp': 8.8},
    {'name': 'Green Napier Grass', 'kg': 10.0, 'cp': 11.2},
    {'name': 'Wheat Straw', 'kg': 4.0, 'cp': 4.2},
    {'name': 'Compound Concentrate', 'kg': 5.0, 'cp': 18.5},
  ];

  @override
  Widget build(BuildContext context) {
    final totalKg = _basket.fold<double>(0, (acc, item) => acc + (item['kg'] as double));
    final weightedCp = totalKg == 0
        ? 0.0
        : _basket.fold<double>(0, (acc, item) => acc + ((item['kg'] as double) * (item['cp'] as double))) / totalKg;
    final cpGap = (13.5 - weightedCp).toStringAsFixed(1);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Dairy Herd Profile & Fodder Basket', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20)),
          const SizedBox(height: 6),
          const Text('SIH PS 26111 Dairy Context: Formulate daily total mixed ration (TMR).', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
          const SizedBox(height: 16),

          // Herd Count Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Shiv Dairy Farm Herd Breakdown', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Lactating Cows:', style: TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                            const SizedBox(height: 4),
                            TextField(
                              controller: TextEditingController(text: '$_lactating'),
                              keyboardType: TextInputType.number,
                              onChanged: (val) => setState(() => _lactating = int.tryParse(val) ?? 17),
                              decoration: const InputDecoration(border: OutlineInputBorder(), contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8)),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Dry Cows:', style: TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                            const SizedBox(height: 4),
                            TextField(
                              controller: TextEditingController(text: '$_dry'),
                              keyboardType: TextInputType.number,
                              onChanged: (val) => setState(() => _dry = int.tryParse(val) ?? 7),
                              decoration: const InputDecoration(border: OutlineInputBorder(), contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Fodder Basket List
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Daily Feed Basket (kg/cow)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      Text('CP: ${weightedCp.toStringAsFixed(1)}% vs 13.5%', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.primaryDark)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ..._basket.map((item) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(child: Text(item['name'], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold))),
                        Text('${item['kg']} kg', style: const TextStyle(fontSize: 12, color: AppTheme.primaryDark, fontWeight: FontWeight.w900)),
                      ],
                    ),
                  )).toList(),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Advisory Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.amber.shade50,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.amber.shade300),
            ),
            child: Row(
              children: [
                const Icon(LucideIcons.lightbulb, color: Colors.amber),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Ration Crude Protein deficit is $cpGap%. Supplement Groundnut or Mustard Oil Cake by 1.2 kg per lactating cow.',
                    style: TextStyle(fontSize: 12, color: Colors.amber.shade900, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
