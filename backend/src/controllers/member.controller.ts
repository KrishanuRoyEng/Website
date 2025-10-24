import { Request, Response } from 'express';
import { MemberService } from '../services/member.service';
import { AuthRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler'; // Adjust import path as needed

export class MemberController {
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 100;
    const skillIds = req.query.skillIds
      ? (req.query.skillIds as string).split(',').map(Number)
      : undefined;
    const approvedOnly = req.query.approvedOnly === 'true';

    const members = await MemberService.getAll({
      skip,
      limit,
      skillIds,
      approvedOnly,
    });

    return res.json(members);
  });

  static getByUserId = asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const member = await MemberService.findByUserId(userId);

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const memberWithProjects = await MemberService.findById(member.id);
    return res.json(memberWithProjects);
  });

  static getAuthenticatedProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userId = req.user.id;
    const member = await MemberService.findByUserId(userId);

    if (!member) {
      return res.status(404).json({ error: 'Member profile not found' });
    }

    const memberWithProjects = await MemberService.findById(member.id);
    
    if (!memberWithProjects) {
      return res.status(404).json({ error: 'Member profile data incomplete' });
    }

    return res.json(memberWithProjects);
  });

  static getLeads = asyncHandler(async (req: Request, res: Response) => {
    const leads = await MemberService.getLeads();
    return res.json(leads);
  });

  static updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const member = await MemberService.findByUserId(req.user.id);

    if (!member) {
      return res.status(404).json({ error: 'Member profile not found' });
    }

    const updated = await MemberService.update(member.id, req.body);
    return res.json(updated);
  });

  static addSkills = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { skillIds } = req.body;

    if (!skillIds || !Array.isArray(skillIds)) {
      return res.status(400).json({ error: 'skillIds array is required' });
    }

    const member = await MemberService.findByUserId(req.user.id);

    if (!member) {
      return res.status(404).json({ error: 'Member profile not found' });
    }

    const updated = await MemberService.addSkills(member.id, skillIds);
    return res.json(updated);
  });

  static removeSkill = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const skillId = parseInt(req.params.skillId);

    const member = await MemberService.findByUserId(req.user.id);

    if (!member) {
      return res.status(404).json({ error: 'Member profile not found' });
    }

    const updated = await MemberService.removeSkill(member.id, skillId);
    return res.json(updated);
  });
}