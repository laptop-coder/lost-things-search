class Room {
  final int id;
  final String createdAt;
  final String updatedAt;
  final String name;
  final String? teacherId;

  const Room({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.name,
    this.teacherId,
  });

  factory Room.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'id': int id,
        'createdAt': String createdAt,
        'updatedAt': String updatedAt,
        'name': String name,
        'teacherId': String? teacherId,
      } =>
        Room(
          id: id,
          createdAt: createdAt,
          updatedAt: updatedAt,
          name: name,
          teacherId: teacherId,
        ),
      _ => throw const FormatException('Не удалось загрузить кабинет'),
    };
  }
}
