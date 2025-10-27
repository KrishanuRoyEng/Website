export const NOTIFICATION_CONFIG = {
  // Email settings
  email: {
    from: process.env.NOTIFICATION_EMAIL || 'notifications@yourdomain.com',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@yourdomain.com',
  },

  // Discord webhooks
  discord: {
    newUsers: process.env.DISCORD_WEBHOOK_NEW_USERS,
    approvals: process.env.DISCORD_WEBHOOK_APPROVALS,
    rejections: process.env.DISCORD_WEBHOOK_REJECTIONS,
    newProjects: process.env.DISCORD_WEBHOOK_NEW_PROJECTS,
    projectApprovals: process.env.DISCORD_WEBHOOK_PROJECT_APPROVALS,
    projectRejections: process.env.DISCORD_WEBHOOK_PROJECT_REJECTIONS,
    errors: process.env.DISCORD_WEBHOOK_ERRORS,
  },

  // App URLs
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    adminDashboard: '/admin',
  },

  // Discord embed colors
  colors: {
    blue: 0x3b82f6,      // Info, new items
    green: 0x10b981,     // Success, approvals
    red: 0xef4444,       // Errors, rejections
    yellow: 0xf59e0b,    // Warnings
    purple: 0x8b5cf6,    // Projects
    pink: 0xec4899,      // Special events
  },
};