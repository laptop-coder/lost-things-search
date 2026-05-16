class StudentGroupStudent {
  final String userId;

  const StudentGroupStudent({required this.userId});

  factory StudentGroupStudent.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {'userId': String userId} => StudentGroupStudent(userId: userId),
      _ => throw const FormatException('Не удалось загрузить ученика'),
    };
  }
}
