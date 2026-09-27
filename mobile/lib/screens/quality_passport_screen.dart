import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../config/theme.dart';
import '../models/batch_analysis.dart';

class QualityPassportScreen extends StatelessWidget {
  final BatchAnalysisResponse data;

  const QualityPassportScreen({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final passport = data.digitalTwin.passport;
    final hash = data.digitalTwin.integrityHash;

    return Scaffold(
      backgroundColor: AppTheme.bgOffWhite,
      appBar: AppBar(title: const Text('Feed Quality Passport')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [AppTheme.primaryDark, Color(0xFF122B20)],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppTheme.accentLight.withValues(alpha: 0.4), width: 1.5),
                  boxShadow: [
                    BoxShadow(color: AppTheme.primaryDark.withValues(alpha: 0.3), blurRadius: 20, offset: const Offset(0, 8)),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: const [
                            Icon(LucideIcons.shieldCheck, color: AppTheme.accentMint, size: 18),
                            SizedBox(width: 6),
                            Text('FEEDSURE QUALITY PASSPORT', style: TextStyle(color: AppTheme.accentMint, fontWeight: FontWeight.w900, fontSize: 11)),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(color: Colors.white12, borderRadius: BorderRadius.circular(8)),
                          child: Text(passport.verificationBadge, style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(passport.passportId, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 20)),
                    Text('Feed Type: ${data.feedType}', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                    const SizedBox(height: 20),

                    // SHA-256 Hash Box
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: Colors.black38, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white24)),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('SHA-256 INTEGRITY HASH', style: TextStyle(color: AppTheme.accentMint, fontSize: 10, fontWeight: FontWeight.w800)),
                              InkWell(
                                onTap: () {
                                  Clipboard.setData(ClipboardData(text: hash));
                                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Hash copied to clipboard!')));
                                },
                                child: const Icon(LucideIcons.copy, color: Colors.white70, size: 14),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          SelectableText(
                            hash,
                            style: const TextStyle(color: Colors.white, fontSize: 10, fontFamily: 'monospace'),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
