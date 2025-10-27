import { Request, Response } from "express";
import { CustomRoleService } from "../services/customRole.service";
import { AuthRequest } from "../types";
import { asyncHandler } from "../utils/asyncHandler";
import {
  canManageRole,
  canReorderRoles,
  getManageableRoles,
  getUserHighestPosition,
} from "../utils/role-hierarchy";

export class CustomRoleController {
  static getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const allRoles = await CustomRoleService.findAll();
    const manageableRoles = getManageableRoles(req.user!, allRoles);

    return res.json({
      roles: allRoles,
      manageableRoles: manageableRoles.map((r) => r.id),
      canReorder: canReorderRoles(req.user!),
    });
  });

  static getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const roleId = parseInt(req.params.id);
    const role = await CustomRoleService.findById(roleId);

    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    // Check if user can manage this role
    if (!canManageRole(req.user!, role)) {
      return res.status(403).json({
        error: "Cannot access role with equal or higher position",
      });
    }

    return res.json(role);
  });

  static create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, description, color, permissions } = req.body;

    if (!name || !permissions || !Array.isArray(permissions)) {
      return res
        .status(400)
        .json({ error: "Name and permissions are required" });
    }

    // Get all roles to find the lowest position
    const allRoles = await CustomRoleService.findAll();
    const lowestPosition =
      allRoles.length > 0 ? Math.min(...allRoles.map((r) => r.position)) : 0;

    // New roles should get position 1 lower than the current lowest
    const newPosition = lowestPosition - 1;

    console.log(`Creating new role with position: ${newPosition}`);

    const role = await CustomRoleService.create(
      {
        name,
        description,
        color,
        permissions,
        position: newPosition,
      },
      req.user?.id
    );

    return res.status(201).json(role);
  });

  static update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const roleId = parseInt(req.params.id);
    const { name, description, color, permissions } = req.body;

    const existingRole = await CustomRoleService.findById(roleId);
    if (!existingRole) {
      return res.status(404).json({ error: "Role not found" });
    }

    // Check if user can manage this role
    if (!canManageRole(req.user!, existingRole)) {
      return res.status(403).json({
        error: "Cannot modify role with equal or higher position",
      });
    }

    const role = await CustomRoleService.update(roleId, {
      name,
      description,
      color,
      permissions,
    });

    return res.json(role);
  });

  static delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const roleId = parseInt(req.params.id);

    const existingRole = await CustomRoleService.findById(roleId);
    if (!existingRole) {
      return res.status(404).json({ error: "Role not found" });
    }

    // Check if user can manage this role
    if (!canManageRole(req.user!, existingRole)) {
      return res.status(403).json({
        error: "Cannot delete role with equal or higher position",
      });
    }

    await CustomRoleService.delete(roleId);

    return res.json({ message: "Role deleted successfully" });
  });

  static updatePosition = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const roleId = parseInt(req.params.id);
      const { newPosition } = req.body;

      if (!canReorderRoles(req.user!)) {
        return res.status(403).json({
          error: "Insufficient permissions to reorder roles",
        });
      }

      const role = await CustomRoleService.findById(roleId);
      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }

      const updatedRole = await CustomRoleService.updatePosition(
        roleId,
        newPosition
      );

      return res.json({ role: updatedRole });
    }
  );

  static getRoleUsers = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const roleId = parseInt(req.params.id);

      const role = await CustomRoleService.findById(roleId);
      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }

      // Check if user can manage this role
      if (!canManageRole(req.user!, role)) {
        return res.status(403).json({
          error: "Cannot access users of role with equal or higher position",
        });
      }

      const users = await CustomRoleService.getUsersWithRole(roleId);

      return res.json(users);
    }
  );
}
