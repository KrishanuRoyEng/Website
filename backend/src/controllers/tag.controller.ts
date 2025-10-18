import { Request, Response } from 'express';
import { TagService } from '../services/tag.service';

export class TagController {
  static async getAll(req: Request, res: Response) {
    try {
      const skip = parseInt(req.query.skip as string) || 0;
      const limit = parseInt(req.query.limit as string) || 100;

      const tags = await TagService.getAll(skip, limit);

      return res.json(tags);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch tags' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Tag name is required' });
      }

      const existing = await TagService.findByName(name);

      if (existing) {
        return res.status(400).json({ error: 'Tag already exists' });
      }

      const tag = await TagService.create(name);

      return res.status(201).json(tag);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create tag' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      await TagService.delete(id);

      return res.json({ message: 'Tag deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete tag' });
    }
  }
}