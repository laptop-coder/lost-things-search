class Permission {
  final int id;
  final String createdAt;
  final String updatedAt;
  final String name;

  const Permission({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.name,
  });

  factory Permission.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'id': int id,
        'createdAt': String createdAt,
        'updatedAt': String updatedAt,
        'name': String name,
      } =>
        Permission(
          id: id,
          createdAt: createdAt,
          updatedAt: updatedAt,
          name: name,
        ),
      _ => throw const FormatException('Не удалось загрузить право доступа'),
    };
  }
}



