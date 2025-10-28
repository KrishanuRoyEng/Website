import { CustomRole, Permission } from "@prisma/client";

export interface UserForHierarchy {
  id: number;
  role: string;
  customRole?: {
    id: number;
    name: string;
    description: string | null;
    color: string;
    permissions: Permission[];
    position: number;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: number;
  } | null;
}

/**
 * Convert any user object to the hierarchy type
 */
export function toUserForHierarchy(user: any): UserForHierarchy {
  return {
    id: user.id,
    role: user.role,
    customRole: user.customRole
      ? {
          id: user.customRole.id,
          name: user.customRole.name,
          description: user.customRole.description,
          color: user.customRole.color,
          permissions: user.customRole.permissions,
          position: user.customRole.position,
          createdAt: user.customRole.createdAt,
          updatedAt: user.customRole.updatedAt,
          createdBy: user.customRole.createdBy,
        }
      : null,
  };
}

/**
 * Get user's highest position (for users with multiple roles in future)
 */
export function getUserHighestPosition(user: UserForHierarchy): number {
  if (user.role === "ADMIN") {
    console.log("    → BACKEND: ADMIN → 999");
    return 999;
  }

  if (user.role === "SUSPENDED" || user.role === "PENDING") {
    return -1;
  }

  // For MEMBER users with custom roles
  if (user.customRole) {
    const position = user.customRole.position;
    return position;
  }

  console.log("    → BACKEND: Regular MEMBER → 0");
  return 0;
}

/**
 * Check if acting user can assign ADMIN role to target user
 */
export function canAssignAdminRole(
  actingUser: UserForHierarchy,
  targetUser: UserForHierarchy,
  newRole: string
): boolean {
  // Only ADMINS can assign ADMIN role
  if (newRole === "ADMIN" && actingUser.role !== "ADMIN") {
    return false;
  }

  // ADMINS can assign ADMIN role to anyone (except themselves downgrading)
  if (actingUser.role === "ADMIN") {
    return true;
  }

  // For other role assignments, use the normal permission check
  return canModifyUser(actingUser, targetUser);
}

/**
 * Check if acting user can modify target user
 */
export function canModifyUser(
  actingUser: UserForHierarchy,
  targetUser: UserForHierarchy
): boolean {
  // ADMIN can modify anyone
  if (actingUser.role === "ADMIN") {
    return true;
  }

  // Non-ADMIN users cannot modify ADMIN users
  if (targetUser.role === "ADMIN") {
    return false;
  }

  const actingPosition = getUserHighestPosition(actingUser);
  const targetPosition = getUserHighestPosition(targetUser);

  const result = targetPosition < actingPosition;

  return result;
}

/**
 * Check if user can manage a specific role (create, update, delete, reorder)
 */
export function canManageRole(
  actingUser: UserForHierarchy,
  targetRole: CustomRole & { position: number }
): boolean {
  const actingPosition = getUserHighestPosition(actingUser);

  if (actingUser.role === "ADMIN") {
    return true;
  }

  const result = targetRole.position < actingPosition;
  return result;
}

/**
 * Check if user can reorder roles (move them up/down in hierarchy)
 */
export function canReorderRoles(actingUser: UserForHierarchy): boolean {
  const userPosition = getUserHighestPosition(actingUser);

  // Allow anyone except suspended/pending users to reorder
  // But only for roles they can manage
  return userPosition > -1; // Not suspended or pending
}

/**
 * Get all roles that a user can manage
 */
export function getManageableRoles(
  actingUser: UserForHierarchy,
  allRoles: (CustomRole & { position: number })[]
): (CustomRole & { position: number })[] {
  const actingPosition = getUserHighestPosition(actingUser);

  const manageable = allRoles.filter((role) => {
    const canManage = canManageRole(actingUser, role);
    console.log(
      `- ${role.name} (ID: ${role.id}, Pos: ${role.position}): canManage = ${canManage}`
    );
    return canManage;
  });

  return manageable;
}
