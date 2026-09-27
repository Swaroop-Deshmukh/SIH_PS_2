import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/theme.dart';
import 'main_navigation_screen.dart';
import 's03_signup_screen.dart';

class S02LoginScreen extends StatelessWidget {
  final VoidCallback? onLogin;
  final VoidCallback? onGoToSignUp;

  const S02LoginScreen({
    super.key,
    this.onLogin,
    this.onGoToSignUp,
  });

  @override
  Widget build(BuildContext context) {
    final handleLogin = onLogin ??
        () {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => const MainNavigationScreen()),
          );
        };

    final handleSignUp = onGoToSignUp ??
        () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const S03SignUpScreen()),
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
              const SizedBox(height: 24),
              Text('Welcome Back!', style: GoogleFonts.plusJakartaSans(fontSize: 24, fontWeight: FontWeight.w900)),
              const SizedBox(height: 4),
              Text('Login to continue', style: GoogleFonts.plusJakartaSans(color: AppTheme.textMuted, fontSize: 13)),
              const SizedBox(height: 32),

              Text('Mobile Number / Email', style: GoogleFonts.plusJakartaSans(fontSize: 12, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              TextField(
                decoration: InputDecoration(
                  hintText: 'Enter your mobile number or email',
                  filled: true,
                  fillColor: AppTheme.bgLight,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 16),

              Text('Password', style: GoogleFonts.plusJakartaSans(fontSize: 12, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              TextField(
                obscureText: true,
                decoration: InputDecoration(
                  hintText: 'Enter your password',
                  suffixIcon: const Icon(Icons.visibility_off_outlined, size: 20),
                  filled: true,
                  fillColor: AppTheme.bgLight,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                ),
              ),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () {},
                  child: const Text('Forgot Password?', style: TextStyle(fontSize: 12, color: AppTheme.forestGreen)),
                ),
              ),
              const SizedBox(height: 16),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: handleLogin,
                  child: const Text('Login'),
                ),
              ),
              const SizedBox(height: 16),

              Row(
                children: const [
                  Expanded(child: Divider()),
                  Padding(padding: EdgeInsets.symmetric(horizontal: 12), child: Text('or', style: TextStyle(fontSize: 12, color: AppTheme.textMuted))),
                  Expanded(child: Divider()),
                ],
              ),
              const SizedBox(height: 16),

              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: handleLogin,
                  icon: const Icon(Icons.g_mobiledata, size: 24, color: Colors.red),
                  label: const Text('Continue with Google', style: TextStyle(color: AppTheme.textDark)),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
              const SizedBox(height: 32),

              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text("Don't have an account? ", style: TextStyle(fontSize: 13, color: AppTheme.textMuted)),
                  GestureDetector(
                    onTap: handleSignUp,
                    child: const Text('Sign Up', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.forestGreen)),
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
