import { sendEmail } from "../email";
import { sendDiscordNotification } from "../discord";
import { NOTIFICATION_CONFIG } from "../config";
import {
  getUserApprovedEmailHTML,
  getNewUserAdminEmailHTML,
} from "../templates/user-emails";
import logger from "../../../utils/logger";

/**
 * Notify admins when a new user signs up
 */
export async function notifyNewUserSignup(user: {
  id: number;
  username: string;
  email: string | null;
  avatarUrl?: string | null;
  createdAt: Date;
}): Promise<void> {
  try {
    logger.info("Sending new user signup notifications", { userId: user.id });

    // Send Discord notification to admins
    await sendDiscordNotification(
      NOTIFICATION_CONFIG.discord.newUsers,
      {
        title: "🎉 New User Signup",
        description: "A new user has registered and is awaiting approval",
        color: NOTIFICATION_CONFIG.colors.blue,
        fields: [
          {
            name: "👤 Username",
            value: user.username,
            inline: true,
          },
          {
            name: "📧 Email",
            value: user.email ?? "N.A.",
            inline: true,
          },
          {
            name: "🆔 User ID",
            value: user.id.toString(),
            inline: true,
          },
          {
            name: "📅 Signed up",
            value: new Date(user.createdAt).toLocaleString(),
            inline: false,
          },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: "Go to Admin Dashboard to approve",
        },
        ...(user.avatarUrl && {
          thumbnail: {
            url: user.avatarUrl,
          },
        }),
      }
    );

    // Send email to admins
    if (user.email) {
      await sendEmail({
        to: NOTIFICATION_CONFIG.email.adminEmail,
        subject: "🎉 New User Signup - Action Required",
        html: getNewUserAdminEmailHTML({
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        }),
      });
    } else {
      logger.warn("Skipping admin email: New user has no email", {
        userId: user.id,
      });
    }

    logger.info("New user signup notifications sent successfully", {
      userId: user.id,
    });
  } catch (error: any) {
    logger.error("Error sending new user signup notifications", {
      error: error.message,
      userId: user.id,
    });
    // Don't throw - notification failures shouldn't break signup
  }
}

/**
 * Notify user when their account is approved
 */
export async function notifyUserApproved(user: {
  id: number;
  username: string;
  email: string | null;
}): Promise<void> {
  try {
    logger.info("Sending user approval notifications", { userId: user.id });

    // Send Discord notification
    await sendDiscordNotification(NOTIFICATION_CONFIG.discord.approvals, {
      title: "✅ User Approved",
      description: `${user.username} has been approved and can now access the platform`,
      color: NOTIFICATION_CONFIG.colors.green,
      fields: [
        {
          name: "👤 Username",
          value: user.username,
          inline: true,
        },
        {
          name: "📧 Email",
          value: user.email ?? "N.A.",
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
    });

    // GUARD CLASE - Do not proceed if user has no email
    if (!user.email) {
      logger.warn("Skipping approval email: User has no email", {
        userId: user.id,
        username: user.username,
      });
      return;
    }

    // Send email to user
    await sendEmail({
      to: user.email,
      subject: "🎉 Your Account Has Been Approved!",
      html: getUserApprovedEmailHTML(user.username),
    });

    logger.info("User approval notifications sent successfully", {
      userId: user.id,
    });
  } catch (error: any) {
    logger.error("Error sending user approval notifications", {
      error: error.message,
      userId: user.id,
    });
  }
}