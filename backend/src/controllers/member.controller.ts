import { Request, Response } from 'express';
import { MemberService } from '../services/member.service';
import { AuthRequest } from '../types';

export class MemberController {
  static async getAll(req: Request, res: Response) {
    try {
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
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch members' });
    }
  }

  static async getByUserId(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const member = await MemberService.findByUserId(userId);

      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }

      const memberWithProjects = await MemberService.findById(member.id);

      return res.json(memberWithProjects);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch member' });
    }
  }

static async getAuthenticatedProfile(req: AuthRequest, res: Response) {
  try {
      console.log('=== getAuthenticatedProfile called ===');
      console.log('req.user:', req.user);
      
      if (!req.user || !req.user.id) {
          console.log('❌ No user in request');
          return res.status(401).json({ error: 'Not authenticated' });
      }

      const userId = req.user.id;
      console.log('✅ User ID:', userId);
      
      // 1. Find the Member record using the authenticated User ID
      const member = await MemberService.findByUserId(userId);
      console.log('Member found:', member);

      if (!member) {
          console.log('❌ No member profile for user:', userId);
          return res.status(404).json({ error: 'Member profile not found' });
      }

      console.log('✅ Member ID:', member.id);
      
      // 2. Get the full member details (including projects/skills)
      const memberWithProjects = await MemberService.findById(member.id);
      console.log('Member with projects:', memberWithProjects ? 'Found' : 'Not found');

      if (!memberWithProjects) {
           return res.status(404).json({ error: 'Member profile data incomplete' });
      }

      console.log('✅ Sending member profile');
      return res.json(memberWithProjects);
  } catch (error) {
      console.error('CRITICAL 500 ERROR in getAuthenticatedProfile:', error);
      return res.status(500).json({ error: 'Failed to fetch members' });
  }
}

  static async getLeads(req: Request, res: Response) {
    try {
      const leads = await MemberService.getLeads();
      return res.json(leads);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch leads' });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const member = await MemberService.findByUserId(req.user.id);

      if (!member) {
        return res.status(404).json({ error: 'Member profile not found' });
      }

      const updated = await MemberService.update(member.id, req.body);

      return res.json(updated);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  static async addSkills(req: AuthRequest, res: Response) {
    try {
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
    } catch (error) {
      return res.status(500).json({ error: 'Failed to add skills' });
    }
  }

  static async removeSkill(req: AuthRequest, res: Response) {
    try {
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
    } catch (error) {
      return res.status(500).json({ error: 'Failed to remove skill' });
    }
  }
}
