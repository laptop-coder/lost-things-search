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

  factory StudentGroup.fromJson(Map<String, dynamic> json) => StudentGroup(
    id: json['id'] as int,
    createdAt: json['createdAt'] as String,
    updatedAt: json['updatedAt'] as String,
    name: json['name'] as String,
    groupAdvisorId: json['groupAdvisorId'] as String?,
    students:
        (json['students'] as List<dynamic>?)
            ?.map(
              (e) => StudentGroupStudent.fromJson(e as Map<String, dynamic>),
            )
            .toList() ??
        [],
  );
}
