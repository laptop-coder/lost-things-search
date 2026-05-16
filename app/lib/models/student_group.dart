import 'student_group_student.dart';

class StudentGroup {
  final int id;
  final String createdAt;
  final String updatedAt;
  final String name;
  final String? groupAdvisorId;
  final List<StudentGroupStudent> students;

  const StudentGroup({
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.name,
    this.groupAdvisorId,
    required this.students,
  });

  factory StudentGroup.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'id': int id,
        'createdAt': String createdAt,
        'updatedAt': String updatedAt,
        'name': String name,
        'groupAdvisorId': String? groupAdvisorId,
        'students': List<dynamic> students,
      } =>
        StudentGroup(
          id: id,
          createdAt: createdAt,
          updatedAt: updatedAt,
          name: name,
          groupAdvisorId: groupAdvisorId,
          students: students
              .map(
                (e) => StudentGroupStudent.fromJson(e as Map<String, dynamic>),
              )
              .toList(),
        ),
      _ => throw const FormatException('Не удалось загрузить учебную группу'),
    };
  }
}
