import { Request, Response } from 'express';
import { ProjectService } from '../services/project.service';
import { MemberService } from '../services/member.service';
import { AuthRequest } from '../types';
import { ProjectCategory } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler'; // Adjust import path as needed

export class ProjectController {
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 100;
    const category = req.query.category as ProjectCategory | undefined;
    const tagIds = req.query.tagIds
      ? (req.query.tagIds as string).split(',').map(Number)
      : undefined;
    const memberId = req.query.memberId
      ? parseInt(req.query.memberId as string)
      : undefined;
    const approvedOnly = req.query.approvedOnly === 'true';

    const projects = await ProjectService.getAll({
      skip,
      limit,
      category,
      tagIds,
      memberId,
      approvedOnly,
    });

    return res.json(projects);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const project = await ProjectService.findById(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json(project);
  });

  static create = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const member = await MemberService.findByUserId(req.user.id);

    if (!member) {
      return res.status(404).json({ error: 'Member profile not found' });
    }

    const project = await ProjectService.create(member.id, req.body);
    return res.status(201).json(project);
  });

  static update = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const id = parseInt(req.params.id);
    const project = await ProjectService.findById(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const member = await MemberService.findByUserId(req.user.id);

    // Check if user owns this project or is admin
    if (project.memberId !== member?.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to update this project' });
    }

    const updated = await ProjectService.update(id, req.body);
    return res.json(updated);
  });

  static delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const id = parseInt(req.params.id);
    const project = await ProjectService.findById(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const member = await MemberService.findByUserId(req.user.id);

    if (project.memberId !== member?.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to delete this project' });
    }

    await ProjectService.delete(id);
    return res.json({ message: 'Project deleted successfully' });
  });
}