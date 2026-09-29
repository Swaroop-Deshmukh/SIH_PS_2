import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../config/theme.dart';
import 's13_feed_basket_screen.dart';

class S12RationAdvisoryScreen extends StatefulWidget {
  final int animalCount;
  final double milkYield;
  final String lactationStage;

  const S12RationAdvisoryScreen({
    Key? key,
    this.animalCount = 10,
    this.milkYield = 12.0,
    this.lactationStage = 'early_lactation',
  }) : super(key: key);

  @override
  State<S12RationAdvisoryScreen> createState() => _S12RationAdvisoryScreenState();
}

class _S12RationAdvisoryScreenState extends State<S12RationAdvisoryScreen> {
  late String selectedStage;

  @override
  void initState() {
    super.initState();
    selectedStage = widget.lactationStage;
  }

  // Calculate dynamic requirements based on stage & yield
  Map<String, dynamic> _calculateMetrics() {
    double reqDmiPerCow = 14.0 + (0.32 * widget.milkYield);
    double targetCp = 17.0;

    if (selectedStage == 'mid_lactation') {
      reqDmiPerCow = 12.0 + (0.30 * widget.milkYield);
      targetCp = 15.0;
    } else if (selectedStage == 'late_lactation') {
      reqDmiPerCow = 10.0 + (0.28 * widget.milkYield);
      targetCp = 13.0;
    } else if (selectedStage == 'dry_period') {
      reqDmiPerCow = 11.0;
      targetCp = 11.5;
    }

    final double totalReqDmi = reqDmiPerCow * widget.animalCount;
    final double reqCpKg = (totalReqDmi * targetCp) / 100.0;

    // Available basket simulation
    final double availDm = 14.2 * widget.animalCount;
    final double availCp = 1.85 * widget.animalCount;

    final double dmDeficit = availDm - totalReqDmi;
    final double cpDeficit = availCp - reqCpKg;

    String recommendation = '';
    if (selectedStage == 'early_lactation') {
      recommendation = 'Early Lactation Alert: High energy density needed. Supplement bypass protein & fat.';
    } else if (selectedStage == 'mid_lactation') {
      recommendation = 'Mid Lactation Notice: Maintain peak persistent yield. Balance fiber-to-concentrate ratio.';
    } else if (selectedStage == 'late_lactation') {
      recommendation = 'Late Lactation Advice: Prevent over-fatting while supporting pregnancy & body condition.';
    } else {
      recommendation = 'Dry Period Recommendation: Maintain non-lactating dry matter with controlled protein to prevent milk fever.';
    }

    return {
      'reqDmiPerCow': reqDmiPerCow,
      'targetCp': targetCp,
      'totalReqDmi': totalReqDmi,
      'reqCpKg': reqCpKg,
      'availDm': availDm,
      'availCp': availCp,
      'dmDeficit': dmDeficit,
      'cpDeficit': cpDeficit,
      'recommendation': recommendation,
    };
  }

  @override
  Widget build(BuildContext context) {
    final metrics = _calculateMetrics();
    final double cpDeficitKg = metrics['cpDeficit'];
    final bool isDeficient = cpDeficitKg < 0;

    final stageLabels = {
      'early_lactation': 'Early Lactation',
      'mid_lactation': 'Mid Lactation',
      'late_lactation': 'Late Lactation',
      'dry_period': 'Dry Period',
    };

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: Text(
          'Ration Advisory',
          style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        backgroundColor: AppTheme.primaryColor,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Stage Selection Dropdown Card
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Selected Stage',
                        style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey.shade600),
                      ),
                      Text(
                        stageLabels[selectedStage] ?? selectedStage,
                        style: GoogleFonts.outfit(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryColor,
                        ),
                      ),
                    ],
                  ),
                  DropdownButton<String>(
                    value: selectedStage,
                    underline: const SizedBox(),
                    icon: const Icon(LucideIcons.chevronDown, color: AppTheme.primaryColor),
                    items: stageLabels.entries.map((e) {
                      return DropdownMenuItem<String>(
                        value: e.key,
                        child: Text(e.value, style: GoogleFonts.outfit(fontWeight: FontWeight.w600)),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => selectedStage = val);
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Status Warning / Success Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDeficient ? Colors.amber.shade50 : Colors.green.shade50,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDeficient ? Colors.amber.shade400 : Colors.green.shade400,
                  width: 1.5,
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    isDeficient ? LucideIcons.alertTriangle : LucideIcons.checkCircle,
                    color: isDeficient ? Colors.amber.shade900 : Colors.green.shade900,
                    size: 28,
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isDeficient
                              ? 'NEEDS BALANCING (${cpDeficitKg.toStringAsFixed(1)} kg CP Gap)'
                              : 'OPTIMAL RATION (+${cpDeficitKg.toStringAsFixed(1)} kg CP Surplus)',
                          style: GoogleFonts.outfit(
                            fontSize: 14,
                            fontWeight: FontWeight.w900,
                            color: isDeficient ? Colors.amber.shade900 : Colors.green.shade900,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          metrics['recommendation'],
                          style: GoogleFonts.outfit(
                            fontSize: 12,
                            color: isDeficient ? Colors.amber.shade900 : Colors.green.shade900,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),
            Text(
              'Nutritional Balance Analysis',
              style: GoogleFonts.outfit(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryColor,
              ),
            ),
            const SizedBox(height: 12),

            _buildProgressMeter(
              'Crude Protein (Target: ${metrics['targetCp']}%)',
              (metrics['availCp'] / metrics['reqCpKg']).clamp(0.0, 1.0),
              '${metrics['availCp'].toStringAsFixed(1)} / ${metrics['reqCpKg'].toStringAsFixed(1)} kg',
              isDeficient ? Colors.red : Colors.green,
            ),
            _buildProgressMeter(
              'Dry Matter (DMI Target: ${metrics['reqDmiPerCow'].toStringAsFixed(1)} kg/cow)',
              (metrics['availDm'] / metrics['totalReqDmi']).clamp(0.0, 1.0),
              '${metrics['availDm'].toStringAsFixed(1)} / ${metrics['totalReqDmi'].toStringAsFixed(1)} kg total',
              metrics['dmDeficit'] < 0 ? Colors.orange : Colors.green,
            ),

            const SizedBox(height: 24),
            Text(
              'AI Precision Recommendations',
              style: GoogleFonts.outfit(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryColor,
              ),
            ),
            const SizedBox(height: 12),

            _buildRecommendationCard(
              title: selectedStage == 'dry_period' ? 'Maintain Fiber Balance' : 'Add Mustard Oil Cake',
              qtyChange: selectedStage == 'dry_period' ? '+ 0.5 kg Wheat Straw' : '+ 1.5 kg / cow / day',
              reason: metrics['recommendation'],
              icon: LucideIcons.plusCircle,
              iconColor: Colors.green,
            ),

            const SizedBox(height: 20),
            // Projected Yield Gain Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppTheme.primaryColor,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  const Icon(LucideIcons.trendingUp, color: AppTheme.accentColor, size: 36),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'PROJECTED MILK GAIN',
                          style: GoogleFonts.outfit(
                            color: AppTheme.accentColor,
                            fontWeight: FontWeight.w900,
                            fontSize: 12,
                          ),
                        ),
                        Text(
                          selectedStage == 'dry_period' ? 'Dry Period Target' : '+ 1.8 Liters / day / cow',
                          style: GoogleFonts.outfit(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'Estimated net margin gain: ₹45/cow/day',
                          style: GoogleFonts.outfit(color: Colors.white70, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),

            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const S13FeedBasketScreen()),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryColor,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                icon: const Icon(LucideIcons.shoppingBag, color: Colors.white),
                label: Text(
                  'Update Feed Basket Inventory',
                  style: GoogleFonts.outfit(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressMeter(String label, double val, String statusText, Color statusColor) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.black87),
              ),
              Text(
                statusText,
                style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 13, color: statusColor),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: val,
              minHeight: 8,
              backgroundColor: Colors.grey.shade200,
              valueColor: AlwaysStoppedAnimation<Color>(statusColor),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecommendationCard({
    required String title,
    required String qtyChange,
    required String reason,
    required IconData icon,
    required Color iconColor,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: iconColor, size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.black87),
                    ),
                    Text(
                      qtyChange,
                      style: GoogleFonts.outfit(fontWeight: FontWeight.w900, fontSize: 13, color: iconColor),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  reason,
                  style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey.shade600),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
