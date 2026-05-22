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

  factory Room.fromJson(Map<String, dynamic> json) => Room(
    id: json['id'] as int,
    createdAt: json['createdAt'] as String,
    updatedAt: json['updatedAt'] as String,
    name: json['name'] as String,
    teacherId: json['teacherId'] as String?,
  );
}
