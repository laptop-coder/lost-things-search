import 'parent.dart';
import 'student_group.dart';

class Student {
  final String userId;
  final List<Parent> parents;
  final StudentGroup studentGroup;

  const Student({
    required this.userId,
    required this.parents,
    required this.studentGroup,
  });

  factory Student.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'userId': String userId,
        'parents': List<dynamic> parents,
        'studentGroup': StudentGroup studentGroup,
      } =>
        Student(
          userId: userId,
          parents: parents
              .map((e) => Parent.fromJson(e as Map<String, dynamic>))
              .toList(),
          studentGroup: studentGroup,
        ),
      _ => throw const FormatException('Не удалось загрузить ученика'),
    };
  }
}
