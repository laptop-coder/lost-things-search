import 'student.dart';

class Parent {
  final String userId;
  final List<Student> students;

  const Parent({required this.userId, required this.students});

  factory Parent.fromJson(Map<String, dynamic> json) => Parent(
    userId: json['userId'] as String,
    students:
        (json['students'] as List<dynamic>?)
            ?.map((e) => Student.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [],
  );
}
