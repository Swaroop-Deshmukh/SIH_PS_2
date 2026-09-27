import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Master Design Palette matching Image media_1790488022134.jpg
  static const Color forestGreen = Color(0xFF0D5C3A);
  static const Color deepGreen = Color(0xFF063823);
  static const Color mintAccent = Color(0xFF2EE59D);
  static const Color lightMint = Color(0xFFE6F7F0);
  
  static const Color bgLight = Color(0xFFF4F7F5);
  static const Color bgSurface = Colors.white;
  static const Color textDark = Color(0xFF16201B);
  static const Color textMuted = Color(0xFF6B7C73);
  static const Color borderLight = Color(0xFFE2EAE5);

  static const Color trustGreen = Color(0xFF10B981);
  static const Color warningOrange = Color(0xFFF59E0B);
  static const Color dangerRed = Color(0xFFEF4444);

  // Alias getters for backwards compatibility across all screens
  static const Color primaryColor = forestGreen;
  static const Color secondaryColor = deepGreen;
  static const Color accentColor = mintAccent;
  static const Color backgroundColor = bgLight;
  static const Color primaryDark = forestGreen;
  static const Color primaryMedium = forestGreen;
  static const Color accentMint = mintAccent;
  static const Color bgOffWhite = bgLight;
  static const Color accentLight = lightMint;

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: forestGreen,
        primary: forestGreen,
        secondary: mintAccent,
        surface: bgSurface,
      ),
      scaffoldBackgroundColor: bgLight,
      textTheme: GoogleFonts.plusJakartaSansTextTheme().copyWith(
        displayLarge: GoogleFonts.plusJakartaSans(color: textDark, fontWeight: FontWeight.w900),
        titleLarge: GoogleFonts.plusJakartaSans(color: textDark, fontWeight: FontWeight.w800),
        titleMedium: GoogleFonts.plusJakartaSans(color: textDark, fontWeight: FontWeight.bold),
        bodyMedium: GoogleFonts.plusJakartaSans(color: textDark),
        bodySmall: GoogleFonts.plusJakartaSans(color: textMuted),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: forestGreen,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: forestGreen,
        unselectedItemColor: Color(0xFF94A3B8),
        type: BottomNavigationBarType.fixed,
        elevation: 12,
      ),
      cardTheme: CardThemeData(
        color: bgSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: borderLight, width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: forestGreen,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 15),
          textStyle: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800, fontSize: 15),
        ),
      ),
    );
  }
}
