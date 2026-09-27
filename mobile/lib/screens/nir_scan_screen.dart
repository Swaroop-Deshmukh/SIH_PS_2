import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:google_fonts/google_fonts.dart';
import '../config/theme.dart';

class NirScanScreen extends StatefulWidget {
  final VoidCallback onScanComplete;

  const NirScanScreen({super.key, required this.onScanComplete});

  @override
  State<NirScanScreen> createState() => _NirScanScreenState();
}

class _NirScanScreenState extends State<NirScanScreen> {
  String _selectedMode = 'Absorbance';
  String _bottomTab = 'Normal';
  bool _isScanning = false;
  bool _continuousMode = false;

  void _triggerScan() {
    setState(() => _isScanning = true);
    Future.delayed(const Duration(milliseconds: 1500), () {
      if (mounted) {
        setState(() => _isScanning = false);
        widget.onScanComplete();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.blue, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Scan',
          style: GoogleFonts.plusJakartaSans(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 18),
        ),
        actions: [
          TextButton(
            onPressed: () {},
            child: Text('Configure', style: GoogleFonts.plusJakartaSans(color: Colors.blue, fontSize: 14)),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Filled Absorbance Spectral Graph matching Image 5
              Container(
                height: 180,
                width: double.infinity,
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: LineChart(
                  LineChartData(
                    gridData: const FlGridData(show: true, drawVerticalLine: true),
                    titlesData: FlTitlesData(
                      leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 28)),
                      bottomTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          getTitlesWidget: (val, meta) {
                            if (val == 0) return const Text('900');
                            if (val == 2) return const Text('1100');
                            if (val == 4) return const Text('1300');
                            if (val == 6) return const Text('1500');
                            if (val == 8) return const Text('1700');
                            return const Text('');
                          },
                        ),
                      ),
                    ),
                    borderData: FlBorderData(show: true, border: Border.all(color: Colors.grey.shade300)),
                    lineBarsData: [
                      LineChartBarData(
                        spots: const [
                          FlSpot(0, 0.4),
                          FlSpot(1, 0.6),
                          FlSpot(2, 0.8),
                          FlSpot(3, 0.75),
                          FlSpot(4, 0.9),
                          FlSpot(5, 1.5),
                          FlSpot(6, 1.55),
                          FlSpot(7, 1.35),
                          FlSpot(8, 1.9),
                        ],
                        isCurved: true,
                        color: Colors.blue.shade700,
                        barWidth: 2,
                        belowBarData: BarAreaData(
                          show: true,
                          color: Colors.blue.shade200.withValues(alpha: 0.6),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // Segmented Buttons matching Image 5
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: ['Reflectance', 'Absorbance', 'Intensity', 'Reference'].map((mode) {
                  final isSel = _selectedMode == mode;
                  return InkWell(
                    onTap: () => setState(() => _selectedMode = mode),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: isSel ? Colors.grey.shade200 : Colors.transparent,
                        borderRadius: BorderRadius.circular(8),
                        border: isSel ? Border.all(color: Colors.grey.shade400) : null,
                      ),
                      child: Text(
                        mode,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                          color: isSel ? Colors.black : Colors.grey.shade600,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),

              // Configuration Metrics Grid matching Image 5
              _buildConfigRow('Lamp-Stable Time (ms)', '625'),
              _buildConfigRow('Scan Configuration', 'Column 1'),
              _buildConfigRow('Spectral Range Start', '900 nm'),
              _buildConfigRow('Spectral Range End', '1700 nm'),
              _buildConfigRow('D-Res. (pts)', '228 Pts'),
              _buildConfigRow('Scan Width', '7.02 nm'),
              _buildConfigRow('Exposure Time', '0.635 ms'),
              _buildConfigRow('Number Of Scans To Average', '6 times'),

              // Continuous Toggle
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Continuous Scan Mode', style: TextStyle(fontSize: 13, color: Colors.brown)),
                    Switch(
                      value: _continuousMode,
                      onChanged: (val) => setState(() => _continuousMode = val),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Big Red Start Scan Button matching Image 5
              Center(
                child: TextButton(
                  onPressed: _isScanning ? null : _triggerScan,
                  child: _isScanning
                      ? const CircularProgressIndicator(color: Colors.red)
                      : Text(
                          'Start Scan',
                          style: GoogleFonts.plusJakartaSans(
                            color: Colors.red.shade700,
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 20),

              // Bottom Bar: Normal | Quick Set | Manual | Maintain
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: ['Normal', 'Quick Set', 'Manual', 'Maintain'].map((tab) {
                    final isSel = _bottomTab == tab;
                    return InkWell(
                      onTap: () => setState(() => _bottomTab = tab),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSel ? Colors.white : Colors.transparent,
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: isSel ? [const BoxShadow(color: Colors.black12, blurRadius: 4)] : null,
                        ),
                        child: Text(
                          tab,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                            color: isSel ? Colors.black : Colors.grey.shade600,
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildConfigRow(String label, String val) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 13, color: Colors.brown)),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: Colors.grey.shade300),
            ),
            child: Text(
              val,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black),
            ),
          ),
        ],
      ),
    );
  }
}
