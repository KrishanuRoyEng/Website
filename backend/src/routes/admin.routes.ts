import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Member management
router.get('/members/pending', AdminController.getPendingMembers);
router.put('/members/:userId/approve', AdminController.approveMember);
router.get('/users', AdminController.getAllUsers);
router.put('/users/:userId/role', AdminController.updateUserRole);

// Project management
router.get('/projects/pending', AdminController.getPendingProjects);
router.put('/projects/:projectId/approve', AdminController.approveProject);
router.delete('/projects/:projectId', AdminController.removeProject);

// Event management
router.put('/events/:eventId/featured', AdminController.setEventFeatured);

export default router;