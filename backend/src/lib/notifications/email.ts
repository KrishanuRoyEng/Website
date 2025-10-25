  import { Resend } from 'resend';
  import logger from '../../utils/logger';
  import { NOTIFICATION_CONFIG } from './config';

  const resend = new Resend(process.env.RESEND_API_KEY);

  export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }

  /**
   * Send an email using Resend
   */
  export async function sendEmail(options: EmailOptions) {
    const { to, subject, html, from = NOTIFICATION_CONFIG.email.from } = options;

    if (!process.env.RESEND_API_KEY) {
      logger.warn('Resend API key not configured, skipping email');
      return { success: false, error: 'API key not configured' };
    }

    try {
      const { data, error } = await resend.emails.send({
        from,
        to,
        subject,
        html,
      });

      if (error) {
        logger.error('Failed to send email', {
          error: error.message,
          to,
          subject,
        });
        return { success: false, error };
      }

      logger.info('Email sent successfully', {
        to,
        subject,
        emailId: data?.id,
      });
      
      return { success: true, data };
    } catch (error: any) {
      logger.error('Failed to send email', {
        error: error.message,
        to,
        subject,
      });
      return { success: false, error };
    }
  }