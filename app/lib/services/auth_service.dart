import 'api_service.dart';
import '../models/user.dart';

class AuthService {
  final ApiService _api;
  User? _user;

  AuthService(this._api);

  User? get user => _user;

  Future<bool> checkAuth() async {
    try {
      final data = await _api.get('/users/me');
      _user = User.fromJson(data['user'] as Map<String, dynamic>);
      return true;
    } on ApiException {
      _user = null;
      return false;
    }
  }

  Future<User> login(String email, String password) async {
    final data = await _api.post(
      '/auth/login',
      body: {'email': email, 'password': password},
    );
    _user = User.fromJson(data['user'] as Map<String, dynamic>);
    if (_user == null) {
      throw ApiException(
        statusCode: 500,
        message: 'Не удалось загрузить пользователя',
      );
    }
    return _user!;
  }

  Future<User> register(Map<String, String> formData) async {
    final data = await _api.post('/users', body: formData);
    _user = User.fromJson(data['user'] as Map<String, dynamic>);
    if (_user == null) {
      throw ApiException(
        statusCode: 500,
        message: 'Не удалось загрузить пользователя',
      );
    }
    return _user!;
  }

  Future<void> logout() async {
    try {
      await _api.post('/auth/logout');
    } on ApiException {
      // ingore error
    }
    _user = null;
  }
}
