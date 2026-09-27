import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/theme.dart';
import 's02_login_screen.dart';
import 's03_signup_screen.dart';

class S01SplashScreen extends StatelessWidget {
  final VoidCallback? onGetStarted;
  final VoidCallback? onLogin;

  const S01SplashScreen({
    super.key,
    this.onGetStarted,
    this.onLogin,
  });

  @override
  Widget build(BuildContext context) {
    final handleGetStarted = onGetStarted ??
        () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const S03SignUpScreen()),
          );
        };

    final handleLogin = onLogin ??
        () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const S02LoginScreen()),
          );
        };

    return Scaffold(
      body: Stack(
        children: [
          // Background pasture gradient & decorative cattle shape
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF134E32), Color(0xFF0B3320), Color(0xFF061E13)],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),
          
          Positioned(
            top: 100,
            left: 0,
            right: 0,
            child: Center(
              child: Column(
                children: [
                  Container(
                    width: 72,
                    height: 72,
                    decoration: const BoxDecoration(
                      color: AppTheme.mintAccent,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.eco_rounded, color: AppTheme.deepGreen, size: 44),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'FeedSure 360',
                    style: GoogleFonts.plusJakartaSans(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Better Feed. Healthier Cows.\nHigher Yields.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.plusJakartaSans(
                      color: Colors.white70,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      height: 1.3,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Bottom Action Buttons
          Positioned(
            bottom: 40,
            left: 24,
            right: 24,
            child: Column(
              children: [
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: handleGetStarted,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.mintAccent,
                      foregroundColor: AppTheme.deepGreen,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: const Text('Get Started'),
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: handleLogin,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: Colors.white54, width: 1.5),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: const Text('Login', style: TextStyle(fontWeight: FontWeight.bold)),
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
