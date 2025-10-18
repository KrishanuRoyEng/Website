import { Router } from 'express';
import { SkillController } from '../controllers/skill.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', SkillController.getAll);
router.post('/', authenticate, requireAdmin, SkillController.create);
router.delete('/:id', authenticate, requireAdmin, SkillController.delete);

export default router;
