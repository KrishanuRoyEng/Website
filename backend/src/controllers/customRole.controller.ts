import { Request, Response } from "express";
import { CustomRoleService } from "../services/customRole.service";
import { AuthRequest } from "../types";
import { asyncHandler } from "../utils/asyncHandler";

export class CustomRoleController {
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const roles = await CustomRoleService.findAll();
    return res.json(roles);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const roleId = parseInt(req.params.id);
    const role = await CustomRoleService.findById(roleId);
    
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }
    
    return res.json(role);
  });

  static create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, description, color, permissions } = req.body;
    
    if (!name || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({ error: "Name and permissions are required" });
    }

    const role = await CustomRoleService.create(
      { name, description, color, permissions },
      req.user?.id
    );
    
    return res.status(201).json(role);
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const roleId = parseInt(req.params.id);
    const { name, description, color, permissions } = req.body;

    const role = await CustomRoleService.update(roleId, {
      name,
      description,
      color,
      permissions,
    });
    
    return res.json(role);
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const roleId = parseInt(req.params.id);
    
    await CustomRoleService.delete(roleId);
    
    return res.json({ message: "Role deleted successfully" });
  });

  static getRoleUsers = asyncHandler(async (req: Request, res: Response) => {
    const roleId = parseInt(req.params.id);
    const users = await CustomRoleService.getUsersWithRole(roleId);
    
    return res.json(users);
  });
}