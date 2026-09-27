import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../config/theme.dart';

class OnboardingScreen extends StatefulWidget {
  final VoidCallback onFinishOnboarding;

  const OnboardingScreen({Key? key, required this.onFinishOnboarding}) : super(key: key);

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<Map<String, dynamic>> _pages = [
    {
      'title': 'Know Your Feed.',
      'subtitle': 'FeedSure 360 brings rapid feed and silage quality testing directly to dairy farms.',
      'icon': LucideIcons.wheat,
      'badge': 'SIH 2026 PROBLEM STATEMENT 26111',
      'color': AppTheme.primaryDark,
    },
    {
      'title': 'Test Smarter.',
      'subtitle': '5-point representative core sampling eliminates false readings caused by moisture gradients.',
      'icon': LucideIcons.layers,
      'badge': 'REPRESENTATIVE SAMPLING',
      'color': AppTheme.primaryMedium,
    },
    {
      'title': 'Trust the Evidence.',
      'subtitle': 'AI That Knows When Not to Trust Itself. Evaluates spectral quality, uncertainty, and out-of-distribution distance.',
      'icon': LucideIcons.shieldCheck,
      'badge': 'EVIDENCE-AWARE AI',
      'color': const Color(0xFF122B20),
    },
    {
      'title': 'Understand Your Dairy Ration.',
      'subtitle': 'Connects feed test numbers directly to your lactating herd counts, available feed basket, and daily protein gaps.',
      'icon': LucideIcons.milk,
      'badge': 'DAIRY DECISION-SUPPORT',
      'color': AppTheme.earthBrown,
    },
    {
      'title': 'Monitor Silage Pit Heating.',
      'subtitle': 'Real-time telemetry monitoring pit pH, temperature spikes, moisture, and spoilage risk indicators.',
      'icon': LucideIcons.flame,
      'badge': 'SILAGE TELEMETRY',
      'color': const Color(0xFF8B4513),
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgOffWhite,
      body: SafeArea(
        child: Column(
          children: [
            // Top Header Bar with Skip Button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: AppTheme.primaryDark,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Center(
                          child: Text(
                            '360',
                            style: TextStyle(
                              color: AppTheme.accentMint,
                              fontWeight: FontWeight.w900,
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'FeedSure 360',
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          fontSize: 16,
                          color: AppTheme.primaryDark,
                        ),
                      ),
                    ],
                  ),
                  TextButton(
                    onPressed: widget.onFinishOnboarding,
                    child: const Text(
                      'SKIP',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primaryMedium,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Onboarding PageView
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: (idx) => setState(() => _currentPage = idx),
                itemCount: _pages.length,
                itemBuilder: (context, index) {
                  final page = _pages[index];
                  return Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Visual Card Container
                        Container(
                          width: double.infinity,
                          height: 240,
                          decoration: BoxDecoration(
                            color: page['color'],
                            borderRadius: BorderRadius.circular(28),
                            boxShadow: [
                              BoxShadow(
                                color: (page['color'] as Color).withOpacity(0.3),
                                blurRadius: 20,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          child: Stack(
                            children: [
                              Center(
                                child: Icon(
                                  page['icon'] as IconData,
                                  size: 96,
                                  color: AppTheme.accentMint.withOpacity(0.9),
                                ),
                              ),
                              Positioned(
                                top: 16,
                                left: 16,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.white12,
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(color: Colors.white24),
                                  ),
                                  child: Text(
                                    page['badge'],
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 10,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 36),

                        Text(
                          page['title'],
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.displayLarge?.copyWith(
                                fontSize: 26,
                                height: 1.2,
                              ),
                        ),
                        const SizedBox(height: 12),

                        Text(
                          page['subtitle'],
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: AppTheme.textMuted,
                                fontSize: 14,
                                height: 1.5,
                              ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),

            // Page Indicator Dots & Next / Finish Button
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Dots
                  Row(
                    children: List.generate(
                      _pages.length,
                      (idx) => AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        margin: const EdgeInsets.only(right: 6),
                        width: _currentPage == idx ? 24 : 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: _currentPage == idx ? AppTheme.primaryDark : Colors.black12,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ),
                  ),

                  // Action Button
                  ElevatedButton(
                    onPressed: () {
                      if (_currentPage < _pages.length - 1) {
                        _pageController.nextPage(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeInOut,
                        );
                      } else {
                        widget.onFinishOnboarding();
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryDark,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(_currentPage == _pages.length - 1 ? 'GET STARTED' : 'NEXT'),
                        const SizedBox(width: 8),
                        const Icon(LucideIcons.arrowRight, size: 18),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
