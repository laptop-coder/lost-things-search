import 'student.dart';

class Parent {
  final String userId;
  final List<Student> students;

  const Parent({required this.userId, required this.students});

  factory Parent.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {'userId': String userId, 'students': List<dynamic> students} => Parent(
        userId: userId,
        students: students
            .map((e) => Student.fromJson(e as Map<String, dynamic>))
            .toList(),
      ),
      _ => throw const FormatException('Не удалось загрузить родителя'),
    };
  }
}
