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

  factory Role.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'id': int id,
        'createdAt': String createdAt,
        'updatedAt': String updatedAt,
        'name': String name,
        'permissions': List<dynamic> permissions,
      } =>
        Role(
          id: id,
          createdAt: createdAt,
          updatedAt: updatedAt,
          name: name,
          permissions: permissions
              .map((e) => Permission.fromJson(e as Map<String, dynamic>))
              .toList(),
        ),
      _ => throw const FormatException('Не удалось загрузить роль'),
    };
  }
}
