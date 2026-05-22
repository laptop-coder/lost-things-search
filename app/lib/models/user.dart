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

  factory User.fromJson(Map<String, dynamic> json) => User(
    id: json['id'] as String,
    createdAt: json['createdAt'] as String,
    updatedAt: json['updatedAt'] as String,
    email: json['email'] as String,
    firstName: json['firstName'] as String,
    middleName: json['middleName'] as String?,
    lastName: json['lastName'] as String,
    hasAvatar: json['hasAvatar'] as bool,
    roles: json['roles'] != null
        ? (json['roles'] as List<dynamic>)
              .map((e) => Role.fromJson(e as Map<String, dynamic>))
              .toList()
        : [],
  );
}
