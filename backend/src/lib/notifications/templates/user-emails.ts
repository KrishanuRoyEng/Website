import { NOTIFICATION_CONFIG } from '../config';

export function getUserApprovedEmailHTML(username: string): string {
  const dashboardUrl = `${NOTIFICATION_CONFIG.app.url}/dashboard`;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome Aboard!</h1>
      </div>
      
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          Hi <strong>${username}</strong>,
        </p>
        
        <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
          Great news! Your account has been approved and you now have full access to our platform.
        </p>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 25px 0;">
          <p style="margin: 0 0 15px 0; font-weight: bold; color: #065f46;">What you can do now:</p>
          <ul style="margin: 0; padding-left: 20px; color: #065f46;">
            <li style="margin-bottom: 8px;">Complete your profile</li>
            <li style="margin-bottom: 8px;">Browse and join projects</li>
            <li style="margin-bottom: 8px;">Connect with other members</li>
            <li style="margin-bottom: 8px;">Participate in events</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Go to Dashboard →
          </a>
        </div>
        
        <p style="margin-top: 30px; color: #6b7280; font-size: 14px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          If you have any questions, feel free to reach out to our support team.
        </p>
      </div>
    </div>
  `;
}

export function getUserRejectedEmailHTML(username: string, reason: string): string {
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">📋 Application Update</h1>
      </div>
      
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          Hi <strong>${username}</strong>,
        </p>
        
        <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
          Thank you for your interest in joining Coding Club!. After careful review, we regret to inform you that your application has not been approved at this time.
        </p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 25px 0;">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #7f1d1d;">Reason for Rejection:</p>
          <p style="margin: 0; color: #7f1d1d; font-style: italic; line-height: 1.5;">
            "${reason}"
          </p>
        </div>
        
        <div style="background: #fffbeb; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 25px 0;">
          <p style="margin: 0 0 15px 0; font-weight: bold; color: #92400e;">What you can do:</p>
          <ul style="margin: 0; padding-left: 20px; color: #92400e;">
            <li style="margin-bottom: 8px;">Review and improve your profile information</li>
            <li style="margin-bottom: 8px;">Ensure your GitHub profile is complete and active</li>
            <li style="margin-bottom: 8px;">Consider gaining more relevant experience</li>
            <li style="margin-bottom: 8px;">You may reapply in the future</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #6b7280; margin-bottom: 15px;">
            If you believe this was a mistake or would like more information:
          </p>
             style="display: inline-block; background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
            Contact Support
          </a>
        </div>
        
        <p style="margin-top: 30px; color: #6b7280; font-size: 14px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          We appreciate your understanding and wish you the best in your coding journey.
        </p>
      </div>
    </div>
  `;
}

export function getNewUserAdminEmailHTML(user: {
  id: number;
  username: string;
  email: string;
  createdAt: Date;
}): string {
  const adminUrl = `${NOTIFICATION_CONFIG.app.url}${NOTIFICATION_CONFIG.app.adminDashboard}`;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #3b82f6; border-bottom: 3px solid #3b82f6; padding-bottom: 10px;">
        🎉 New User Signup - Action Required
      </h2>
      
      <p style="font-size: 16px; color: #374151;">
        A new user has signed up and is awaiting approval:
      </p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #1f2937;">Username:</td>
            <td style="padding: 8px 0; color: #374151;">${user.username}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #1f2937;">Email:</td>
            <td style="padding: 8px 0; color: #374151;">${user.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #1f2937;">User ID:</td>
            <td style="padding: 8px 0; color: #374151;">${user.id}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #1f2937;">Signed up:</td>
            <td style="padding: 8px 0; color: #374151;">${new Date(user.createdAt).toLocaleString()}</td>
          </tr>
        </table>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${adminUrl}" 
           style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Go to Admin Dashboard →
        </a>
      </div>
    </div>
  `;
}