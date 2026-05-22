import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  final SharedPreferences _prefs;
  final http.Client _client;

  // Private constructor for internal use
  ApiService._({required SharedPreferences prefs, http.Client? client})
    : _prefs = prefs,
      _client = client ?? http.Client();

  static Future<ApiService> create({http.Client? client}) async {
    final prefs = await SharedPreferences.getInstance();
    return ApiService._(prefs: prefs, client: client);
  }

  String get baseHost {
    final host = _prefs.getString('server_host');
    if (host == null || host.isEmpty) {
      throw ApiException(statusCode: 0, message: 'Адрес сервера не настроен');
    }
    return 'https://$host';
  }

  String get baseUrl {
    return '$baseHost/api/v1';
  }

  Future<Map<String, dynamic>> _request(
    String path, {
    String method = 'GET',
    Object? body,
  }) async {
    final uri = Uri.parse('$baseUrl$path');

    // multipart/form-data
    if (body is http.MultipartRequest) {
      final request = http.MultipartRequest(method, uri);
      request.headers.addAll(body.headers);
      request.fields.addAll(body.fields);
      request.files.addAll(body.files);

      final streamedResponse = await _client.send(request);
      final response = await http.Response.fromStream(streamedResponse);
      return _handleResponse(response);
    }

    final request = http.Request(method, uri);

    if (body != null) {
      if (body is Map<String, String>) {
        // x-www-form-urlencoded
        request.body = Uri(queryParameters: body).query;
        request.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
    }

    final streamedResponse = await _client.send(request);
    final response = await http.Response.fromStream(streamedResponse);
    return _handleResponse(response);
  }

  // Handling server response
  Map<String, dynamic> _handleResponse(http.Response response) {
    if (response.statusCode == 204) {
      return {};
    }

    final data = response.body.isNotEmpty
        ? jsonDecode(response.body) as Map<String, dynamic>
        : <String, dynamic>{};

    if (response.statusCode >= 400) {
      throw ApiException(
        statusCode: response.statusCode,
        message: data['error'] as String? ?? 'Ошибка запроса',
      );
    }

    return data;
  }

  // GET request
  Future<Map<String, dynamic>> get(String path) => _request(path);
  // POST request
  Future<Map<String, dynamic>> post(String path, {Object? body}) =>
      _request(path, method: 'POST', body: body);
  // PATCH request
  Future<Map<String, dynamic>> patch(String path, {Object? body}) =>
      _request(path, method: 'PATCH', body: body);
  // PUT request
  Future<Map<String, dynamic>> put(String path, {Object? body}) =>
      _request(path, method: 'PUT', body: body);
  // DELETE request
  Future<Map<String, dynamic>> delete(String path) =>
      _request(path, method: 'DELETE');

  void dispose() => _client.close();
}

class ApiException implements Exception {
  final int statusCode;
  final String message;

  const ApiException({required this.statusCode, required this.message});

  @override
  String toString() => 'ApiException($statusCode): $message';
}
