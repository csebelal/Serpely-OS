/**
 * Sincly Autonomous AI Marketing OS — Public Webhook Hub Engine
 * Unified ingestion hub for n8n, Make.com, Shopify & WordPress.
 * Autonomously normalizes incoming payloads, synthesizes platform-tailored
 * Omnipost copy, generates branded SVG visuals, and triggers the publishing queue.
 */

import {
  ConnectedSocialPage,
  PageSocialPost,
  SocialPagePlatform,
  SocialVisualCardConfig,
  ApprovalItem,
  AutomationRule,
  WebhookHubConfig,
  WebhookLogEntry
} from './types';
import { generateBrandedSocialSvgDataUri } from './data/mock-data';
import { predictPostVirality } from './social/viralityPredictor';

export interface NormalizedWebhookItem {
  source: 'Shopify' | 'WordPress' | 'n8n' | 'Make.com' | 'Custom';
  eventType: string;
  title: string;
  description: string;
  price?: string;
  vendor?: string;
  author?: string;
  url: string;
  imageUrl?: string;
  tags: string[];
  productType?: string;
  category?: string;
  rawPayload: any;
  targetPlatforms?: SocialPagePlatform[];
  routingMode?: 'smart_queue' | 'approval_gate' | 'instant_publish';
}

/**
 * Strips HTML tags and excessive whitespace from content strings
 */
function stripHtml(input: any): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes incoming webhook payloads across Shopify, WordPress, n8n, Make.com, and custom formats
 */
export function normalizeIncomingPayload(
  rawBody: any,
  headers: Record<string, any> = {},
  query: Record<string, any> = {},
  hintedSource?: string
): NormalizedWebhookItem {
  const body = rawBody || {};
  const topicHeader = (headers['x-shopify-topic'] || headers['x-wp-webhook'] || headers['x-webhook-event'] || '').toString();
  const userAgent = (headers['user-agent'] || '').toString().toLowerCase();

  // 1. Detect Source
  let source: 'Shopify' | 'WordPress' | 'n8n' | 'Make.com' | 'Custom' = 'Custom';
  if (hintedSource) {
    const s = hintedSource.toLowerCase();
    if (s.includes('shopify')) source = 'Shopify';
    else if (s.includes('wordpress') || s.includes('wp')) source = 'WordPress';
    else if (s.includes('n8n')) source = 'n8n';
    else if (s.includes('make')) source = 'Make.com';
  } else if (headers['x-shopify-topic'] || headers['x-shopify-shop-domain'] || body.variants !== undefined) {
    source = 'Shopify';
  } else if (headers['x-wp-webhook'] || body.post_title !== undefined || body.post_content !== undefined || (body.title?.rendered !== undefined)) {
    source = 'WordPress';
  } else if (userAgent.includes('n8n') || body._n8n !== undefined || headers['x-n8n-webhook'] !== undefined) {
    source = 'n8n';
  } else if (userAgent.includes('make') || userAgent.includes('integromat') || body._make !== undefined) {
    source = 'Make.com';
  }

  // 2. Normalization per source
  if (source === 'Shopify') {
    const title = String(body.title || body.name || body.product_title || 'Untitled Product');
    const description = stripHtml(body.body_html || body.description || body.summary || '');
    const priceVal = body.variants?.[0]?.price || body.price || body.variants?.[0]?.price_amount;
    const price = priceVal ? `$${parseFloat(priceVal).toFixed(2)}` : '$89.00';
    const vendor = String(body.vendor || body.brand || 'Our Store');
    const productType = String(body.product_type || body.category || 'Product Launch');
    const shopDomain = headers['x-shopify-shop-domain'] || query.shop || 'shop.sincly.app';
    const handle = body.handle || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const url = body.url || body.online_store_url || `https://${shopDomain}/products/${handle}`;
    const imageUrl = body.image?.src || body.images?.[0]?.src || body.image_url || '';
    
    let tags: string[] = [];
    if (Array.isArray(body.tags)) tags = body.tags;
    else if (typeof body.tags === 'string') tags = body.tags.split(',').map((t: string) => t.trim());
    else tags = ['NewArrival', 'Ecommerce', 'ProductLaunch'];

    return {
      source: 'Shopify',
      eventType: topicHeader || 'products/create',
      title,
      description,
      price,
      vendor,
      url,
      imageUrl,
      tags,
      productType,
      rawPayload: body,
      targetPlatforms: body.platforms,
      routingMode: body.mode
    };
  }

  if (source === 'WordPress') {
    const title = stripHtml(body.post_title || body.title?.rendered || body.title || 'New Insight Article');
    const description = stripHtml(body.post_excerpt || body.excerpt?.rendered || body.post_content || body.content?.rendered || body.body || '');
    const url = body.post_permalink || body.permalink || body.link || body.url || 'https://blog.sincly.app';
    const author = String(body.post_author_name || body.author_name || body.author || 'Editorial Team');
    const imageUrl = body.featured_image || body.jetpack_featured_media_url || body.image_url || '';
    
    let tags: string[] = [];
    if (Array.isArray(body.categories)) tags.push(...body.categories.map((c: any) => typeof c === 'string' ? c : c.name));
    if (Array.isArray(body.post_tags)) tags.push(...body.post_tags.map((t: any) => typeof t === 'string' ? t : t.name));
    if (tags.length === 0) tags = ['Growth', 'Marketing', 'AIInsights', 'Strategy'];

    return {
      source: 'WordPress',
      eventType: topicHeader || 'publish_post',
      title,
      description: description.slice(0, 360),
      author,
      url,
      imageUrl,
      tags,
      rawPayload: body,
      targetPlatforms: body.platforms,
      routingMode: body.mode
    };
  }

  // 3. Generic n8n, Make.com, or Custom Payload
  const title = stripHtml(body.title || body.name || body.subject || body.headline || 'Automated Webhook Dispatch');
  const description = stripHtml(body.content || body.description || body.summary || body.text || body.body || '');
  const url = body.url || body.link || body.permalink || 'https://sincly.app';
  const price = body.price ? `$${parseFloat(body.price).toFixed(2)}` : undefined;
  const vendor = body.vendor || body.brand;
  const author = body.author || body.sender;
  const imageUrl = body.imageUrl || body.image || body.image_url;
  
  let tags: string[] = [];
  if (Array.isArray(body.tags)) tags = body.tags;
  else if (typeof body.tags === 'string') tags = body.tags.split(',').map((t: string) => t.trim());
  else tags = ['Omnipost', 'Automation', 'SinclyHub'];

  return {
    source,
    eventType: body.event || body.type || 'webhook.incoming.dispatch',
    title,
    description: description.slice(0, 360),
    price,
    vendor,
    author,
    url,
    imageUrl,
    tags,
    rawPayload: body,
    targetPlatforms: body.platforms,
    routingMode: body.mode
  };
}

/**
 * Synthesizes platform-specific Omnipost copy for a given normalized item
 */
export function synthesizePlatformOmnipostCopy(
  item: NormalizedWebhookItem,
  platform: SocialPagePlatform,
  brandName: string = 'Sincly'
): { copy: string; hashtags: string[] } {
  const cleanTags = item.tags.slice(0, 5).map(t => `#${t.replace(/[^a-zA-Z0-9]/g, '')}`);
  const baseHashtags = cleanTags.length > 0 ? cleanTags : ['#Omnichannel', `#${brandName}`, '#Growth'];

  if (item.source === 'Shopify') {
    const priceStr = item.price ? ` · ${item.price}` : '';
    const vendorStr = item.vendor ? ` from ${item.vendor}` : '';
    const descExcerpt = item.description ? `\n\n"${item.description.slice(0, 160)}..."` : '';

    switch (platform) {
      case 'LinkedIn':
        return {
          copy: `🚀 Exciting Product Launch: ${item.title}${vendorStr}\n\nWe are proud to introduce ${item.title}${priceStr}. Designed for teams and individuals seeking exceptional craftsmanship, durability, and modern engineering.${descExcerpt}\n\n✨ Why it matters:\n• Premium category innovation (${item.productType || 'Flagship Edition'})\n• Streamlined for direct customer satisfaction\n• Ready for immediate global dispatch\n\nDiscover the release details & order directly:\n👉 ${item.url}\n\n${baseHashtags.join(' ')}`,
          hashtags: baseHashtags
        };
      case 'Facebook':
        return {
          copy: `🔥 JUST IN: Introducing ${item.title}!${priceStr}\n\nLooking for your next upgrade? ${item.title} has officially landed in our store!${descExcerpt}\n\n📦 Available right now:\n✅ Official ${brandName} verified quality\n✅ Express fulfillment\n✅ Starting at only ${item.price || 'special launch pricing'}\n\nTap below to check out the details and grab yours:\n🔗 ${item.url}\n\n${baseHashtags.join(' ')}`,
          hashtags: baseHashtags
        };
      case 'X':
        return {
          copy: `⚡ JUST DROPPED: ${item.title}${priceStr}!\n\n${item.description.slice(0, 100)}...\n\nGrab yours here 👇\n${item.url}\n\n${baseHashtags.slice(0, 3).join(' ')}`,
          hashtags: baseHashtags.slice(0, 3)
        };
      case 'Instagram':
        return {
          copy: `✨ New Arrival: ${item.title}${priceStr}.\n\nCrafted with premium attention to detail. Available now in limited release quantities.${descExcerpt}\n\nTap the link in our bio to shop today.\n.\n.\n${baseHashtags.join(' ')}`,
          hashtags: baseHashtags
        };
      case 'YouTube':
        return {
          copy: `📢 Community Announcement: ${item.title} is now available!\n\nCheck out the newest release in our store (${item.price || 'Special Edition'}). Full product details and order link: ${item.url}`,
          hashtags: baseHashtags
        };
    }
  }

  if (item.source === 'WordPress') {
    const authorStr = item.author ? `By ${item.author}` : `By ${brandName} Research`;
    const excerpt = item.description || 'Deep-dive tactical framework for scaling modern digital operations.';

    switch (platform) {
      case 'LinkedIn':
        return {
          copy: `💡 Fresh Article: ${item.title}\n\nMost strategies fail because they miss this core bottleneck: "${excerpt.slice(0, 140)}..."\n\nIn our latest long-form analysis, we break down:\n1. The strategic shift transforming feed performance\n2. Real-world implementation benchmarks\n3. Actionable playbooks you can execute today\n\n${authorStr}\n\nRead the complete deep dive:\n🔗 ${item.url}\n\n${baseHashtags.join(' ')}`,
          hashtags: baseHashtags
        };
      case 'Facebook':
        return {
          copy: `📖 NEW BLOG POST: "${item.title}"\n\n"${excerpt.slice(0, 200)}..."\n\nHow is your team handling this shift? We’d love to hear your thoughts in the comments below!\n\nRead the full post here 👉 ${item.url}\n\n${baseHashtags.join(' ')}`,
          hashtags: baseHashtags
        };
      case 'X':
        return {
          copy: `🧵 Deep Dive: ${item.title}\n\n"${excerpt.slice(0, 120)}..."\n\nRead the full breakdown 👇\n${item.url}\n\n${baseHashtags.slice(0, 3).join(' ')}`,
          hashtags: baseHashtags.slice(0, 3)
        };
      case 'Instagram':
        return {
          copy: `📝 Just Published on the Blog: ${item.title}\n\nSwipe through for the 3 key strategic lessons.\n\nRead the full piece via the link in our bio!\n.\n.\n${baseHashtags.join(' ')}`,
          hashtags: baseHashtags
        };
      case 'YouTube':
        return {
          copy: `📰 New Editorial Release: "${item.title}".\n\nWe just dropped a major breakdown on the blog. Read the full article here: ${item.url}`,
          hashtags: baseHashtags
        };
    }
  }

  // Generic / n8n / Make
  return {
    copy: `🚀 ${item.title}\n\n${item.description}\n\nLearn more & explore full details:\n👉 ${item.url}\n\n${baseHashtags.join(' ')}`,
    hashtags: baseHashtags
  };
}

/**
 * Builds high-converting Visual SVG Card configuration
 */
export function buildWebhookVisualCardConfig(
  item: NormalizedWebhookItem,
  brandName: string = 'Sincly'
): SocialVisualCardConfig {
  const isShopify = item.source === 'Shopify';
  const isWordpress = item.source === 'WordPress';

  if (isShopify) {
    return {
      headline: item.title.slice(0, 48),
      subheadline: item.vendor ? `Designed by ${item.vendor}` : 'New eCommerce Release',
      metricValue: item.price || '$99',
      metricLabel: 'Launch Price',
      keywordTag: 'PRODUCT LAUNCH',
      theme: 'emerald-matrix',
      footerBrand: brandName,
      layout: 'stat-spotlight'
    };
  }

  if (isWordpress) {
    return {
      headline: item.title.slice(0, 52),
      subheadline: item.author ? `Authored by ${item.author}` : 'Fresh Editorial Playbook',
      metricValue: 'INSIGHT',
      metricLabel: 'Thought Leadership',
      keywordTag: 'ARTICLE',
      theme: 'linkedin-executive',
      footerBrand: brandName,
      layout: 'checklist-roadmap'
    };
  }

  return {
    headline: item.title.slice(0, 48),
    subheadline: 'Automated Multi-Channel Dispatch',
    metricValue: 'OMNIPOST',
    metricLabel: 'Webhook Ingest',
    keywordTag: 'AUTOMATION',
    theme: 'facebook-cobalt',
    footerBrand: brandName,
    layout: 'stat-spotlight'
  };
}

/**
 * Dispatches an incoming webhook:
 * - Authenticates request
 * - Normalizes payload
 * - Generates omnichannel posts for all target platforms
 * - Queues into Sincly's pagePosts and approvals
 * - Updates automations telemetry
 * - Logs to webhookLogs
 */
export async function executeWebhookDispatch(
  rawBody: any,
  headers: Record<string, any> = {},
  query: Record<string, any> = {},
  db: any,
  saveDbFn: (db: any) => void,
  hintedSource?: string
): Promise<{
  success: boolean;
  status: number;
  message: string;
  source: string;
  eventType: string;
  title: string;
  queuedCount: number;
  routingMode: string;
  posts: PageSocialPost[];
  approvalIds: string[];
  logEntry: WebhookLogEntry;
}> {
  const startTime = Date.now();

  // 1. Initialize configuration if missing
  if (!db.webhookConfig) {
    db.webhookConfig = {
      enabled: true,
      secretToken: 'snc_wh_' + Math.random().toString(36).substring(2, 10),
      requireSecret: false,
      routingMode: 'smart_queue',
      targetPlatforms: ['LinkedIn', 'Facebook', 'Instagram', 'X'],
      autoGenerateVisuals: true,
      brandTone: 'Executive Authority & Social Engagement'
    } as WebhookHubConfig;
  }

  const config: WebhookHubConfig = db.webhookConfig;

  if (!config.enabled) {
    throw new Error('Public Webhook Hub is currently disabled in Sincly Settings.');
  }

  // 2. Secret Token Authentication Check
  const incomingSecret =
    headers['x-sincly-webhook-secret'] ||
    headers['x-webhook-secret'] ||
    query.secret ||
    query.token ||
    (headers['authorization']?.startsWith('Bearer ') ? headers['authorization'].slice(7).trim() : '');

  if (config.requireSecret) {
    if (!incomingSecret || incomingSecret !== config.secretToken) {
      const authErr = new Error('Unauthorized: Invalid or missing X-Sincly-Webhook-Secret');
      (authErr as any).statusCode = 401;
      throw authErr;
    }
  }

  // 3. Normalize incoming payload
  const item = normalizeIncomingPayload(rawBody, headers, query, hintedSource);

  // 4. Resolve Target Platforms and Routing Mode
  const targetPlatforms: SocialPagePlatform[] =
    item.targetPlatforms && item.targetPlatforms.length > 0
      ? item.targetPlatforms
      : (config.targetPlatforms && config.targetPlatforms.length > 0
          ? config.targetPlatforms
          : ['LinkedIn', 'Facebook', 'Instagram', 'X']);

  const routingMode = item.routingMode || config.routingMode || 'smart_queue';
  const brandName = db.brandProfile?.name || 'Sincly';

  if (!Array.isArray(db.pagePosts)) db.pagePosts = [];
  if (!Array.isArray(db.approvals)) db.approvals = [];
  if (!Array.isArray(db.webhookLogs)) db.webhookLogs = [];

  const createdPosts: PageSocialPost[] = [];
  const createdApprovalIds: string[] = [];

  // 5. Generate Visual Card SVG
  const cardConfig = buildWebhookVisualCardConfig(item, brandName);
  const cardSvgUri = generateBrandedSocialSvgDataUri(cardConfig);

  // 6. Build posts for each target platform
  for (let idx = 0; idx < targetPlatforms.length; idx++) {
    const platform = targetPlatforms[idx];
    const { copy, hashtags } = synthesizePlatformOmnipostCopy(item, platform, brandName);

    // Predict virality score
    const virality = predictPostVirality({ platform, content: copy, hashtags });

    // Find connected page profile if available
    const matchedPage: ConnectedSocialPage | undefined = (db.connectedPages || []).find(
      (p: ConnectedSocialPage) => p.platform?.toLowerCase() === platform.toLowerCase()
    );

    const postId = `post-wh-${platform.toLowerCase()}-${Date.now()}-${idx}`;
    const approvalId = `app-wh-${platform.toLowerCase()}-${Date.now()}-${idx}`;

    let postStatus: 'draft' | 'pending_approval' | 'published' = 'draft';
    if (routingMode === 'instant_publish') {
      postStatus = 'published';
    } else if (routingMode === 'approval_gate') {
      postStatus = 'pending_approval';
    } else {
      // smart_queue
      postStatus = 'draft';
    }

    const scheduledLabel =
      routingMode === 'smart_queue'
        ? `Queued for ${virality.smartTiming.dayOfWeek} ${virality.smartTiming.recommendedTime} (${virality.smartTiming.peakWindowLabel})`
        : undefined;

    const newPost: PageSocialPost = {
      id: postId,
      platform,
      pageId: matchedPage?.id || `page-${platform.toLowerCase()}-1`,
      pageName: matchedPage?.pageName || `${brandName} ${platform}`,
      pageHandle: matchedPage?.pageHandle || `@${brandName.toLowerCase().replace(/\s+/g, '')}.${platform.toLowerCase()}`,
      keyword: item.title.slice(0, 48),
      researchBrief: {
        keyword: item.title.slice(0, 48),
        searchVolume: item.source === 'Shopify' ? '14,200/mo' : '9,600/mo',
        difficultyScore: 30,
        buyerIntent: item.source === 'Shopify' ? 'Transactional' : 'Informational',
        competitorGap: `${item.source} publication trigger. Auto-synthesized omnichannel coverage.`,
        audiencePainPoint: 'Time lag between publication and multi-channel promotion.',
        keyBenchmarkStat: '5.2x Faster Omnichannel Coverage',
        recommendedAngles: {
          linkedinAngle: 'Executive & Strategic Value Proposition',
          facebookAngle: 'Direct Social Commerce & Community Engagement'
        }
      },
      visualConfig: cardConfig,
      visualUrl: cardSvgUri,
      content: copy,
      hashtags,
      status: postStatus,
      createdAt: scheduledLabel || `Just now (Webhook: ${item.source})`,
      publishedAt: routingMode === 'instant_publish' ? new Date().toISOString() : undefined,
      approvalId: routingMode === 'approval_gate' ? approvalId : undefined
    };

    createdPosts.push(newPost);
    db.pagePosts.unshift(newPost);

    // If approval gate routing is selected, add to approvals table
    if (routingMode === 'approval_gate') {
      const approvalItem: ApprovalItem = {
        id: approvalId,
        title: `[Webhook Hub: ${item.source}] ${platform} Omnipost: ${item.title.slice(0, 36)}...`,
        agent: 'social',
        contentType: 'social-post',
        platform: platform as any,
        riskLevel: 'low',
        status: 'pending',
        campaign: `Webhook: ${item.source}`,
        submittedAt: 'Just now (Webhook Hub)',
        preview: copy,
        riskReason: `Autonomous omnichannel post staged via incoming ${item.source} webhook for "${item.title}".`
      };
      createdApprovalIds.push(approvalId);
      db.approvals.unshift(approvalItem);
    }
  }

  // 7. Update Automations telemetry
  if (Array.isArray(db.automations)) {
    let matchedRule = db.automations.find(
      (a: AutomationRule) =>
        a.triggerEvent === item.eventType ||
        (item.source === 'Shopify' && a.triggerEvent.includes('shopify')) ||
        (item.source === 'WordPress' && a.triggerEvent.includes('wordpress')) ||
        a.triggerEvent === 'webhook.incoming.dispatch'
    );

    if (matchedRule) {
      matchedRule.timesTriggered = (matchedRule.timesTriggered || 0) + 1;
      matchedRule.lastTriggered = 'Just now';
    }
  }

  // 8. Create Webhook Log Entry
  const latencyMs = Date.now() - startTime;
  const logEntry: WebhookLogEntry = {
    id: `whl-${Date.now()}`,
    timestamp: new Date().toISOString(),
    source: item.source,
    eventType: item.eventType,
    title: item.title,
    url: item.url,
    price: item.price,
    status: 'queued',
    generatedPostsCount: createdPosts.length,
    postIds: createdPosts.map(p => p.id),
    approvalIds: createdApprovalIds,
    payloadSummary: `${item.source} (${item.eventType}): "${item.title}" · ${createdPosts.length} posts staged into ${routingMode}`,
    rawPayloadSnippet: JSON.stringify(item.rawPayload).slice(0, 600),
    latencyMs
  };

  db.webhookLogs.unshift(logEntry);
  if (db.webhookLogs.length > 50) {
    db.webhookLogs = db.webhookLogs.slice(0, 50);
  }

  // 9. Persist to SQL
  saveDbFn(db);

  return {
    success: true,
    status: 200,
    message: `Successfully processed ${item.source} webhook. Queued ${createdPosts.length} omnichannel posts across ${targetPlatforms.join(', ')} into ${routingMode}!`,
    source: item.source,
    eventType: item.eventType,
    title: item.title,
    queuedCount: createdPosts.length,
    routingMode,
    posts: createdPosts,
    approvalIds: createdApprovalIds,
    logEntry
  };
}
