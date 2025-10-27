import { Router } from 'express';
import { CustomRoleController } from '../controllers/customRole.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/', CustomRoleController.getAll);
router.get('/:id', CustomRoleController.getById);
router.post('/', CustomRoleController.create);
router.put('/:id', CustomRoleController.update);
router.delete('/:id', CustomRoleController.delete);
router.get('/:id/users', CustomRoleController.getRoleUsers);

export default router;