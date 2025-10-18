import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { ProjectService } from '../services/project.service';
import { EventService } from '../services/event.service';
import { UserRole } from '@prisma/client';

export class AdminController {
  static async getPendingMembers(req: Request, res: Response) {
    try {
      const pendingMembers = await UserService.getPendingMembers();
      return res.json(pendingMembers);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch pending members' });
    }
  }

  static async approveMember(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const { isActive, role } = req.body;

      if (typeof isActive !== 'boolean' || !role) {
        return res.status(400).json({ error: 'isActive and role are required' });
      }

      if (!Object.values(UserRole).includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      const user = await UserService.updateRole(userId, role, isActive);

      return res.json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to approve member' });
    }
  }

  static async getPendingProjects(req: Request, res: Response) {
    try {
      const pendingProjects = await ProjectService.getPendingProjects();
      return res.json(pendingProjects);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch pending projects' });
    }
  }

  static async approveProject(req: Request, res: Response) {
    try {
      const projectId = parseInt(req.params.projectId);
      const { isApproved } = req.body;

      if (typeof isApproved !== 'boolean') {
        return res.status(400).json({ error: 'isApproved is required' });
      }

      const project = await ProjectService.approve(projectId, isApproved);

      return res.json(project);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to approve project' });
    }
  }

  static async removeProject(req: Request, res: Response) {
    try {
      const projectId = parseInt(req.params.projectId);

      await ProjectService.delete(projectId);

      return res.json({ message: 'Project removed successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to remove project' });
    }
  }

  static async setEventFeatured(req: Request, res: Response) {
    try {
      const eventId = parseInt(req.params.eventId);
      const { isFeatured } = req.body;

      if (typeof isFeatured !== 'boolean') {
        return res.status(400).json({ error: 'isFeatured is required' });
      }

      const event = await EventService.setFeatured(eventId, isFeatured);

      return res.json(event);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update event' });
    }
  }

  static async getAllUsers(req: Request, res: Response) {
    try {
      const skip = parseInt(req.query.skip as string) || 0;
      const limit = parseInt(req.query.limit as string) || 100;

      const users = await UserService.getAllUsers(skip, limit);

      return res.json(users);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  static async updateUserRole(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const { role, isActive, isLead } = req.body;

      const user = await UserService.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updates: any = {};
      if (role !== undefined) updates.role = role;
      if (isActive !== undefined) updates.isActive = isActive;
      if (isLead !== undefined) updates.isLead = isLead;

      const updated = await UserService.update(userId, updates);

      return res.json(updated);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update user' });
    }
  }
}