import { Router } from 'express';
import { MemberController } from '../controllers/member.controller';
import { authenticate, requireActive } from '../middlewares/auth.middleware';

const router = Router();

console.log('📍 member.routes.ts loaded');

// Add a test route WITHOUT middleware
router.get('/test', (req, res) => {
  console.log('✅ TEST ROUTE HIT');
  res.json({ message: 'Test route works!' });
});

router.get('/profile', (req, res, next) => {
  console.log('🔥 /profile route hit BEFORE middleware');
  next();
}, authenticate, requireActive, MemberController.getAuthenticatedProfile);
router.put('/profile', authenticate, requireActive, MemberController.updateProfile);
router.post('/skills', authenticate, requireActive, MemberController.addSkills);
router.delete('/skills/:skillId', authenticate, requireActive, MemberController.removeSkill);
router.get('/', MemberController.getAll);

router.get('/user/:userId', MemberController.getByUserId);

export default router;