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

  factory Teacher.fromJson(Map<String, dynamic> json) => Teacher(
    userId: json['userId'] as String,
    classroom: json['classroom'] != null
        ? Room.fromJson(json['classroom'] as Map<String, dynamic>)
        : null,
    subjects:
        (json['subjects'] as List<dynamic>?)
            ?.map((e) => Subject.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [],
    studentGroups:
        (json['studentGroups'] as List<dynamic>?)
            ?.map((e) => StudentGroup.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [],
  );
}
