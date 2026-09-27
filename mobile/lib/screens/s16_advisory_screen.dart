import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../config/theme.dart';
import 's17_report_download_screen.dart';

class S16AdvisoryScreen extends StatefulWidget {
  const S16AdvisoryScreen({Key? key}) : super(key: key);

  @override
  State<S16AdvisoryScreen> createState() => _S16AdvisoryScreenState();
}

class _S16AdvisoryScreenState extends State<S16AdvisoryScreen> {
  String _selectedTab = 'All';

  final List<Map<String, dynamic>> _advisories = [
    {
      'title': 'Increase Mustard Cake Intake',
      'category': 'Nutrition',
      'desc': 'Add 1.5 kg per cow daily to remedy crude protein shortfall and boost milk yield.',
      'priority': 'HIGH',
      'icon': LucideIcons.flame,
      'color': Colors.orange,
    },
    {
      'title': 'Ventilate Silage Pit #1',
      'category': 'Storage',
      'desc': 'Moisture levels reaching 68%. Open upper ventilation tarpaulin during sunny hours.',
      'priority': 'MEDIUM',
      'icon': LucideIcons.wind,
      'color': Colors.blue,
    },
    {
      'title': 'Green Fodder Quality Alert',
      'category': 'Feed Quality',
      'desc': 'Maize fodder batch #441 verified Aflatoxin-safe (< 2.4 ppb). Recommended for immediate feeding.',
      'priority': 'NORMAL',
      'icon': LucideIcons.checkCircle2,
      'color': Colors.green,
    },
    {
      'title': 'Mineral Mix Supplementation',
      'category': 'Nutrition',
      'desc': 'Provide 50g chelated mineral mixture to lactating herd to prevent postpartum calcium drop.',
      'priority': 'MEDIUM',
      'icon': LucideIcons.sparkles,
      'color': Colors.purple,
    },
  ];

  @override
  Widget build(BuildContext context) {
    final filtered = _selectedTab == 'All'
        ? _advisories
        : _advisories.where((a) => a['category'] == _selectedTab).toList();

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: Text(
          'Smart Advisory Hub',
          style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        backgroundColor: AppTheme.primaryColor,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          // Filter Bar
          Container(
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 14),
            color: Colors.white,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['All', 'Nutrition', 'Feed Quality', 'Storage'].map((tab) {
                  final isSelected = _selectedTab == tab;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(tab),
                      selected: isSelected,
                      onSelected: (sel) {
                        if (sel) setState(() => _selectedTab = tab);
                      },
                      selectedColor: AppTheme.primaryColor,
                      labelStyle: GoogleFonts.outfit(
                        color: isSelected ? Colors.white : Colors.black87,
                        fontWeight: FontWeight.bold,
                      ),
                      backgroundColor: Colors.grey.shade100,
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(18),
              itemCount: filtered.length,
              itemBuilder: (context, index) {
                final adv = filtered[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.04),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: (adv['color'] as Color).withOpacity(0.12),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(adv['icon'] as IconData, color: adv['color'] as Color, size: 24),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    adv['title'],
                                    style: GoogleFonts.outfit(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 15,
                                      color: Colors.black87,
                                    ),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppTheme.lightMint,
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: Text(
                                    adv['priority'],
                                    style: GoogleFonts.outfit(
                                      color: AppTheme.primaryColor,
                                      fontSize: 10,
                                      fontWeight: FontWeight.w900,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              adv['desc'],
                              style: GoogleFonts.outfit(
                                fontSize: 13,
                                color: Colors.grey.shade700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(18),
            child: SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const S17ReportDownloadScreen()),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryColor,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                icon: const Icon(LucideIcons.fileDown, color: Colors.white),
                label: Text(
                  'Download Full Passport Report',
                  style: GoogleFonts.outfit(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
