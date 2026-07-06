// ============================================================
// Role-Based Access Control (RBAC)
// Central definition of who can access what in the dashboard.
// ============================================================

export type Role = "super_admin" | "admin" | "editor" | "moderator" | "viewer";

export const ROLE_LABEL: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
  moderator: "Moderator",
  viewer: "Viewer",
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  super_admin: "সম্পূর্ণ কর্তৃত্ব — অ্যাডমিন ব্যবস্থাপনা ও সেটিংস সহ সব কিছু",
  admin: "প্রায় সব কিছু — শুধু অ্যাডমিন ব্যবস্থাপনা ও সংবেদনশীল সেটিংস বাদ",
  editor: "কন্টেন্ট সম্পাদনা — ব্লগ, প্রকল্প, গ্যালারি, টিম, প্রতিষ্ঠান",
  moderator: "আবেদন ও যোগাযোগ — মেসেজ, স্বেচ্ছাসেবক, সদস্য, দান",
  viewer: "শুধু দেখা — সম্পাদনা নেই",
};

// All permission "keys" used across the app. One key per sidebar module.
export type Permission =
  | "overview"
  | "donations"
  | "volunteers"
  | "members"
  | "careers"
  | "messages"
  | "projects"
  | "blog"
  | "gallery"
  | "team"
  | "partners"
  | "settings"           // general org settings tabs
  | "settings.security"  // sensitive: 2FA, session, allowed emails
  | "settings.payment"   // sensitive: bank / gateway credentials
  | "forms"              // dynamic public-form editor
  | "admins"             // create/delete admins, reset passwords
  | "logs"               // activity / audit log — super admin only
  | "help";

// Which roles are allowed for each permission.
// super_admin is implicitly granted everything via `can()` below.
const MATRIX: Record<Permission, Role[]> = {
  overview:            ["admin", "editor", "moderator", "viewer"],
  donations:           ["admin", "moderator", "viewer"],
  volunteers:          ["admin", "moderator"],
  members:             ["admin", "moderator"],
  careers:             ["admin", "moderator"],
  messages:            ["admin", "moderator", "viewer"],
  projects:            ["admin", "editor"],
  blog:                ["admin", "editor"],
  gallery:             ["admin", "editor"],
  team:                ["admin", "editor"],
  partners:            ["admin", "editor"],
  settings:            ["admin"],
  forms:               ["admin", "editor"],
  "settings.security": [],   // super_admin only
  "settings.payment":  [],   // super_admin only
  admins:              [],   // super_admin only
  logs:                [],   // super_admin only
  help:                ["admin", "editor", "moderator", "viewer"],
};

/** Returns true when the role is allowed to access the permission. */
export function can(role: Role | undefined | null, perm: Permission): boolean {
  if (!role) return false;
  if (role === "super_admin") return true;
  return MATRIX[perm]?.includes(role) ?? false;
}

/** First permission the role can access — used to redirect after login. */
export function landingPermission(role: Role): Permission {
  const order: Permission[] = [
    "overview", "messages", "donations", "volunteers", "projects", "blog", "gallery",
  ];
  return order.find((p) => can(role, p)) || "overview";
}

/** Roles a super_admin is allowed to grant when creating new users. */
export const ASSIGNABLE_ROLES: Role[] = ["super_admin", "admin", "editor", "moderator", "viewer"];
