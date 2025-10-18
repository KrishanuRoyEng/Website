import { Router } from 'express';
import { MemberController } from '../controllers/member.controller';
import { authenticate, requireActive } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', MemberController.getAll);
router.get('/leads', MemberController.getLeads);
router.get('/:id', MemberController.getById);
router.put('/profile', authenticate, requireActive, MemberController.updateProfile);
router.post('/skills', authenticate, requireActive, MemberController.addSkills);
router.delete('/skills/:skillId', authenticate, requireActive, MemberController.removeSkill);

export default router;
