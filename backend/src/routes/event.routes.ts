import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { authenticate, requireActive, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', EventController.getAll);
router.get('/featured', EventController.getFeatured);
router.get('/upcoming', EventController.getUpcoming);
router.get('/:id', EventController.getById);
router.post('/', authenticate, requireActive, EventController.create);
router.put('/:id', authenticate, requireAdmin, EventController.update);
router.delete('/:id', authenticate, requireAdmin, EventController.delete);

export default router;