import { Router } from 'express';
import { TagController } from '../controllers/tag.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/search', TagController.searchTags);
router.get('/', TagController.getPaginatedTags); 
router.post('/', authenticate, requireAdmin, TagController.create);
router.delete('/:id', authenticate, requireAdmin, TagController.delete);

export default router;