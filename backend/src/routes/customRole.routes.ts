import { Router } from 'express';
import { CustomRoleController } from '../controllers/customRole.controller';
import { authenticate, requirePermission } from '../middlewares/auth.middleware';
import { canManageTargetRole } from '../middlewares/role-hierarchy.middleware';
import { Permission } from '../types';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission([Permission.MANAGE_ROLES, Permission.MANAGE_MEMBERS]), CustomRoleController.getAll);
router.get('/:id', requirePermission([Permission.MANAGE_ROLES,Permission.MANAGE_MEMBERS]), canManageTargetRole, CustomRoleController.getById);
router.post('/', requirePermission(Permission.MANAGE_ROLES), canManageTargetRole, CustomRoleController.create);
router.put('/:id', requirePermission(Permission.MANAGE_ROLES), canManageTargetRole, CustomRoleController.update);
router.put('/:id/position', requirePermission(Permission.MANAGE_ROLES), CustomRoleController.updatePosition);
router.delete('/:id', requirePermission(Permission.MANAGE_ROLES), canManageTargetRole, CustomRoleController.delete);
router.get('/:id/users', requirePermission([Permission.MANAGE_ROLES,Permission.MANAGE_MEMBERS]), canManageTargetRole, CustomRoleController.getRoleUsers);

export default router;