class StudentGroupStudent {
  final String userId;

  const StudentGroupStudent({required this.userId});

  factory StudentGroupStudent.fromJson(Map<String, dynamic> json) =>
      StudentGroupStudent(userId: json['userId'] as String);
}
