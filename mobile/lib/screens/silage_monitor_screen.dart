import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../config/theme.dart';
import '../models/batch_analysis.dart';

class SilageMonitorScreen extends StatelessWidget {
  final StorageTelemetry storage;
  final Function(String scenario) onTriggerAnomaly;

  const SilageMonitorScreen({
    Key? key,
    required this.storage,
    required this.onTriggerAnomaly,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isWarning = storage.status == 'CRITICAL_WARNING' || storage.temperatureCelsius > 32;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.primaryDark,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'SILAGE PIT MONITORING',
                      style: TextStyle(color: AppTheme.accentMint, fontSize: 11, fontWeight: FontWeight.w900),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: Colors.white12, borderRadius: BorderRadius.circular(8)),
                      child: const Text('SIMULATED TELEMETRY', style: TextStyle(color: Colors.amber, fontSize: 9, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Text(
                  'Trench Pit #2 Status',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 20),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Telemetry Grid
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            childAspectRatio: 1.4,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            children: [
              _buildSensorTile('Fermentation pH', '${storage.ph}', 'Target: 3.8 – 4.2', LucideIcons.activity),
              _buildSensorTile('Pit Temperature', '${storage.temperatureCelsius}°C', isWarning ? 'Heating Warning' : 'Normal', LucideIcons.thermometer, isAlert: storage.temperatureCelsius > 32),
              _buildSensorTile('Silage Moisture', '${storage.moisturePct}%', 'Humidity: ${storage.humidityPct}%', LucideIcons.droplets),
              _buildSensorTile('Air Exposure', '${storage.exposureDays} Days', 'Risk Index: ${storage.spoilageRiskIndex}/100', LucideIcons.clock),
            ],
          ),
          const SizedBox(height: 20),

          // Anomaly Banner
          if (isWarning)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.red.shade300),
              ),
              child: Row(
                children: [
                  const Icon(LucideIcons.alertTriangle, color: Colors.red),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('STORAGE HEATING SPIKE ALERT', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.red, fontSize: 13)),
                        const SizedBox(height: 2),
                        Text('Pit temperature elevated to ${storage.temperatureCelsius}°C with pH ${storage.ph}. Aerobic spoilage active.', style: const TextStyle(fontSize: 11, color: Colors.black87)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 24),

          // Anomaly Trigger Controls for Presentation
          const Text('Telemetry Anomaly Triggers (Demo Controller)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  onPressed: () => onTriggerAnomaly('healthy'),
                  style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryDark),
                  child: const Text('NORMAL (24.5°C)', style: TextStyle(fontSize: 11)),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: ElevatedButton(
                  onPressed: () => onTriggerAnomaly('storage_warning'),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.orange.shade800),
                  child: const Text('HEATING (33.4°C)', style: TextStyle(fontSize: 11)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSensorTile(String title, String val, String sub, IconData icon, {bool isAlert = false}) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isAlert ? Colors.red.shade50 : Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: isAlert ? Colors.red.shade300 : const Color(0xFFE2D9CD)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: TextStyle(fontSize: 11, color: isAlert ? Colors.red : AppTheme.textMuted, fontWeight: FontWeight.bold)),
              Icon(icon, size: 16, color: isAlert ? Colors.red : AppTheme.primaryDark),
            ],
          ),
          Text(val, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: isAlert ? Colors.red : AppTheme.primaryDark)),
          Text(sub, style: TextStyle(fontSize: 10, color: isAlert ? Colors.red.shade700 : AppTheme.textMuted)),
        ],
      ),
    );
  }
}
