import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../config/theme.dart';
import 's12_ration_advisory_screen.dart';

class S11DairyNutritionProfileScreen extends StatefulWidget {
  const S11DairyNutritionProfileScreen({Key? key}) : super(key: key);

  @override
  State<S11DairyNutritionProfileScreen> createState() => _S11DairyNutritionProfileScreenState();
}

class _S11DairyNutritionProfileScreenState extends State<S11DairyNutritionProfileScreen> {
  int _animalCount = 10;
  int _milkYield = 12;
  String _selectedGroup = 'Lactating Cows';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: Text(
          'Dairy Profile & Herd',
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
            Text(
              'Herd Configuration',
              style: GoogleFonts.outfit(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryColor,
              ),
            ),
            const SizedBox(height: 14),

            // Animals Count Card
            _buildCounterCard(
              title: 'Total Animals in Group',
              subtitle: 'Number of active milking cows',
              value: '$_animalCount',
              onDecrement: () {
                if (_animalCount > 1) setState(() => _animalCount--);
              },
              onIncrement: () => setState(() => _animalCount++),
            ),

            const SizedBox(height: 12),

            // Group Selection Dropdown / Chips
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Target Animal Category',
                    style: GoogleFonts.outfit(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: ['Lactating Cows', 'Dry Cows', 'Heifers', 'Buffaloes'].map((cat) {
                      final isSelected = _selectedGroup == cat;
                      return ChoiceChip(
                        label: Text(cat),
                        selected: isSelected,
                        onSelected: (sel) {
                          if (sel) setState(() => _selectedGroup = cat);
                        },
                        selectedColor: AppTheme.primaryColor,
                        labelStyle: GoogleFonts.outfit(
                          color: isSelected ? Colors.white : Colors.black87,
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                        backgroundColor: Colors.grey.shade100,
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // Milk Yield Counter
            _buildCounterCard(
              title: 'Avg Milk Yield per Cow',
              subtitle: 'Liters / day / animal',
              value: '$_milkYield L',
              onDecrement: () {
                if (_milkYield > 1) setState(() => _milkYield--);
              },
              onIncrement: () => setState(() => _milkYield++),
            ),

            const SizedBox(height: 24),
            Text(
              'Current Ration Summary',
              style: GoogleFonts.outfit(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppTheme.primaryColor,
              ),
            ),
            const SizedBox(height: 12),

            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                children: [
                  _buildIngredientRow('Green Fodder (Maize/Napier)', '25 kg / cow'),
                  const Divider(height: 16),
                  _buildIngredientRow('Dry Fodder (Wheat Straw)', '5 kg / cow'),
                  const Divider(height: 16),
                  _buildIngredientRow('Concentrate Feed', '4 kg / cow'),
                  const Divider(height: 16),
                  _buildIngredientRow('Mustard Oil Cake', '1.5 kg / cow'),
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
                    MaterialPageRoute(builder: (_) => const S12RationAdvisoryScreen()),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryColor,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                icon: const Icon(LucideIcons.calculator, color: Colors.white),
                label: Text(
                  'Assess Current Ration',
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

  Widget _buildCounterCard({
    required String title,
    required String subtitle,
    required String value,
    required VoidCallback onDecrement,
    required VoidCallback onIncrement,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.outfit(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    color: Colors.black87,
                  ),
                ),
                Text(
                  subtitle,
                  style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey.shade600),
                ),
              ],
            ),
          ),
          Row(
            children: [
              IconButton(
                onPressed: onDecrement,
                icon: const Icon(LucideIcons.minusCircle, color: Colors.grey),
              ),
              Text(
                value,
                style: GoogleFonts.outfit(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.primaryColor,
                ),
              ),
              IconButton(
                onPressed: onIncrement,
                icon: Icon(LucideIcons.plusCircle, color: AppTheme.primaryColor),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildIngredientRow(String name, String qty) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          name,
          style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black87),
        ),
        Text(
          qty,
          style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold, color: AppTheme.primaryColor),
        ),
      ],
    );
  }
}
