import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/theme.dart';
import 's07_camera_scan_screen.dart';

class S06FeedAnalysisSetupScreen extends StatefulWidget {
  final Function(String feedType)? onNextToScan;

  const S06FeedAnalysisSetupScreen({super.key, this.onNextToScan});

  @override
  State<S06FeedAnalysisSetupScreen> createState() => _S06FeedAnalysisSetupScreenState();
}

class _S06FeedAnalysisSetupScreenState extends State<S06FeedAnalysisSetupScreen> {
  String _selectedFeed = 'Silage';

  final List<Map<String, dynamic>> _feedTypes = [
    {'name': 'Green Fodder', 'icon': Icons.grass},
    {'name': 'Dry Fodder', 'icon': Icons.agriculture},
    {'name': 'Concentrate', 'icon': Icons.grain},
    {'name': 'Silage', 'icon': Icons.inventory_2_outlined},
    {'name': 'Other', 'icon': Icons.cloud_outlined},
  ];

  @override
  Widget build(BuildContext context) {
    final handleNext = widget.onNextToScan ??
        (feed) {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => S07CameraScanScreen(feedType: feed)),
          );
        };

    return Scaffold(
      backgroundColor: AppTheme.bgLight,
      appBar: AppBar(title: const Text('Feed Analysis'), leading: const BackButton()),
      body: SafeArea(
        child: Column(
          children: [
            // Stepper Header (1. Scan, 2. Analysis, 3. Results) matching Screen 6
            Container(
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
              color: Colors.white,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildStepItem('1', 'Scan', isActive: true),
                  const SizedBox(width: 20, child: Divider()),
                  _buildStepItem('2', 'Analysis', isActive: false),
                  const SizedBox(width: 20, child: Divider()),
                  _buildStepItem('3', 'Results', isActive: false),
                ],
              ),
            ),
            const SizedBox(height: 20),

            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Select Feed Type',
                      style: GoogleFonts.plusJakartaSans(fontSize: 18, fontWeight: FontWeight.w900),
                    ),
                    const SizedBox(height: 16),

                    GridView.builder(
                      shrinkWrap: true,
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 1.3,
                        crossAxisSpacing: 14,
                        mainAxisSpacing: 14,
                      ),
                      itemCount: _feedTypes.length,
                      itemBuilder: (context, idx) {
                        final item = _feedTypes[idx];
                        final isSel = _selectedFeed == item['name'];
                        return InkWell(
                          onTap: () => setState(() => _selectedFeed = item['name']),
                          borderRadius: BorderRadius.circular(16),
                          child: Container(
                            decoration: BoxDecoration(
                              color: isSel ? AppTheme.lightMint : Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: isSel ? AppTheme.forestGreen : AppTheme.borderLight,
                                width: isSel ? 2 : 1,
                              ),
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  item['icon'] as IconData,
                                  size: 32,
                                  color: isSel ? AppTheme.forestGreen : AppTheme.textMuted,
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  item['name'],
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: isSel ? AppTheme.forestGreen : AppTheme.textDark,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),

                    const Spacer(),

                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () => handleNext(_selectedFeed),
                        child: const Text('Next'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStepItem(String num, String label, {required bool isActive}) {
    return Row(
      children: [
        Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            color: isActive ? AppTheme.forestGreen : Colors.grey.shade300,
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              num,
              style: TextStyle(color: isActive ? Colors.white : Colors.black54, fontSize: 11, fontWeight: FontWeight.bold),
            ),
          ),
        ),
        const SizedBox(width: 6),
        Text(label, style: TextStyle(fontSize: 12, fontWeight: isActive ? FontWeight.bold : FontWeight.normal)),
      ],
    );
  }
}
