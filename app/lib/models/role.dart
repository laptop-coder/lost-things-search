import 'permission.dart';

class Role {
  final int id;
  final String createdAt;
  final String updatedAt;
  final String name;
  final List<Permission> permissions;

  const Role({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.name,
    required this.permissions,
  });

  factory Role.fromJson(Map<String, dynamic> json) => Role(
    id: json['id'] as int,
    createdAt: json['createdAt'] as String,
    updatedAt: json['updatedAt'] as String,
    name: json['name'] as String,
    permissions: json['permissions'] != null
        ? (json['permissions'] as List<dynamic>)
              .map((e) => Permission.fromJson(e as Map<String, dynamic>))
              .toList()
        : [],
  );
}
