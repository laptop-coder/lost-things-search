class StaffPosition {
  final int id;
  final String createdAt;
  final String updatedAt;
  final String name;

  const StaffPosition({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.name,
  });

  factory StaffPosition.fromJson(Map<String, dynamic> json) => StaffPosition(
    id: json['id'] as int,
    createdAt: json['createdAt'] as String,
    updatedAt: json['updatedAt'] as String,
    name: json['name'] as String,
  );
}
