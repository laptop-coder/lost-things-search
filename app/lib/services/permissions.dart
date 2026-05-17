import 'auth_service.dart';
import '../models/user.dart';

class Permissions {
  final AuthService _auth;
  Permissions(this._auth);
  User? get _user => _auth.user;

  bool hasPermission(String permissionName) {
    final user = _user;
    if (user == null) return false;
    return user.roles.any(
      (role) => role.permissions.any((p) => p.name == permissionName),
    );
  }

  bool hasAnyPermission(List<String> permissionNames) {
    return permissionNames.any((p) => hasPermission(p));
  }

  bool hasAllPermissions(List<String> permissionNames) {
    return permissionNames.every((p) => hasPermission(p));
  }

  bool hasRole(String roleName) {
    final user = _user;
    if (user == null) return false;
    return user.roles.any((r) => r.name == roleName);
  }

  bool hasAnyRole(List<String> roleNames) {
    return roleNames.any((r) => hasRole(r));
  }

  bool hasAllRoles(List<String> roleNames) {
    return roleNames.every((r) => hasRole(r));
  }
}

class PERMISSIONS {
  // Post permissions
  static const POST_CREATE = "post.create";
  static const POST_READ_ANY = "post.read.any";
  static const POST_READ_OWN = "post.read.own";
  static const POST_UPDATE_ANY = "post.update.any";
  static const POST_UPDATE_OWN = "post.update.own";
  static const POST_DELETE_ANY = "post.delete.any";
  static const POST_DELETE_OWN = "post.delete.own";
  static const POST_PHOTO_DELETE_ANY = "post.photo.delete.any";
  static const POST_PHOTO_DELETE_OWN = "post.photo.delete.own";
  static const POST_PHOTO_UPDATE_ANY = "post.photo.update.any";
  static const POST_PHOTO_UPDATE_OWN = "post.photo.update.own";
  static const POST_VERIFY = "post.verify";
  static const POST_MARK_RETURNED_ANY = "post.mark.returned.any";
  static const POST_MARK_RETURNED_OWN = "post.mark.returned.own";

  // Post conversation permissions
  static const CONVERSATION_CREATE = "conversation.create";
  static const CONVERSATION_READ_OWN = "conversation.read.own";
  static const CONVERSATION_MESSAGE_SEND = "conversation.message.send";
  static const CONVERSATION_MESSAGE_MARK_AS_READ =
      "conversation.message.mark_as_read";

  // User permissions
  static const USER_READ_OWN = "user.read.own";
  static const USER_READ_OTHER = "user.read.other";
  static const USER_READ_ALL = "user.read.all";
  static const USER_UPDATE_OWN = "user.update.own";
  static const USER_DELETE_ANY_ADMIN = "user.delete.any.admin";
  static const USER_DELETE_ANY_USER = "user.delete.any.user";
  static const USER_DELETE_OWN = "user.delete.own";

  // Room permissions
  static const ROOM_CREATE = "room.create";
  static const ROOM_UPDATE = "room.update";
  static const ROOM_DELETE = "room.delete";

  // Subject permissions
  static const SUBJECT_CREATE = "subject.create";
  static const SUBJECT_UPDATE = "subject.update";
  static const SUBJECT_DELETE = "subject.delete";

  // Student group permissions
  static const STUDENT_GROUP_CREATE = "student_group.create";
  static const STUDENT_GROUP_UPDATE = "student_group.update";
  static const STUDENT_GROUP_DELETE = "student_group.delete";
  static const STUDENT_GROUP_ADVISOR_ASSIGN = "student_group.advisor.assign";
  static const STUDENT_GROUP_ADVISOR_UNASSIGN_ANY =
      "student_group.advisor.unassign.any";
  static const STUDENT_GROUP_ADVISOR_UNASSIGN_OWN =
      "student_group.advisor.unassign.own";
  static const STUDENT_GROUP_ADVISOR_READ = "student_group.advisor.read";

  // Teacher permissions
  static const TEACHER_SUBJECT_READ_ANY = "teacher.subject.read.any";
  static const TEACHER_SUBJECT_READ_OWN = "teacher.subject.read.own";
  static const TEACHER_SUBJECT_ADD_ANY = "teacher.subject.add.any";
  static const TEACHER_SUBJECT_ADD_OWN = "teacher.subject.add.own";
  static const TEACHER_SUBJECT_ASSIGN_ANY = "teacher.subject.assign.any";
  static const TEACHER_SUBJECT_ASSIGN_OWN = "teacher.subject.assign.own";
  static const TEACHER_SUBJECT_UNASSIGN_ANY = "teacher.subject.unassign.any";
  static const TEACHER_SUBJECT_UNASSIGN_OWN = "teacher.subject.unassign.own";
  static const TEACHER_CLASSROOM_READ_ANY = "teacher.classroom.read.any";
  static const TEACHER_CLASSROOM_READ_OWN = "teacher.classroom.read.own";
  static const TEACHER_CLASSROOM_ASSIGN_ANY = "teacher.classroom.assign.any";
  static const TEACHER_CLASSROOM_ASSIGN_OWN = "teacher.classroom.assign.own";
  static const TEACHER_CLASSROOM_UNASSIGN_ANY =
      "teacher.classroom.unassign.any";
  static const TEACHER_CLASSROOM_UNASSIGN_OWN =
      "teacher.classroom.unassign.own";
  static const TEACHER_READ_OTHER = "teacher.read.other";
  static const TEACHER_READ_OWN = "teacher.read.own";
  static const TEACHER_STUDENT_GROUP_READ_OWN =
      "teacher.student_group.read.own";

  // Parent permissions
  static const PARENT_STUDENT_READ_ANY = "parent.student.read.any";
  static const PARENT_STUDENT_READ_OWN = "parent.student.read.own";
  static const PARENT_STUDENT_ADD_ANY = "parent.student.add.any";
  static const PARENT_STUDENT_ADD_OWN = "parent.student.add.own";
  static const PARENT_STUDENT_UNASSIGN_ANY = "parent.student.unassign.any";
  static const PARENT_STUDENT_UNASSIGN_OWN = "parent.student.unassign.own";
  static const PARENT_READ_OTHER = "parent.read.other";
  static const PARENT_READ_OWN = "parent.read.own";
  static const PARENT_STUDENT_GROUP_READ_OWN = "parent.student_group.read.own";

  // User roles permissions
  static const ROLE_ADMIN_ASSIGN = "role.admin.assign";
  static const ROLE_USER_ASSIGN = "role.user.assign";
  static const ROLE_ADMIN_ADD = "role.admin.add";
  static const ROLE_USER_ADD = "role.user.add";
  static const ROLE_ADMIN_UNASSIGN = "role.admin.unassign";
  static const ROLE_USER_UNASSIGN = "role.user.unassign";
  static const ROLE_READ_ANY = "role.read.any";
  static const ROLE_READ_OWN = "role.read.own";

  // Permissions to work with tokens
  static const TOKEN_INVITE_ADMIN_CREATE = "token.invite.admin.create";
  static const TOKEN_INVITE_USER_CREATE = "token.invite.user.create";
  static const TOKEN_INVITE_ADMIN_DELETE = "token.invite.admin.delete";
  static const TOKEN_INVITE_USER_DELETE = "token.invite.user.delete";

  // Student permissions
  static const STUDENT_READ_OTHER = "student.read.other";
  static const STUDENT_READ_OWN = "student.read.own";
  static const STUDENT_CLASSROOM_READ_ANY = "student.classroom.read.any";
  static const STUDENT_CLASSROOM_READ_OWN = "student.classroom.read.own";
  static const STUDENT_ADVISOR_READ_ANY = "student.advisor.read.any";
  static const STUDENT_ADVISOR_READ_OWN = "student.advisor.read.own";
  static const STUDENT_PARENT_READ_ANY = "student.parent.read.any";
  static const STUDENT_PARENT_READ_OWN = "student.parent.read.own";
  static const STUDENT_STUDENT_GROUP_READ_OWN =
      "student.student_group.read.own";

  // Institution administrator
  static const INSTITUTION_ADMINISTRATOR_READ_OTHER =
      "institution_administrator.read.other";
  static const INSTITUTION_ADMINISTRATOR_READ_OWN =
      "institution_administrator.read.own";
  static const INSTITUTION_ADMINISTRATOR_POSITION_ASSIGN =
      "institution_administrator.position.assign";
  static const INSTITUTION_ADMINISTRATOR_POSITION_READ =
      "institution_administrator.position.read";

  // Staff
  static const STAFF_READ_OTHER = "staff.read.other";
  static const STAFF_READ_OWN = "staff.read.own";
  static const STAFF_POSITION_ASSIGN = "staff.position.assign";
  static const STAFF_POSITION_READ = "staff.position.read";

  // Position institution administrator
  static const POSITION_INSTITUTION_ADMINISTRATOR_CREATE =
      "position.institution_administrator.create";
  static const POSITION_INSTITUTION_ADMINISTRATOR_UPDATE =
      "position.institution_administrator.update";
  static const POSITION_INSTITUTION_ADMINISTRATOR_DELETE =
      "position.institution_administrator.delete";

  // Position staff
  static const POSITION_STAFF_CREATE = "position.staff.create";
  static const POSITION_STAFF_UPDATE = "position.staff.update";
  static const POSITION_STAFF_DELETE = "position.staff.delete";

  // Document
  static const DOCUMENT_PRIVACY_UPLOAD = "document.privacy.upload";
}

class ROLES {
  static const SUPERADMIN = "superadmin";
  static const ADMIN = "admin";
  static const INSTITUTION_ADMINISTRATOR = "institution_administrator";
  static const STAFF = "staff";
  static const TEACHER = "teacher";
  static const PARENT = "parent";
  static const STUDENT = "student";
}
