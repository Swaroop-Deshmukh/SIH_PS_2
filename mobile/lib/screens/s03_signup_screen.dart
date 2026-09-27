import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/theme.dart';
import 'main_navigation_screen.dart';
import 's02_login_screen.dart';

class S03SignUpScreen extends StatelessWidget {
  final VoidCallback? onSignUpSuccess;
  final VoidCallback? onGoToLogin;

  const S03SignUpScreen({
    super.key,
    this.onSignUpSuccess,
    this.onGoToLogin,
  });

  @override
  Widget build(BuildContext context) {
    final handleSignUp = onSignUpSuccess ??
        () {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => const MainNavigationScreen()),
          );
        };

    final handleLogin = onGoToLogin ??
        () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const S02LoginScreen()),
          );
        };

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(backgroundColor: Colors.white, elevation: 0, leading: const BackButton(color: AppTheme.textDark)),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.eco_rounded, color: AppTheme.forestGreen, size: 28),
                  const SizedBox(width: 8),
                  Text('FeedSure 360', style: GoogleFonts.plusJakartaSans(fontSize: 20, fontWeight: FontWeight.w900, color: AppTheme.forestGreen)),
                ],
              ),
              const SizedBox(height: 20),
              Text('Create Your Account', style: GoogleFonts.plusJakartaSans(fontSize: 22, fontWeight: FontWeight.w900)),
              const SizedBox(height: 4),
              Text('Join thousands of dairy farmers', style: GoogleFonts.plusJakartaSans(color: AppTheme.textMuted, fontSize: 13)),
              const SizedBox(height: 24),

              Text('Full Name', style: GoogleFonts.plusJakartaSans(fontSize: 12, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              TextField(
                decoration: InputDecoration(
                  hintText: 'Enter your name',
                  filled: true,
                  fillColor: AppTheme.bgLight,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 14),

              Text('Mobile Number', style: GoogleFonts.plusJakartaSans(fontSize: 12, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              TextField(
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(
                  hintText: 'Enter your mobile number',
                  filled: true,
                  fillColor: AppTheme.bgLight,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 14),

              Text('Location', style: GoogleFonts.plusJakartaSans(fontSize: 12, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                items: const [
                  DropdownMenuItem(value: 'pune', child: Text('Pune Region, Maharashtra')),
                  DropdownMenuItem(value: 'anand', child: Text('Anand Region, Gujarat')),
                  DropdownMenuItem(value: 'karnal', child: Text('Karnal Region, Haryana')),
                ],
                onChanged: (_) {},
                decoration: InputDecoration(
                  hintText: 'Select your location',
                  filled: true,
                  fillColor: AppTheme.bgLight,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 14),

              Text('Password', style: GoogleFonts.plusJakartaSans(fontSize: 12, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              TextField(
                obscureText: true,
                decoration: InputDecoration(
                  hintText: 'Create a password',
                  filled: true,
                  fillColor: AppTheme.bgLight,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: handleSignUp,
                  child: const Text('Sign Up'),
                ),
              ),
              const SizedBox(height: 24),

              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Already have an account? ', style: TextStyle(fontSize: 13, color: AppTheme.textMuted)),
                  GestureDetector(
                    onTap: handleLogin,
                    child: const Text('Login', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.forestGreen)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
