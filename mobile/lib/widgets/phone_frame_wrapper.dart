import 'package:flutter/material.dart';

class PhoneFrameWrapper extends StatelessWidget {
  final Widget child;

  const PhoneFrameWrapper({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        // If screen width is wider than 600px (Desktop / Laptop Browser View), wrap in Mobile Phone Bezel Frame
        if (constraints.maxWidth > 600) {
          return Scaffold(
            backgroundColor: const Color(0xFF1E2421), // Sleek dark backdrop
            body: Stack(
              children: [
                // Subtle Background Pattern & Branding
                Positioned.fill(
                  child: Container(
                    decoration: const BoxDecoration(
                      gradient: RadialGradient(
                        colors: [Color(0xFF2A3630), Color(0xFF121714)],
                        radius: 1.2,
                      ),
                    ),
                  ),
                ),
                Positioned(
                  top: 24,
                  left: 32,
                  child: Row(
                    children: const [
                      Icon(Icons.smartphone_rounded, color: Color(0xFF74C69D), size: 20),
                      SizedBox(width: 8),
                      Text(
                        'FeedSure 360 Mobile App Simulator (Android Mode)',
                        style: TextStyle(
                          color: Colors.white70,
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),

                // Centered Phone Device Mockup Frame
                Center(
                  child: Container(
                    width: 412, // Standard Android Width (e.g. Pixel 7 / Samsung Galaxy)
                    height: 840,
                    margin: const EdgeInsets.symmetric(vertical: 24),
                    decoration: BoxDecoration(
                      color: Colors.black,
                      borderRadius: BorderRadius.circular(48), // Rounded phone corners
                      border: Border.all(color: const Color(0xFF333D37), width: 12), // Device Bezel
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.6),
                          blurRadius: 40,
                          spreadRadius: 8,
                          offset: const Offset(0, 20),
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(36),
                      child: Stack(
                        children: [
                          // Mobile App View inside frame
                          Positioned.fill(child: child),

                          // Top Camera Cutout / Punch Hole Notch
                          Positioned(
                            top: 10,
                            left: 0,
                            right: 0,
                            child: Center(
                              child: Container(
                                width: 80,
                                height: 20,
                                decoration: BoxDecoration(
                                  color: Colors.black,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Container(
                                      width: 8,
                                      height: 8,
                                      decoration: const BoxDecoration(
                                        color: Color(0xFF1A1A1A),
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Container(
                                      width: 4,
                                      height: 4,
                                      decoration: const BoxDecoration(
                                        color: Colors.blueAccent,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        }

        // Real Mobile Screen View (narrow width <= 600px): Render full screen naturally
        return child;
      },
    );
  }
}
