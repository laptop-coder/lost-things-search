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

  factory Student.fromJson(Map<String, dynamic> json) => Student(
    userId: json['userId'] as String,
    parents:
        (json['parents'] as List<dynamic>?)
            ?.map((e) => Parent.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [],
    studentGroup: StudentGroup.fromJson(
      json['studentGroup'] as Map<String, dynamic>,
    ),
  );
}
