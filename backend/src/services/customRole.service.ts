import prisma from "../config/database";
import { CreateCustomRoleDTO, UpdateCustomRoleDTO, Permission } from "../types";
import { UserForHierarchy, getManageableRoles } from "../utils/role-hierarchy";

// Create a compatible type that matches what getManageableRoles expects
type CompatibleCustomRole = {
  id: number;
  name: string;
  description: string | null;
  color: string;
  permissions: Permission[];
  position: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: number | null;
};

// Helper function to convert Prisma permissions to local Permission enum
function convertPermissions(prismaPermissions: any[]): Permission[] {
  return prismaPermissions.map((permission) => {
    // Map Prisma enum values to your local Permission enum
    switch (permission) {
      case "VIEW_DASHBOARD":
        return Permission.VIEW_DASHBOARD;
      case "MANAGE_MEMBERS":
        return Permission.MANAGE_MEMBERS;
      case "MANAGE_PROJECTS":
        return Permission.MANAGE_PROJECTS;
      case "MANAGE_EVENTS":
        return Permission.MANAGE_EVENTS;
      case "MANAGE_SKILLS":
        return Permission.MANAGE_SKILLS;
      case "MANAGE_TAGS":
        return Permission.MANAGE_TAGS;
      case "MANAGE_ROLES":
        return Permission.MANAGE_ROLES;
      default:
        return permission as Permission; // fallback
    }
  });
}

export class CustomRoleService {
  static async findAll() {
    const roles = await prisma.customRole.findMany({
      orderBy: { position: "desc" },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    // Convert to compatible type with proper permission mapping
    return roles.map((role) => ({
      ...role,
      permissions: convertPermissions(role.permissions),
    }));
  }

  static async findById(id: number) {
    const role = await prisma.customRole.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        users: {
          include: {
            member: true,
          },
        },
      },
    });

    if (!role) return null;

    // Convert permissions
    return {
      ...role,
      permissions: convertPermissions(role.permissions),
    };
  }

  static async findManageableRoles(user: UserForHierarchy) {
    const allRoles = await prisma.customRole.findMany({
      orderBy: { position: "desc" },
    });

    // Convert to compatible type
    const compatibleRoles: CompatibleCustomRole[] = allRoles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      color: role.color,
      permissions: convertPermissions(role.permissions), // Convert permissions
      position: role.position,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      createdBy: role.createdBy ?? null,
    }));

    return getManageableRoles(user, compatibleRoles);
  }

  static async create(
    data: CreateCustomRoleDTO & { position?: number },
    createdBy?: number
  ) {
    const role = await prisma.customRole.create({
      data: {
        ...data,
        position: data.position || 0,
        createdBy: createdBy ?? null,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Convert permissions for response
    return {
      ...role,
      permissions: convertPermissions(role.permissions),
    };
  }

  static async update(id: number, data: UpdateCustomRoleDTO) {
    const role = await prisma.customRole.update({
      where: { id },
      data,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Convert permissions for response
    return {
      ...role,
      permissions: convertPermissions(role.permissions),
    };
  }

  static async updatePosition(roleId: number, newPosition: number) {
    // Start a transaction to ensure all updates succeed or fail together
    return await prisma.$transaction(async (tx) => {
      const role = await tx.customRole.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        throw new Error("Role not found");
      }

      const oldPosition = role.position;
      // If position hasn't changed, return early
      if (oldPosition === newPosition) {
        return tx.customRole.findUnique({
          where: { id: roleId },
          include: {
            creator: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        });
      }

      if (newPosition > oldPosition) {
        // Moving DOWN in the list (lower priority, smaller number)
        // Decrease positions of roles between old and new position
        await tx.customRole.updateMany({
          where: {
            position: {
              gt: oldPosition,
              lte: newPosition,
            },
          },
          data: {
            position: { decrement: 1 },
          },
        });
      } else {
        // Moving UP in the list (higher priority, larger number)
        // Increase positions of roles between new and old position
        await tx.customRole.updateMany({
          where: {
            position: {
              gte: newPosition,
              lt: oldPosition,
            },
          },
          data: {
            position: { increment: 1 },
          },
        });
      }

      // Update the target role to its new position
      const updatedRole = await tx.customRole.update({
        where: { id: roleId },
        data: { position: newPosition },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      });
      // Convert permissions for response
      return {
        ...updatedRole,
        permissions: convertPermissions(updatedRole.permissions),
      };
    });
  }
  static async delete(id: number) {
    // Check if role is assigned to any users
    const usersWithRole = await prisma.user.count({
      where: { customRoleId: id },
    });

    if (usersWithRole > 0) {
      throw new Error("Cannot delete role that is assigned to users");
    }

    return prisma.customRole.delete({
      where: { id },
    });
  }

  static async getUsersWithRole(roleId: number) {
    return prisma.user.findMany({
      where: { customRoleId: roleId },
      include: {
        member: true,
        customRole: true,
      },
    });
  }
}
