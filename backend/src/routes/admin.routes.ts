import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { 
  authenticate, 
  requireAdmin, 
  requirePermission, 
  requireDashboardAccess 
} from '../middlewares/auth.middleware';
import { Permission } from '../types';

const router = Router();

// All admin routes require authentication
router.use(authenticate);

// Dashboard and general admin access - require VIEW_DASHBOARD permission
router.get('/members/pending', requirePermission(Permission.VIEW_DASHBOARD), AdminController.getPendingMembers);
router.get('/users', requirePermission(Permission.VIEW_DASHBOARD), AdminController.getAllUsers);
router.get('/leads', requirePermission(Permission.VIEW_DASHBOARD), AdminController.getLeads);

// Member management - require specific permissions
router.put('/members/:userId/approve', requirePermission(Permission.MANAGE_MEMBERS), AdminController.approveMember);
router.put('/users/:userId/role', requirePermission(Permission.MANAGE_MEMBERS), AdminController.updateUserRole);
router.put('/users/:userId/lead-status', requirePermission(Permission.MANAGE_MEMBERS), AdminController.setUserLeadStatus);

// Project management - require specific permissions
router.get('/projects/pending', requirePermission(Permission.MANAGE_PROJECTS), AdminController.getPendingProjects);
router.put('/projects/:projectId/approve', requirePermission(Permission.MANAGE_PROJECTS), AdminController.approveProject);
router.delete('/projects/:projectId', requirePermission(Permission.MANAGE_PROJECTS), AdminController.removeProject);

// Event management - require specific permissions
router.put('/events/:eventId/featured', requirePermission(Permission.MANAGE_EVENTS), AdminController.setEventFeatured);

export default router;