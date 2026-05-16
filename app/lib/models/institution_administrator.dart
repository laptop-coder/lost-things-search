import 'institution_administrator_position.dart';

class InstitutionAdministrator {
  final String userId;
  final InstitutionAdministratorPosition position;

  const InstitutionAdministrator({
    required this.userId,
    required this.position,
  });

  factory InstitutionAdministrator.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'userId': String userId,
        'position': InstitutionAdministratorPosition position,
      } =>
        InstitutionAdministrator(userId: userId, position: position),
      _ => throw const FormatException('Не удалось загрузить администрацию ОУ'),
    };
  }
}
