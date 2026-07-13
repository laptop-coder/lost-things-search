package appcontext


type contextKey string

const UserIDKey contextKey = "user_id"
const UserRolesKey contextKey = "user_roles"
const UserPermissionsKey contextKey = "user_permissions"
