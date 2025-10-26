import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authRoutesLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();
router.use(authRoutesLimiter);

router.post('/github/callback', AuthController.githubCallback);
router.post('/github', AuthController.githubSignIn);
router.get('/me', authenticate, AuthController.getMe);
router.get('/github/repos', authenticate, AuthController.fetchGithubRepos);

export default router;
