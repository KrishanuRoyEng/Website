import { Response, NextFunction } from "express";
import { AuthRequest, Permission } from "../types";
import { verifyToken } from "../utils/auth";
import { UserService } from "../services/user.service";

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    const user = await UserService.findById(payload.userId);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = {
      id: user.id,
      role: user.role,
      customRole: user.customRole || undefined, // Handle null case
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const requireActive = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = await UserService.findById(req.user.id);

    if (!user || !user.isActive) {
      return res
        .status(403)
        .json({ error: "Account is not active. Awaiting admin approval." });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

// Updated requireAdmin to check for dashboard permission
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // ADMIN role has full access
  if (req.user.role === "ADMIN") {
    return next();
  }

  // Check if user has custom role with dashboard permission
  if (req.user.customRole?.permissions?.includes(Permission.VIEW_DASHBOARD)) {
    return next();
  }

  return res.status(403).json({ error: "Admin access required" });
};

// More specific permission-based middleware
export const requirePermission = (permissions: Permission | Permission[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = req.user as any;

    // ADMIN has all permissions
    if (user.role === "ADMIN") {
      return next();
    }

    const userPermissions = user.customRole?.permissions || [];

    // Convert single permission to array for consistent handling
    const requiredPermissions = Array.isArray(permissions)
      ? permissions
      : [permissions];

    // Check if user has any of the required permissions
    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        error: `Insufficient permissions. Required: ${requiredPermissions.join(
          " or "
        )}`,
      });
    }

    next();
  };
};

// Specific middleware for dashboard access
export const requireDashboardAccess = requirePermission(
  Permission.VIEW_DASHBOARD
);

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);

      const user = await UserService.findById(payload.userId);

      if (user) {
        req.user = {
          id: user.id,
          role: user.role,
          customRole: user.customRole || undefined,
        };
      }
    }

    next();
  } catch (error) {
    next();
  }
};
