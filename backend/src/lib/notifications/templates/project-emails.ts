import { NOTIFICATION_CONFIG } from '../config';

export function getProjectApprovedEmailHTML(project: {
  title: string;
  memberName: string;
}): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Project Approved!</h1>
      </div>
      
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          Hi <strong>${project.memberName}</strong>,
        </p>
        
        <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
          Your project <strong>"${project.title}"</strong> has been approved and is now visible to the community!
        </p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 25px 0;">
          <p style="margin: 0; color: #065f46; font-size: 15px;">
            ✅ Your project is now live and can be discovered by other members.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${NOTIFICATION_CONFIG.app.url}/projects" 
             style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            View Your Project →
          </a>
        </div>
      </div>
    </div>
  `;
}

export function getProjectRejectedEmailHTML(project: {
  title: string;
  memberName: string;
  reason?: string;
}): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #ef4444; border-bottom: 3px solid #ef4444; padding-bottom: 10px;">
        📋 Project Review Update
      </h2>
      
      <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
        Hi <strong>${project.memberName}</strong>,
      </p>
      
      <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
        Thank you for submitting <strong>"${project.title}"</strong>. After review, we're unable to approve it at this time.
      </p>
      
      ${project.reason ? `
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 25px 0;">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #991b1b;">Reason:</p>
          <p style="margin: 0; color: #991b1b;">${project.reason}</p>
        </div>
      ` : ''}
      
      <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
        You're welcome to revise and resubmit your project. If you have questions, please reach out to our team.
      </p>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${NOTIFICATION_CONFIG.app.url}/projects/new" 
           style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Submit New Project →
        </a>
      </div>
    </div>
  `;
}

export function getNewProjectAdminEmailHTML(project: {
  id: number;
  title: string;
  description?: string;
  category?: string;
  submitterName: string;
}): string {
  const adminUrl = `${NOTIFICATION_CONFIG.app.url}${NOTIFICATION_CONFIG.app.adminDashboard}?tab=projects`;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #8b5cf6; border-bottom: 3px solid #8b5cf6; padding-bottom: 10px;">
        📂 New Project Submission - Review Required
      </h2>
      
      <p style="font-size: 16px; color: #374151;">
        A member has submitted a new project for review:
      </p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1f2937;">${project.title}</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #1f2937;">Submitted by:</td>
            <td style="padding: 8px 0; color: #374151;">${project.submitterName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #1f2937;">Category:</td>
            <td style="padding: 8px 0; color: #374151;">${project.category || 'None'}</td>
          </tr>
        </table>
        ${project.description ? `
          <p style="margin-top: 15px; color: #6b7280; font-style: italic;">
            "${project.description}"
          </p>
        ` : ''}
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${adminUrl}" 
           style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Review Project →
        </a>
      </div>
    </div>
  `;
}