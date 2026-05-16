class InstitutionAdministratorPosition {
  final int id;
  final String createdAt;
  final String updatedAt;
  final String name;

  const InstitutionAdministratorPosition({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.name,
  });

  factory InstitutionAdministratorPosition.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'id': int id,
        'createdAt': String createdAt,
        'updatedAt': String updatedAt,
        'name': String name,
      } =>
        InstitutionAdministratorPosition(
          id: id,
          createdAt: createdAt,
          updatedAt: updatedAt,
          name: name,
        ),
      _ => throw const FormatException('Не удалось загрузить должность администрации ОУ'),
    };
  }
}


