/**
 * Roles and permissions within an organization.
 *
 * Authorisation is expressed once, here, as pure data. The database enforces the
 * same rules independently through Row Level Security — this module exists so
 * the UI can decide what to *show*, while the database decides what is
 * *allowed*. Those two answers must agree, but the database is the one that
 * matters; a client that lies about its role still gets nothing.
 */

export const Role = {
  Owner: 'owner',
  Admin: 'admin',
  Member: 'member',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const ROLES: readonly Role[] = [Role.Owner, Role.Admin, Role.Member] as const;

/** Higher rank implies every capability of the ranks below it. */
const RANK: Readonly<Record<Role, number>> = {
  [Role.Owner]: 30,
  [Role.Admin]: 20,
  [Role.Member]: 10,
};

export const ROLE_LABEL: Readonly<Record<Role, string>> = {
  [Role.Owner]: 'Owner',
  [Role.Admin]: 'Admin',
  [Role.Member]: 'Member',
};

export const ROLE_DESCRIPTION: Readonly<Record<Role, string>> = {
  [Role.Owner]: 'Full control, including billing and deleting the organization.',
  [Role.Admin]: 'Manage members and workspace settings.',
  [Role.Member]: 'Access the workspace and collaborate on deals.',
};

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

/** True when `role` sits at or above `minimum` in the hierarchy. */
export function hasAtLeastRole(role: Role, minimum: Role): boolean {
  return RANK[role] >= RANK[minimum];
}

/**
 * Discrete capabilities. Naming the capability rather than checking the role at
 * each call site means a future role (say, `billing`) changes one table here
 * instead of every component that guards a button.
 */
export const Permission = {
  ViewWorkspace: 'workspace:view',
  UpdateWorkspace: 'workspace:update',
  DeleteWorkspace: 'workspace:delete',
  InviteMember: 'member:invite',
  RemoveMember: 'member:remove',
  ChangeMemberRole: 'member:change-role',
  ManageBilling: 'billing:manage',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

const MINIMUM_ROLE_FOR: Readonly<Record<Permission, Role>> = {
  [Permission.ViewWorkspace]: Role.Member,
  [Permission.UpdateWorkspace]: Role.Admin,
  [Permission.InviteMember]: Role.Admin,
  [Permission.RemoveMember]: Role.Admin,
  [Permission.ChangeMemberRole]: Role.Admin,
  [Permission.DeleteWorkspace]: Role.Owner,
  [Permission.ManageBilling]: Role.Owner,
};

export function can(role: Role, permission: Permission): boolean {
  return hasAtLeastRole(role, MINIMUM_ROLE_FOR[permission]);
}

/**
 * Roles that `actor` is allowed to grant. Nobody may promote another member
 * above their own rank — the classic privilege-escalation hole in team software.
 */
export function assignableRoles(actor: Role): readonly Role[] {
  return ROLES.filter((candidate) => RANK[actor] >= RANK[candidate]);
}
