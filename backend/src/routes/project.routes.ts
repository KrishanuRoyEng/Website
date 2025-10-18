import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authenticate, requireActive } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', ProjectController.getAll);
router.get('/:id', ProjectController.getById);
router.post('/', authenticate, requireActive, ProjectController.create);
router.put('/:id', authenticate, requireActive, ProjectController.update);
router.delete('/:id', authenticate, requireActive, ProjectController.delete);

export default router;