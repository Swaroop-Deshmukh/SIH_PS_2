import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../config/theme.dart';
import 's11_dairy_nutrition_profile_screen.dart';

class S10ContaminantCheckScreen extends StatelessWidget {
  const S10ContaminantCheckScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: Text(
          'Contaminant Check',
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
            // Safe Banner Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.green.shade300, width: 1.5),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.green.shade600,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(LucideIcons.shieldCheck, color: Colors.white, size: 28),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'SAFE FOR LACTATING CATTLE',
                          style: GoogleFonts.outfit(
                            fontSize: 15,
                            fontWeight: FontWeight.w900,
                            color: Colors.green.shade900,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'All tested parameters are well within strict FSSAI / BIS safety thresholds.',
                          style: GoogleFonts.outfit(
                            fontSize: 12,
                            color: Colors.green.shade800,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),
            Text(
              'Evidence-Based Safety Screening',
              style: GoogleFonts.outfit(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryColor,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Rapid screening combining camera surface vision, NIR mineral indicators, and paper-strip colorimetry.',
              style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey.shade600),
            ),
            const SizedBox(height: 14),

            _buildContaminantTile('Urea Spiking (Paper Strip)', 'Negative / Amber', 'Passed (<0.3%)', true, LucideIcons.flaskConical),
            _buildContaminantTile('Surface Mould Patches (CV)', '< 0.5% pale clusters', 'Low Risk', true, LucideIcons.eye),
            _buildContaminantTile('Texture & Particle Uniformity', '92% Homogeneous', 'Optimal', true, LucideIcons.layers),
            _buildContaminantTile('Sand & Silica Indication', 'Normal Ash Proxy', 'Acceptable', true, LucideIcons.mountain),
            _buildContaminantTile('Toxin Risk Triage', 'No visual / thermal flags', 'Low Risk', true, LucideIcons.shieldCheck),

            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.amber.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.amber.shade300),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(LucideIcons.alertTriangle, color: Colors.amber.shade900, size: 18),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Scientific Notice: Camera vision and rapid paper strips are triage screening tools. They do not directly detect molecular aflatoxins. Laboratory ELISA/HPLC confirmation is advised for suspicious batches.',
                      style: GoogleFonts.outfit(fontSize: 11, color: Colors.amber.shade900),
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
                    MaterialPageRoute(builder: (_) => const S11DairyNutritionProfileScreen()),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryColor,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                icon: const Icon(LucideIcons.arrowRight, color: Colors.white),
                label: Text(
                  'Proceed to Dairy Profile',
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

  Widget _buildContaminantTile(String title, String detectedVal, String statusText, bool isSafe, IconData icon) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Icon(icon, color: isSafe ? AppTheme.primaryColor : Colors.red, size: 22),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.outfit(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: Colors.black87,
                  ),
                ),
                Text(
                  'Detected: $detectedVal',
                  style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey.shade600),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: isSafe ? Colors.green.shade100 : Colors.red.shade100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              statusText,
              style: GoogleFonts.outfit(
                color: isSafe ? Colors.green.shade900 : Colors.red.shade900,
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
