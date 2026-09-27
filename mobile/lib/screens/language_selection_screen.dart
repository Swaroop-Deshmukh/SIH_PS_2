import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/theme.dart';

class LanguageSelectionScreen extends StatefulWidget {
  final Function(String lang) onSelectLanguage;

  const LanguageSelectionScreen({super.key, required this.onSelectLanguage});

  @override
  State<LanguageSelectionScreen> createState() => _LanguageSelectionScreenState();
}

class _LanguageSelectionScreenState extends State<LanguageSelectionScreen> {
  String _selected = 'en';

  final List<Map<String, String>> _langs = const [
    {'id': 'en', 'name': 'English', 'flag': '🇬🇧', 'native': 'English'},
    {'id': 'hi', 'name': 'Hindi', 'flag': '🇮🇳', 'native': 'हिन्दी'},
    {'id': 'mr', 'name': 'Marathi', 'flag': '🚩', 'native': 'मराठी'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgOffWhite,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 32),
              Text(
                'Choose Your Language',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  color: AppTheme.primaryDark,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'भाषा चुनें • भाषा निवडा',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 14,
                  color: AppTheme.textMuted,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 32),

              ..._langs.map((l) {
                final isSel = _selected == l['id'];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: InkWell(
                    onTap: () => setState(() => _selected = l['id']!),
                    borderRadius: BorderRadius.circular(18),
                    child: Container(
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: isSel ? AppTheme.primaryDark : Colors.white,
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(
                          color: isSel ? AppTheme.accentLight : const Color(0xFFE2D9CD),
                          width: 2,
                        ),
                      ),
                      child: Row(
                        children: [
                          Text(l['flag']!, style: const TextStyle(fontSize: 24)),
                          const SizedBox(width: 16),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                l['name']!,
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                  color: isSel ? Colors.white : AppTheme.textDark,
                                ),
                              ),
                              Text(
                                l['native']!,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: isSel ? Colors.white70 : AppTheme.textMuted,
                                ),
                              ),
                            ],
                          ),
                          const Spacer(),
                          if (isSel)
                            const Icon(Icons.check_circle_rounded, color: AppTheme.accentMint, size: 24),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),

              const Spacer(),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => widget.onSelectLanguage(_selected),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryDark,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  child: Text(
                    'CONTINUE',
                    style: GoogleFonts.plusJakartaSans(
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                      letterSpacing: 1.0,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
