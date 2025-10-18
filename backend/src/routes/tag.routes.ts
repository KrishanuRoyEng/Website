import { Router } from 'express';
import { TagController } from '../controllers/tag.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', TagController.getAll);
router.post('/', authenticate, requireAdmin, TagController.create);
router.delete('/:id', authenticate, requireAdmin, TagController.delete);

export default router;