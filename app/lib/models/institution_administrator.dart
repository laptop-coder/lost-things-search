import 'institution_administrator_position.dart';

class InstitutionAdministrator {
  final String userId;
  final InstitutionAdministratorPosition position;

  const InstitutionAdministrator({
    required this.userId,
    required this.position,
  });

  factory InstitutionAdministrator.fromJson(Map<String, dynamic> json) =>
      InstitutionAdministrator(
        userId: json['userId'] as String,
        position: InstitutionAdministratorPosition.fromJson(
          json['position'] as Map<String, dynamic>,
        ),
      );
}
