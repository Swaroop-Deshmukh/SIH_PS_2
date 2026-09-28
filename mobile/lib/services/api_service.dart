import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import '../models/batch_analysis.dart';

class ApiService {
  static const String _configuredUrl = String.fromEnvironment(
    'FEEDSURE_API_URL',
  );
  static String get baseUrl => _configuredUrl.isNotEmpty
      ? _configuredUrl
      : defaultTargetPlatform == TargetPlatform.android
      ? 'http://10.0.2.2:8000/api'
      : 'http://localhost:8000/api';
  static Future<BatchAnalysisResponse> analyzeBatch({
    String feedType = 'Maize Silage',
    String scenario = 'healthy',
  }) async {
    final response = await http
        .post(
          Uri.parse('$baseUrl/analyze-batch'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'feed_type': feedType, 'scenario': scenario}),
        )
        .timeout(const Duration(seconds: 20));
    if (response.statusCode != 200) {
      String detail =
          'FeedSure API returned ' + response.statusCode.toString() + '.';
      try {
        final body = jsonDecode(response.body);
        if (body is Map && body['detail'] != null)
          detail = body['detail'].toString();
      } catch (_) {}
      throw Exception(detail);
    }
    return BatchAnalysisResponse.fromJson(jsonDecode(response.body));
  }

  static Future<Map<String, dynamic>> attachBatchImage({
    required String batchId,
    required String imagePath,
  }) async {
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('$baseUrl/batches/$batchId/images'),
    );
    request.files.add(await http.MultipartFile.fromPath('image', imagePath));
    final streamed = await request.send().timeout(const Duration(seconds: 30));
    final response = await http.Response.fromStream(streamed);
    final body = jsonDecode(response.body);
    if (response.statusCode != 200) {
      final detail = body is Map ? body['detail']?.toString() : null;
      throw Exception(
        detail ?? 'Photo upload failed (${response.statusCode}).',
      );
    }
    return Map<String, dynamic>.from(body as Map);
  }

  static Future<Map<String, dynamic>> analyzeFeedPhoto({
    required String imagePath,
    String feedType = 'Maize Silage',
  }) async {
    final uri = Uri.parse('$baseUrl/vision/feed-surface?feed_type=${Uri.encodeComponent(feedType)}');
    final request = http.MultipartRequest('POST', uri);
    request.files.add(await http.MultipartFile.fromPath('image', imagePath));
    final streamed = await request.send().timeout(const Duration(seconds: 30));
    final response = await http.Response.fromStream(streamed);
    final body = jsonDecode(response.body);
    if (response.statusCode != 200) {
      final detail = body is Map ? body['detail']?.toString() : null;
      throw Exception(detail ?? 'Visual screening failed (${response.statusCode}).');
    }
    return Map<String, dynamic>.from(body as Map);
  }

  static Future<Map<String, dynamic>> analyzeUreaStripPhoto({
    required String imagePath,
  }) async {
    final uri = Uri.parse('$baseUrl/vision/urea-strip');
    final request = http.MultipartRequest('POST', uri);
    request.files.add(await http.MultipartFile.fromPath('image', imagePath));
    final streamed = await request.send().timeout(const Duration(seconds: 30));
    final response = await http.Response.fromStream(streamed);
    final body = jsonDecode(response.body);
    if (response.statusCode != 200) {
      final detail = body is Map ? body['detail']?.toString() : null;
      throw Exception(detail ?? 'Urea strip test failed (${response.statusCode}).');
    }
    return Map<String, dynamic>.from(body as Map);
  }
}
