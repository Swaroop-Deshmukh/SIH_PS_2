import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/batch_analysis.dart';

class ApiService {
  static const String _configuredUrl = String.fromEnvironment('FEEDSURE_API_URL');

  static String get baseUrl => _configuredUrl.isNotEmpty
      ? _configuredUrl
      : defaultTargetPlatform == TargetPlatform.android
      ? 'http://10.0.2.2:8000/api'
      : 'http://localhost:8000/api';

  static const String _tokenKey = 'feedsure_jwt_token';
  static const String _offlineQueueKey = 'feedsure_offline_queue';

  // ── Auth & Token Storage ──────────────────────────────────────────────────
  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  static Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
  }

  static Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await http
        .post(
          Uri.parse('$baseUrl/auth/login'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({'username': username, 'password': password}),
        )
        .timeout(const Duration(seconds: 15));

    if (response.statusCode != 200) {
      throw Exception('Login failed (${response.statusCode}): ${response.body}');
    }

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (data.containsKey('access_token')) {
      await saveToken(data['access_token'] as String);
    }
    return data;
  }

  // ── Batch Analysis ────────────────────────────────────────────────────────
  static Future<BatchAnalysisResponse> analyzeBatch({
    String feedType = 'Maize Silage',
    String scenario = 'healthy',
  }) async {
    try {
      final token = await getToken();
      final headers = {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

      final response = await http
          .post(
            Uri.parse('$baseUrl/analyze-batch'),
            headers: headers,
            body: jsonEncode({'feed_type': feedType, 'scenario': scenario}),
          )
          .timeout(const Duration(seconds: 20));

      if (response.statusCode != 200) {
        String detail = 'FeedSure API returned ${response.statusCode}.';
        try {
          final body = jsonDecode(response.body);
          if (body is Map && body['detail'] != null) detail = body['detail'].toString();
        } catch (_) {}
        throw Exception(detail);
      }

      final parsed = BatchAnalysisResponse.fromJson(jsonDecode(response.body));
      return parsed;
    } catch (e) {
      // Offline fallback: Queue request for background sync
      await queueOfflineBatch({'feed_type': feedType, 'scenario': scenario, 'timestamp': DateTime.now().toIso8601String()});
      rethrow;
    }
  }

  // ── Batch History ─────────────────────────────────────────────────────────
  static Future<List<dynamic>> fetchBatchHistory({int limit = 50}) async {
    final response = await http
        .get(Uri.parse('$baseUrl/batches?limit=$limit'))
        .timeout(const Duration(seconds: 15));

    if (response.statusCode != 200) {
      throw Exception('Failed to fetch batch history (${response.statusCode})');
    }
    return jsonDecode(response.body) as List<dynamic>;
  }

  // ── Smart Feed Zone Telemetry ─────────────────────────────────────────────
  static Future<Map<String, dynamic>> fetchFeedZone({
    String zoneId = 'ZONE-01',
    String scenario = 'healthy',
    String feedType = 'Maize Silage',
  }) async {
    final uri = Uri.parse(
      '$baseUrl/feed-zone?zone_id=${Uri.encodeComponent(zoneId)}&scenario=${Uri.encodeComponent(scenario)}&feed_type=${Uri.encodeComponent(feedType)}',
    );
    final response = await http.get(uri).timeout(const Duration(seconds: 15));

    if (response.statusCode != 200) {
      throw Exception('Failed to fetch Smart Feed Zone data (${response.statusCode})');
    }
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  // ── Image & CV Attachments ────────────────────────────────────────────────
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
      throw Exception(detail ?? 'Photo upload failed (${response.statusCode}).');
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

  // ── Offline Queue Management (SharedPreferences) ─────────────────────────
  static Future<void> queueOfflineBatch(Map<String, dynamic> item) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getStringList(_offlineQueueKey) ?? [];
    raw.add(jsonEncode(item));
    await prefs.setStringList(_offlineQueueKey, raw);
  }

  static Future<List<Map<String, dynamic>>> getOfflineQueue() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getStringList(_offlineQueueKey) ?? [];
    return raw.map((s) => jsonDecode(s) as Map<String, dynamic>).toList();
  }

  static Future<int> syncOfflineQueue() async {
    final queue = await getOfflineQueue();
    if (queue.isEmpty) return 0;
    int synced = 0;
    for (final item in queue) {
      try {
        await analyzeBatch(
          feedType: item['feed_type'] as String? ?? 'Maize Silage',
          scenario: item['scenario'] as String? ?? 'healthy',
        );
        synced++;
      } catch (_) {
        break; // Stop syncing if connection is still unavailable
      }
    }
    if (synced > 0) {
      final prefs = await SharedPreferences.getInstance();
      final remaining = queue.sublist(synced).map((e) => jsonEncode(e)).toList();
      await prefs.setStringList(_offlineQueueKey, remaining);
    }
    return synced;
  }
}
