import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../config/theme.dart';
import 's14_storage_monitoring_screen.dart';

class S13FeedBasketScreen extends StatefulWidget {
  const S13FeedBasketScreen({Key? key}) : super(key: key);

  @override
  State<S13FeedBasketScreen> createState() => _S13FeedBasketScreenState();
}

class _S13FeedBasketScreenState extends State<S13FeedBasketScreen> {
  final List<Map<String, dynamic>> _inventory = [
    {'name': 'Green Fodder (Maize / Napier)', 'qty': 120, 'unit': 'kg', 'category': 'Fodder'},
    {'name': 'Dry Wheat Straw (Bhoosa)', 'qty': 80, 'unit': 'kg', 'category': 'Fodder'},
    {'name': 'Corn Silage Pit A', 'qty': 200, 'unit': 'kg', 'category': 'Silage'},
    {'name': 'Commercial Cattle Feed', 'qty': 50, 'unit': 'kg', 'category': 'Concentrate'},
    {'name': 'Mustard Oil Cake', 'qty': 30, 'unit': 'kg', 'category': 'Protein'},
    {'name': 'Wheat Bran (Choker)', 'qty': 40, 'unit': 'kg', 'category': 'Fiber'},
    {'name': 'Chelated Mineral Mixture', 'qty': 5, 'unit': 'kg', 'category': 'Supplements'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: Text(
          'Feed Basket & Stock',
          style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        backgroundColor: AppTheme.primaryColor,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.plus, color: Colors.white),
            onPressed: _showAddStockDialog,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Total Inventory Header Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppTheme.primaryColor,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.accentColor,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(LucideIcons.boxes, color: AppTheme.primaryColor, size: 28),
                  ),
                  const SizedBox(width: 14),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'TOTAL STOCK AVAILABLE',
                        style: GoogleFonts.outfit(color: AppTheme.accentColor, fontWeight: FontWeight.w900, fontSize: 11),
                      ),
                      Text(
                        '525 kg Feed On-Farm',
                        style: GoogleFonts.outfit(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        'Estimated coverage: 7 Days for 10 Cows',
                        style: GoogleFonts.outfit(color: Colors.white70, fontSize: 12),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Ingredient Stock List',
                  style: GoogleFonts.outfit(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryColor,
                  ),
                ),
                TextButton.icon(
                  onPressed: _showAddStockDialog,
                  icon: Icon(LucideIcons.plus, size: 16, color: AppTheme.primaryColor),
                  label: Text('Add Item', style: GoogleFonts.outfit(color: AppTheme.primaryColor, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 10),

            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _inventory.length,
              itemBuilder: (context, index) {
                final item = _inventory[index];
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
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppTheme.lightMint,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(LucideIcons.package, color: AppTheme.primaryColor, size: 20),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item['name'],
                              style: GoogleFonts.outfit(
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                                color: Colors.black87,
                              ),
                            ),
                            Text(
                              'Category: ${item['category']}',
                              style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey.shade600),
                            ),
                          ],
                        ),
                      ),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(LucideIcons.minus, size: 18, color: Colors.grey),
                            onPressed: () {
                              if (item['qty'] > 0) {
                                setState(() => item['qty'] -= 5);
                              }
                            },
                          ),
                          Text(
                            '${item['qty']} ${item['unit']}',
                            style: GoogleFonts.outfit(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                              color: AppTheme.primaryColor,
                            ),
                          ),
                          IconButton(
                            icon: Icon(LucideIcons.plus, size: 18, color: AppTheme.primaryColor),
                            onPressed: () {
                              setState(() => item['qty'] += 5);
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),

            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const S14StorageMonitoringScreen()),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryColor,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                icon: const Icon(LucideIcons.thermometer, color: Colors.white),
                label: Text(
                  'Check Silage & Storage Sensors',
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

  void _showAddStockDialog() {
    final TextEditingController nameCtrl = TextEditingController();
    final TextEditingController qtyCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Add New Stock Item', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameCtrl,
              decoration: const InputDecoration(labelText: 'Ingredient Name'),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: qtyCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Quantity (kg)'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              if (nameCtrl.text.isNotEmpty && qtyCtrl.text.isNotEmpty) {
                setState(() {
                  _inventory.add({
                    'name': nameCtrl.text,
                    'qty': int.tryParse(qtyCtrl.text) ?? 10,
                    'unit': 'kg',
                    'category': 'Fodder',
                  });
                });
                Navigator.pop(ctx);
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryColor),
            child: const Text('Add Item', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
