import { Router } from 'express';
import { MemberController } from '../controllers/member.controller';
import { authenticate, requireActive } from '../middlewares/auth.middleware';

const router = Router();

router.get('/profile', authenticate, requireActive, MemberController.getAuthenticatedProfile);
router.put('/profile', authenticate, requireActive, MemberController.updateProfile);
router.post('/skills', authenticate, requireActive, MemberController.addSkills);
router.delete('/skills/:skillId', authenticate, requireActive, MemberController.removeSkill);
router.get('/', MemberController.getAll);

router.get('/user/:userId', MemberController.getByUserId);

export default router;