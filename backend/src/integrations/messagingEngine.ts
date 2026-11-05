/**
 * Sincly Autonomous AI Marketing OS — Slack & Discord Messaging Engine
 * Powers live and simulated notification dispatch, meeting alerts, lead alerts,
 * and community announcement webhooks across Slack and Discord workspaces.
 */

import { MeetingItem, SlackConfig, DiscordConfig, LeadItem, ApprovalItem } from '../types';

export interface DispatchResponse {
  success: boolean;
  channel: 'slack' | 'discord';
  target: string;
  simulated: boolean;
  timestamp: string;
  responsePreview?: string;
  error?: string;
}

/**
 * Dispatches a message to Slack via Incoming Webhook or Bot Token
 */
export async function dispatchSlackMessage(params: {
  config: SlackConfig;
  text: string;
  blocks?: any[];
}): Promise<DispatchResponse> {
  const { config, text, blocks } = params;
  const webhookUrl = config.webhookUrl || process.env.SLACK_WEBHOOK_URL;
  const botToken = config.botToken || process.env.SLACK_BOT_TOKEN;
  const channel = config.defaultChannel || '#general';

  // 1. Live Webhook Dispatch
  if (webhookUrl && webhookUrl.startsWith('https://hooks.slack.com')) {
    try {
      const payload: any = {
        text,
        channel
      };
      if (blocks && blocks.length > 0) {
        payload.blocks = blocks;
      }

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const bodyText = await res.text();
      if (res.ok) {
        console.log(`✅ [Slack Dispatch] Message posted to ${channel} via webhook.`);
        return {
          success: true,
          channel: 'slack',
          target: channel,
          simulated: false,
          timestamp: new Date().toISOString(),
          responsePreview: bodyText || 'ok'
        };
      } else {
        console.warn(`[Slack Dispatch] Webhook returned non-200: ${res.status} ${bodyText}`);
      }
    } catch (err: any) {
      console.warn(`[Slack Dispatch] Live webhook error: ${err.message}. Falling back to sandbox mode.`);
    }
  }

  // 2. Live Bot API (chat.postMessage)
  if (botToken && botToken.startsWith('xoxb-')) {
    try {
      const res = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${botToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channel: channel.replace(/^#/, ''),
          text,
          blocks
        })
      });

      const data = await res.json() as any;
      if (data.ok) {
        console.log(`✅ [Slack Bot API] Message posted to ${channel} (ts: ${data.ts}).`);
        return {
          success: true,
          channel: 'slack',
          target: channel,
          simulated: false,
          timestamp: new Date().toISOString(),
          responsePreview: `Message ts: ${data.ts}`
        };
      }
    } catch (err: any) {
      console.warn(`[Slack Bot API] Error: ${err.message}`);
    }
  }

  // 3. Sandbox / Simulation Mode
  console.log(`💬 [Slack Sandbox] Simulated dispatch to ${channel}: "${text.slice(0, 90)}..."`);
  return {
    success: true,
    channel: 'slack',
    target: channel,
    simulated: true,
    timestamp: new Date().toISOString(),
    responsePreview: `[Simulated Slack Dispatch to ${channel}]`
  };
}

/**
 * Dispatches a message to Discord via Incoming Webhook
 */
export async function dispatchDiscordMessage(params: {
  config: DiscordConfig;
  content?: string;
  embeds?: any[];
}): Promise<DispatchResponse> {
  const { config, content, embeds } = params;
  const webhookUrl = config.webhookUrl || process.env.DISCORD_WEBHOOK_URL;
  const targetChannel = config.defaultChannel || '#announcements';

  // 1. Live Discord Webhook Dispatch
  if (webhookUrl && webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
    try {
      const payload: any = {};
      if (content) payload.content = content;
      if (embeds && embeds.length > 0) payload.embeds = embeds;

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok || res.status === 204) {
        console.log(`✅ [Discord Dispatch] Embed message posted to ${targetChannel} via Discord webhook.`);
        return {
          success: true,
          channel: 'discord',
          target: targetChannel,
          simulated: false,
          timestamp: new Date().toISOString(),
          responsePreview: 'Discord webhook 204 No Content (Delivered)'
        };
      } else {
        const errText = await res.text();
        console.warn(`[Discord Dispatch] Webhook returned status ${res.status}: ${errText}`);
      }
    } catch (err: any) {
      console.warn(`[Discord Dispatch] Live webhook error: ${err.message}. Falling back to sandbox mode.`);
    }
  }

  // 2. Sandbox / Simulation Mode
  console.log(`🎮 [Discord Sandbox] Simulated dispatch to ${targetChannel}: "${(content || embeds?.[0]?.title || '').slice(0, 90)}..."`);
  return {
    success: true,
    channel: 'discord',
    target: targetChannel,
    simulated: true,
    timestamp: new Date().toISOString(),
    responsePreview: `[Simulated Discord Dispatch to ${targetChannel}]`
  };
}

/**
 * High-Level Meeting Scheduled Notification (Dispatches to Slack and/or Discord)
 */
export async function notifyMeetingScheduled(params: {
  meeting: MeetingItem;
  brandName?: string;
  slackConfig?: SlackConfig;
  discordConfig?: DiscordConfig;
}): Promise<{ slack?: DispatchResponse; discord?: DispatchResponse }> {
  const { meeting, brandName = 'Sincly', slackConfig, discordConfig } = params;
  const results: { slack?: DispatchResponse; discord?: DispatchResponse } = {};

  const typeLabels: Record<string, string> = {
    client_demo: '🚀 Client Product Demo',
    strategy_audit: '📊 Strategic IT & GEO Audit',
    discovery_call: '🔍 Discovery & Fit Call',
    quarterly_review: '📈 Quarterly Growth Review',
    technical_support: '🛠️ Technical Consultation'
  };
  const typeLabel = typeLabels[meeting.type] || '📅 Scheduled Meeting';

  // 1. Dispatch to Slack
  if (meeting.notifySlack && slackConfig) {
    const slackText = `*📅 New Meeting Booked:* ${meeting.title}\n*Client:* ${meeting.clientName} (${meeting.clientCompany || 'Company'}) | *Date:* ${meeting.scheduledDate} at ${meeting.scheduledTime} (${meeting.durationMinutes}m)\n*Join Link:* ${meeting.meetingUrl}`;
    const slackBlocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `📅 Meeting Confirmed: ${meeting.title.slice(0, 50)}`,
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Type:*\n${typeLabel}`
          },
          {
            type: 'mrkdwn',
            text: `*When:*\n${meeting.scheduledDate} @ ${meeting.scheduledTime}`
          },
          {
            type: 'mrkdwn',
            text: `*Client:*\n${meeting.clientName} <${meeting.clientEmail}>`
          },
          {
            type: 'mrkdwn',
            text: `*Company:*\n${meeting.clientCompany || 'Direct Client'}`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Meeting URL:* <${meeting.meetingUrl}|Click to Join via ${meeting.platform.toUpperCase().replace('_', ' ')}>\n*Agenda:* ${meeting.agenda || 'General strategic discovery'}`
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `⚡ Powered by *${brandName} Autonomous Meeting Scheduler*`
          }
        ]
      }
    ];

    results.slack = await dispatchSlackMessage({
      config: slackConfig,
      text: slackText,
      blocks: slackBlocks
    });
  }

  // 2. Dispatch to Discord
  if (meeting.notifyDiscord && discordConfig) {
    const discordEmbed = {
      title: `📅 ${typeLabel}: ${meeting.title}`,
      description: `A new client strategy call has been confirmed in **${brandName}**.`,
      color: 0x10b981, // Emerald Green
      fields: [
        {
          name: '👤 Client Name',
          value: `${meeting.clientName} (${meeting.clientCompany || 'Individual'})`,
          inline: true
        },
        {
          name: '✉️ Email',
          value: `\`${meeting.clientEmail}\``,
          inline: true
        },
        {
          name: '⏰ Date & Time',
          value: `**${meeting.scheduledDate}** at **${meeting.scheduledTime}** (${meeting.durationMinutes} mins)`,
          inline: false
        },
        {
          name: '🔗 Video Call Link',
          value: `[**Join via ${meeting.platform.toUpperCase().replace('_', ' ')}**](${meeting.meetingUrl})`,
          inline: false
        },
        {
          name: '📝 Discussion Agenda',
          value: meeting.agenda || 'Technical discovery and infrastructure review.',
          inline: false
        }
      ],
      footer: {
        text: `${brandName} Marketing OS • Automated Meeting Notification`,
        icon_url: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png'
      },
      timestamp: new Date().toISOString()
    };

    results.discord = await dispatchDiscordMessage({
      config: discordConfig,
      content: `🔔 **Meeting Alert:** New appointment booked with **${meeting.clientName}**!`,
      embeds: [discordEmbed]
    });
  }

  return results;
}

/**
 * Meeting Reminder Alert (e.g. 15-Minute Broadcast)
 */
export async function notifyMeetingReminder(params: {
  meeting: MeetingItem;
  brandName?: string;
  slackConfig?: SlackConfig;
  discordConfig?: DiscordConfig;
  minutesBefore?: number;
}): Promise<{ slack?: DispatchResponse; discord?: DispatchResponse }> {
  const { meeting, brandName = 'Sincly', slackConfig, discordConfig, minutesBefore = 15 } = params;
  const results: { slack?: DispatchResponse; discord?: DispatchResponse } = {};

  if (slackConfig) {
    results.slack = await dispatchSlackMessage({
      config: slackConfig,
      text: `⏰ *Meeting Starting in ${minutesBefore}m:* "${meeting.title}" with *${meeting.clientName}* (${meeting.clientCompany || 'Client'}) starts at *${meeting.scheduledTime}*!\n*Join Link:* ${meeting.meetingUrl}`
    });
  }

  if (discordConfig) {
    results.discord = await dispatchDiscordMessage({
      config: discordConfig,
      content: `⏰ **Meeting Starting in ${minutesBefore}m:** "${meeting.title}" with **${meeting.clientName}** starts at **${meeting.scheduledTime}**!\n🔗 **Join Call:** <${meeting.meetingUrl}>`
    });
  }

  return results;
}

/**
 * Lead ICP Alert (New B2B Lead Notification)
 */
export async function notifyLeadAlert(params: {
  lead: LeadItem;
  brandName?: string;
  slackConfig?: SlackConfig;
  discordConfig?: DiscordConfig;
}): Promise<{ slack?: DispatchResponse; discord?: DispatchResponse }> {
  const { lead, brandName = 'Sincly', slackConfig, discordConfig } = params;
  const results: { slack?: DispatchResponse; discord?: DispatchResponse } = {};

  if (slackConfig?.notifyOnLead) {
    results.slack = await dispatchSlackMessage({
      config: slackConfig,
      text: `🔥 *High-Intent Lead Detected:* ${lead.name} (${lead.role || 'Leader'} @ ${lead.company || 'Enterprise'})\n*Score:* ${lead.score}/100 | *Signal:* ${lead.detectedMessage}\n*Email:* ${lead.email || 'N/A'}`
    });
  }

  if (discordConfig?.notifyOnLead) {
    results.discord = await dispatchDiscordMessage({
      config: discordConfig,
      embeds: [
        {
          title: `🔥 High-Intent Lead Captured: ${lead.name}`,
          description: `A prospective B2B buyer has engaged on social channels.`,
          color: 0x8b5cf6, // Violet
          fields: [
            { name: 'Company', value: lead.company || 'N/A', inline: true },
            { name: 'Lead Score', value: `${lead.score}/100`, inline: true },
            { name: 'Signal Message', value: lead.detectedMessage || 'Requested consultation', inline: false }
          ],
          footer: { text: `${brandName} Lead CRM Engine` },
          timestamp: new Date().toISOString()
        }
      ]
    });
  }

  return results;
}
