import { Request, Response } from 'express';
import { SkillService } from '../services/skill.service';
import { asyncHandler } from '../utils/asyncHandler'; // Adjust import path as needed

export class SkillController {
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 100;

    const skills = await SkillService.getAll(skip, limit);
    return res.json(skills);
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const { name, category } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Skill name is required' });
    }

    const existing = await SkillService.findByName(name);

    if (existing) {
      return res.status(400).json({ error: 'Skill already exists' });
    }

    const skill = await SkillService.create(name, category);
    return res.status(201).json(skill);
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    await SkillService.delete(id);
    return res.json({ message: 'Skill deleted successfully' });
  });
}