import 'role.dart';

class User {
  final String id;
  final String createdAt;
  final String updatedAt;
  final String email;
  final String firstName;
  final String? middleName;
  final String lastName;
  final bool hasAvatar;
  final List<Role> roles;

  const User({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.email,
    required this.firstName,
    this.middleName,
    required this.lastName,
    required this.hasAvatar,
    required this.roles,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'id': String id,
        'createdAt': String createdAt,
        'updatedAt': String updatedAt,
        'email': String email,
        'firstName': String firstName,
        'middleName': String? middleName,
        'lastName': String lastName,
        'hasAvatar': bool hasAvatar,
        'roles': List<dynamic> roles,
      } =>
        User(
          id: id,
          createdAt: createdAt,
          updatedAt: updatedAt,
          email: email,
          firstName: firstName,
          middleName: middleName,
          lastName: lastName,
          hasAvatar: hasAvatar,
          roles: roles
              .map((e) => Role.fromJson(e as Map<String, dynamic>))
              .toList(),
        ),
      _ => throw const FormatException('Не удалось загрузить пользователя'),
    };
  }
}
