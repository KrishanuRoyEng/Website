import { Request, Response } from 'express';
import { TagService } from '../services/tag.service';
import { ProjectService } from '../services/project.service';
import { asyncHandler } from '../utils/asyncHandler';

export class TagController {
    
    // Autocomplete Search Feature: GET /api/tags/search?q=query
    static searchTags = asyncHandler(async (req: Request, res: Response) => {
        // Get the search query from the URL parameter 'q'
        const query = req.query.q as string;

        if (!query || query.length === 0) {
            // Return an empty array if no query is provided
            return res.status(200).json([]); 
        }

        // ProjectService is used for searchTags because of the Tag/Project relationship logic
        const tags = await ProjectService.searchTags(query);
        
        return res.status(200).json(tags);
    });

    // Paginated List Feature: GET /api/tags?skip=...&limit=...
    static getPaginatedTags = asyncHandler(async (req: Request, res: Response) => {
        const skip = parseInt(req.query.skip as string) || 0;
        const limit = parseInt(req.query.limit as string) || 100;

        const tags = await TagService.getAll(skip, limit);

        return res.json(tags);
    });
    
    // Creation Feature: POST /api/tags
    static create = asyncHandler(async (req: Request, res: Response) => {
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
    });

    // Deletion Feature: DELETE /api/tags/:id
    static delete = asyncHandler(async (req: Request, res: Response) => {
        const id = parseInt(req.params.id);

        await TagService.delete(id);

        return res.json({ message: 'Tag deleted successfully' });
    });
}
