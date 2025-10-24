import { sendEmail } from '../email';
import { sendDiscordNotification } from '../discord';
import { NOTIFICATION_CONFIG } from '../config';
import {
  getProjectApprovedEmailHTML,
  getProjectRejectedEmailHTML,
  getNewProjectAdminEmailHTML,
} from '../templates/project-emails';
import logger from '../../../utils/logger';

/**
 * Notify admins when a new project is submitted
 */
export async function notifyNewProjectSubmission(project: {
  id: number;
  title: string;
  description?: string;
  category?: string;
  member: {
    fullName?: string;
    user: {
      username: string;
      email: string;
    };
  };
}): Promise<void> {
  try {
    const submitterName = project.member.fullName || project.member.user.username;
    logger.info('Sending new project submission notifications', {
      projectId: project.id,
    });

    // Send Discord notification to admins
    await sendDiscordNotification(
      NOTIFICATION_CONFIG.discord.newProjects,
      {
        title: '📂 New Project Submitted',
        description: 'A new project is awaiting approval',
        color: NOTIFICATION_CONFIG.colors.purple,
        fields: [
          {
            name: '📝 Project Title',
            value: project.title,
            inline: false,
          },
          {
            name: '👤 Submitted by',
            value: submitterName,
            inline: true,
          },
          {
            name: '🏷️ Category',
            value: project.category || 'None',
            inline: true,
          },
          ...(project.description
            ? [
                {
                  name: '📄 Description',
                  value:
                    project.description.length > 200
                      ? project.description.substring(0, 200) + '...'
                      : project.description,
                  inline: false,
                },
              ]
            : []),
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Go to Admin Dashboard to review',
        },
      }
    );

    // Send email to admins
    await sendEmail({
      to: NOTIFICATION_CONFIG.email.adminEmail,
      subject: '📂 New Project Submission - Review Required',
      html: getNewProjectAdminEmailHTML({
        id: project.id,
        title: project.title,
        description: project.description,
        category: project.category,
        submitterName,
      }),
    });

    logger.info('New project submission notifications sent successfully', {
      projectId: project.id,
    });
  } catch (error: any) {
    logger.error('Error sending project submission notifications', {
      error: error.message,
      projectId: project.id,
    });
  }
}

/**
 * Notify project author when their project is approved
 */
export async function notifyProjectApproved(project: {
  id: number;
  title: string;
  member: {
    fullName?: string;
    user: {
      username: string;
      email: string;
    };
  };
}): Promise<void> {
  try {
    const submitterName = project.member.fullName || project.member.user.username;
    logger.info('Sending project approval notifications', {
      projectId: project.id,
    });

    // Send Discord notification to announcement channel
    await sendDiscordNotification(
      NOTIFICATION_CONFIG.discord.projectApprovals,
      {
        title: '✅ Project Approved',
        description: `"${project.title}" has been approved and is now live`,
        color: NOTIFICATION_CONFIG.colors.green,
        fields: [
          {
            name: '📝 Project',
            value: project.title,
            inline: true,
          },
          {
            name: '👤 Author',
            value: submitterName,
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
      }
    );

    // Send email to project author
    await sendEmail({
      to: project.member.user.email,
      subject: '🎉 Your Project Has Been Approved!',
      html: getProjectApprovedEmailHTML({
        title: project.title,
        memberName: submitterName,
      }),
    });

    logger.info('Project approval notifications sent successfully', {
      projectId: project.id,
    });
  } catch (error: any) {
    logger.error('Error sending project approval notifications', {
      error: error.message,
      projectId: project.id,
    });
  }
}

/**
 * Notify project author when their project is rejected
 */
export async function notifyProjectRejected(
  project: {
    id: number;
    title: string;
    member: {
      fullName?: string;
      user: {
        username: string;
        email: string;
      };
    };
  },
  reason?: string
): Promise<void> {
  try {
    const submitterName = project.member.fullName || project.member.user.username;
    logger.info('Sending project rejection notification', {
      projectId: project.id,
    });

    // Send email to project author
    await sendEmail({
      to: project.member.user.email,
      subject: '📋 Project Review Update',
      html: getProjectRejectedEmailHTML({
        title: project.title,
        memberName: submitterName,
        reason,
      }),
    });

    logger.info('Project rejection notification sent successfully', {
      projectId: project.id,
    });
  } catch (error: any) {
    logger.error('Error sending project rejection notification', {
      error: error.message,
      projectId: project.id,
    });
  }
}