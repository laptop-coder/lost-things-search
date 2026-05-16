import 'staff_position.dart';

class Staff {
  final String userId;
  final StaffPosition position;

  const Staff({required this.userId, required this.position});

  factory Staff.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {'userId': String userId, 'position': StaffPosition position} => Staff(
        userId: userId,
        position: position,
      ),
      _ => throw const FormatException('Не удалось загрузить сотрудника'),
    };
  }
}
