import 'staff_position.dart';

class Staff {
  final String userId;
  final StaffPosition position;

  const Staff({required this.userId, required this.position});

  factory Staff.fromJson(Map<String, dynamic> json) => Staff(
    userId: json['userId'] as String,
    position: StaffPosition.fromJson(json['position'] as Map<String, dynamic>),
  );
}
