import 'package:flutter/material.dart';
import 'dart:io';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import '../config/theme.dart';
import 's08_analysis_progress_screen.dart';

class S07CameraScanScreen extends StatefulWidget {
  final VoidCallback? onPhotoCaptured;
  final String? feedType;

  const S07CameraScanScreen({super.key, this.onPhotoCaptured, this.feedType});

  @override
  State<S07CameraScanScreen> createState() => _S07CameraScanScreenState();
}

class _S07CameraScanScreenState extends State<S07CameraScanScreen> {
  XFile? _capturedImage;
  final ImagePicker _picker = ImagePicker();

  Future<XFile?> _pickImage(ImageSource source) async {
    try {
      return await _picker.pickImage(source: source, imageQuality: 85);
    } catch (error) {
      if (mounted)
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Could not open camera or photo library: $error'),
          ),
        );
      return null;
    }
  }

  Future<void> _captureAndContinue(ImageSource source) async {
    final photo = await _pickImage(source);
    if (!mounted) return;
    if (photo == null) return;
    setState(() => _capturedImage = photo);
    if (widget.onPhotoCaptured != null) {
      widget.onPhotoCaptured!();
    } else {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => S08AnalysisProgressScreen(
            feedType: widget.feedType ?? "Maize Silage",
            imagePath: photo.path,
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: const Text(
          'Feed Analysis - Scan',
          style: TextStyle(color: Colors.white),
        ),
        leading: const BackButton(color: Colors.white),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: Stack(
                children: [
                  // Real Captured Image or Viewfinder Mockup Background
                  Positioned.fill(
                    child: Container(
                      color: Colors.grey.shade900,
                      child: _capturedImage != null
                          ? Image.file(
                              File(_capturedImage!.path),
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) =>
                                  _buildMockViewfinder(),
                            )
                          : _buildMockViewfinder(),
                    ),
                  ),

                  // Green Corner Brackets Overlay matching Screen 7
                  Center(
                    child: Container(
                      width: 280,
                      height: 280,
                      decoration: BoxDecoration(
                        border: Border.all(
                          color: AppTheme.mintAccent,
                          width: 3,
                        ),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Stack(
                        children: [
                          Positioned(
                            top: 8,
                            left: 8,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.black54,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Text(
                                'Target Area',
                                style: TextStyle(
                                  color: AppTheme.mintAccent,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Instruction Text Overlay
                  Positioned(
                    bottom: 30,
                    left: 20,
                    right: 20,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        vertical: 12,
                        horizontal: 16,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.75),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        children: [
                          Text(
                            'Feed Surface & Visual Screening',
                            style: GoogleFonts.plusJakartaSans(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Pixel-level analysis checks texture uniformity, color distribution, and surface anomalies.',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Bottom Shutter Bar matching Screen 7 Stepper (Scan - Shutter Button - Results)
            Container(
              padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
              color: Colors.white,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  IconButton(
                    icon: const Icon(
                      Icons.photo_library_outlined,
                      color: AppTheme.forestGreen,
                      size: 28,
                    ),
                    onPressed: () async {
                      await _captureAndContinue(ImageSource.gallery);
                    },
                    tooltip: 'Upload from Gallery',
                  ),

                  // Camera Shutter Button
                  InkWell(
                    onTap: () async {
                      await _captureAndContinue(ImageSource.camera);
                    },
                    child: Container(
                      width: 64,
                      height: 64,
                      decoration: const BoxDecoration(
                        color: AppTheme.forestGreen,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(color: Colors.black26, blurRadius: 8),
                        ],
                      ),
                      child: const Icon(
                        Icons.camera_alt,
                        color: Colors.white,
                        size: 32,
                      ),
                    ),
                  ),

                  const SizedBox(width: 48),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMockViewfinder() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: const [
        Icon(Icons.grass, size: 80, color: Colors.white24),
        SizedBox(height: 12),
        Text(
          'Camera Preview Ready',
          style: TextStyle(color: Colors.white54, fontSize: 13),
        ),
      ],
    );
  }
}
