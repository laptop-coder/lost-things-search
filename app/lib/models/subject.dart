class Subject {
  final int id;
  final String createdAt;
  final String updatedAt;
  final String name;

  const Subject({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.name,
  });

  factory Subject.fromJson(Map<String, dynamic> json) => Subject(
    id: json['id'] as int,
    createdAt: json['createdAt'] as String,
    updatedAt: json['updatedAt'] as String,
    name: json['name'] as String,
  );
}
