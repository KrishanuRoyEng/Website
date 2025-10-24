import axios from 'axios';
import logger from '../../utils/logger';

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbed {
  title: string;
  description?: string;
  color: number;
  fields?: DiscordEmbedField[];
  timestamp?: string;
  footer?: {
    text: string;
    icon_url?: string;
  };
  thumbnail?: {
    url: string;
  };
}

/**
 * Send a notification to Discord via webhook
 * @param webhookUrl Discord webhook URL
 * @param embed Discord embed object
 * @param content Optional text content (for @mentions)
 */
export async function sendDiscordNotification(
  webhookUrl: string | undefined,
  embed: DiscordEmbed,
  content?: string
): Promise<void> {
  if (!webhookUrl) {
    logger.warn('Discord webhook URL not configured, skipping notification');
    return;
  }

  try {
    await axios.post(webhookUrl, {
      content,
      embeds: [embed],
    });
    
    logger.info('Discord notification sent successfully', {
      title: embed.title,
    });
  } catch (error: any) {
    logger.error('Failed to send Discord notification', {
      error: error.message,
      title: embed.title,
    });
    // Don't throw - we don't want Discord failures to break the app
  }
}

/**
 * Send a simple text message to Discord
 */
export async function sendDiscordMessage(
  webhookUrl: string | undefined,
  message: string
): Promise<void> {
  if (!webhookUrl) {
    logger.warn('Discord webhook URL not configured, skipping message');
    return;
  }

  try {
    await axios.post(webhookUrl, { content: message });
    logger.info('Discord message sent successfully');
  } catch (error: any) {
    logger.error('Failed to send Discord message', {
      error: error.message,
    });
  }
}
