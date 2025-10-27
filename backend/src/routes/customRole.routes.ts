import { Router } from 'express';
import { CustomRoleController } from '../controllers/customRole.controller';
import { authenticate, requireAdmin, requirePermission } from '../middlewares/auth.middleware';
import { canManageTargetRole } from '../middlewares/role-hierarchy.middleware';
import { Permission } from '../types';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/', requirePermission(Permission.MANAGE_ROLES), CustomRoleController.getAll);
router.get('/:id', requirePermission(Permission.MANAGE_ROLES), canManageTargetRole, CustomRoleController.getById);
router.post('/', requirePermission(Permission.MANAGE_ROLES), canManageTargetRole, CustomRoleController.create);
router.put('/:id', requirePermission(Permission.MANAGE_ROLES), canManageTargetRole, CustomRoleController.update);
router.put('/:id/position', requirePermission(Permission.MANAGE_ROLES), CustomRoleController.updatePosition);
router.delete('/:id', requirePermission(Permission.MANAGE_ROLES), canManageTargetRole, CustomRoleController.delete);
router.get('/:id/users', requirePermission(Permission.MANAGE_ROLES), canManageTargetRole, CustomRoleController.getRoleUsers);

export default router;