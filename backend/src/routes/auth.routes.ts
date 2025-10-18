import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/github/callback', AuthController.githubCallback);
router.get('/me', authenticate, AuthController.getMe);
router.get('/github/repos', authenticate, AuthController.fetchGithubRepos);

export default router;