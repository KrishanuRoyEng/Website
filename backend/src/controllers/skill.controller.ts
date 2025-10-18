import { Request, Response } from 'express';
import { SkillService } from '../services/skill.service';

export class SkillController {
  static async getAll(req: Request, res: Response) {
    try {
      const skip = parseInt(req.query.skip as string) || 0;
      const limit = parseInt(req.query.limit as string) || 100;

      const skills = await SkillService.getAll(skip, limit);

      return res.json(skills);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch skills' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
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
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create skill' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      await SkillService.delete(id);

      return res.json({ message: 'Skill deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete skill' });
    }
  }
}
