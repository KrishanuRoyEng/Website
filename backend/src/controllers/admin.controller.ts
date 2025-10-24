import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { ProjectService } from "../services/project.service";
import { EventService } from "../services/event.service";
import { UserRole } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler"; // Adjust import path as needed

export class AdminController {
  static getPendingMembers = asyncHandler(async (req: Request, res: Response) => {
    const pendingMembers = await UserService.getPendingMembers();
    return res.json(pendingMembers);
  });

  static approveMember = asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const { isActive, role } = req.body;

    if (typeof isActive !== "boolean" || !role) {
      return res.status(400).json({ error: "isActive and role are required" });
    }

    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const user = await UserService.updateRole(userId, role, isActive);
    return res.json(user);
  });

  static getPendingProjects = asyncHandler(async (req: Request, res: Response) => {
    const pendingProjects = await ProjectService.getPendingProjects();
    return res.json(pendingProjects);
  });

  static approveProject = asyncHandler(async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.projectId);
    const { isApproved, reason } = req.body;

    if (typeof isApproved !== "boolean") {
      return res.status(400).json({ error: "isApproved is required" });
    }

    const project = await ProjectService.updateApprovalStatus(projectId, isApproved, reason);
    return res.json(project);
  });

  static removeProject = asyncHandler(async (req: Request, res: Response) => {
    const projectId = parseInt(req.params.projectId);
    await ProjectService.delete(projectId);
    return res.json({ message: "Project removed successfully" });
  });

  static setEventFeatured = asyncHandler(async (req: Request, res: Response) => {
    const eventId = parseInt(req.params.eventId);
    const { isFeatured } = req.body;

    if (typeof isFeatured !== "boolean") {
      return res.status(400).json({ error: "isFeatured is required" });
    }

    const event = await EventService.setFeatured(eventId, isFeatured);
    return res.json(event);
  });

  static getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 100;
    const users = await UserService.getAllUsers(skip, limit);
    return res.json(users);
  });

  static updateUserRole = asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const { role, isActive, isLead } = req.body;

    const user = await UserService.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updates: any = {};
    if (role !== undefined) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;
    if (isLead !== undefined) updates.isLead = isLead;

    const updated = await UserService.update(userId, updates);
    return res.json(updated);
  });
}