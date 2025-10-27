import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { UserService } from '../services/user.service';
import { canModifyUser, toUserForHierarchy } from '../utils/role-hierarchy';

/**
 * Middleware to check if user can modify target user based on role hierarchy
 */
export const canModifyTargetUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const targetUserId = parseInt(req.params.userId);
  
  // Don't block if no userId in params (e.g., for list operations)
  if (!targetUserId) {
    return next();
  }

  try {
    const targetUser = await UserService.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const actingUser = toUserForHierarchy(req.user);
    const targetUserForHierarchy = toUserForHierarchy(targetUser);

    if (!canModifyUser(actingUser, targetUserForHierarchy)) {
      return res.status(403).json({ 
        error: 'Cannot modify user with equal or higher role hierarchy' 
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Server error while checking permissions' });
  }
};

/**
 * Middleware to check if user can manage a specific role
 */
export const canManageTargetRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const roleId = parseInt(req.params.roleId || req.params.id);
  
  if (!roleId) {
    return next();
  }

  try {
    const { CustomRoleService } = await import('../services/customRole.service');
    const targetRole = await CustomRoleService.findById(roleId);

    if (!targetRole) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const actingUser = toUserForHierarchy(req.user);
    
    // Import the function dynamically to avoid circular dependencies
    const { canManageRole } = await import('../utils/role-hierarchy');
    
    if (!canManageRole(actingUser, targetRole)) {
      return res.status(403).json({ 
        error: 'Cannot manage role with equal or higher position' 
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Server error while checking role permissions' });
  }
};