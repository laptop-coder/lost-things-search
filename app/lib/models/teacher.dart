import 'room.dart';
import 'subject.dart';
import 'student_group.dart';

class Teacher {
  final String userId;
  final Room? classroom;
  final List<Subject> subjects;
  final List<StudentGroup> studentGroups;

  const Teacher({
    required this.userId,
    this.classroom,
    required this.subjects,
    required this.studentGroups,
  });

  factory Teacher.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'userId': String userId,
        'classroom': Room? classroom,
        'subjects': List<dynamic> subjects,
        'studentGroups': List<dynamic> studentGroups,
      } =>
        Teacher(
          userId: userId,
          classroom: classroom,
          subjects: subjects
              .map((e) => Subject.fromJson(e as Map<String, dynamic>))
              .toList(),
          studentGroups: studentGroups
              .map((e) => StudentGroup.fromJson(e as Map<String, dynamic>))
              .toList(),
        ),
      _ => throw const FormatException('Не удалось загрузить учителя'),
    };
  }
}
