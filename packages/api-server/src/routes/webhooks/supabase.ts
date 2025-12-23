import { Hono } from 'hono';
import crypto from 'crypto';

/**
 * Supabase Database Webhooks
 *
 * Handles webhooks from Supabase database triggers for:
 * - Syncing listings to Typesense
 * - Triggering portal cache revalidation
 *
 * Setup in Supabase:
 * 1. Go to Database > Webhooks
 * 2. Create webhook for 'listings' table on INSERT, UPDATE, DELETE
 * 3. Set URL to: https://api.yourplatform.com/api/webhooks/supabase
 * 4. Add header: x-supabase-signature: $webhook_secret
 */

export const supabaseWebhookRoutes = new Hono();

// Idempotency tracking (in production, use Redis or database)
const processedEvents = new Map<string, number>();
const IDEMPOTENCY_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Verify Supabase webhook signature
 */
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Check if event was already processed (idempotency)
 */
function isEventProcessed(eventId: string): boolean {
  const timestamp = processedEvents.get(eventId);
  if (timestamp && Date.now() - timestamp < IDEMPOTENCY_TTL) {
    return true;
  }
  return false;
}

/**
 * Mark event as processed
 */
function markEventProcessed(eventId: string): void {
  processedEvents.set(eventId, Date.now());

  // Cleanup old entries periodically
  if (processedEvents.size > 10000) {
    const now = Date.now();
    for (const [id, time] of processedEvents.entries()) {
      if (now - time > IDEMPOTENCY_TTL) {
        processedEvents.delete(id);
      }
    }
  }
}

/**
 * Generate event ID from webhook payload
 */
function generateEventId(payload: unknown): string {
  const str = JSON.stringify(payload);
  return crypto.createHash('md5').update(str).digest('hex');
}

interface SupabaseWebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: Record<string, unknown> | null;
  old_record: Record<string, unknown> | null;
}

/**
 * POST /api/webhooks/supabase
 * Handle Supabase database webhooks
 */
supabaseWebhookRoutes.post('/', async (c) => {
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;

  // Get raw body for signature verification
  const rawBody = await c.req.text();
  const signature = c.req.header('x-supabase-signature') || '';

  // Verify signature if secret is configured
  if (secret && signature) {
    if (!verifySignature(rawBody, signature, secret)) {
      return c.json({ error: 'Invalid signature' }, 401);
    }
  }

  let payload: SupabaseWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  // Check idempotency
  const eventId = generateEventId(payload);
  if (isEventProcessed(eventId)) {
    return c.json({ success: true, message: 'Event already processed' });
  }

  // Process based on table
  try {
    switch (payload.table) {
      case 'listings':
        await handleListingEvent(payload);
        break;
      case 'taxonomy_terms':
        await handleTaxonomyEvent(payload);
        break;
      default:
        console.log(`Unhandled table webhook: ${payload.table}`);
    }

    markEventProcessed(eventId);
    return c.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return c.json({ error: 'Processing failed' }, 500);
  }
});

/**
 * Handle listing table events
 */
async function handleListingEvent(payload: SupabaseWebhookPayload): Promise<void> {
  const typesenseEnabled = process.env.TYPESENSE_API_KEY && process.env.TYPESENSE_HOST;
  const portalRevalidateUrl = process.env.PORTAL_REVALIDATE_URL;
  const revalidationSecret = process.env.REVALIDATION_SECRET;

  const record = payload.record;
  const oldRecord = payload.old_record;

  // Sync to Typesense
  if (typesenseEnabled) {
    try {
      // Dynamic import to avoid errors when Typesense is not configured
      const { syncListing, deleteListing } = await import('@listing-platform/search');

      switch (payload.type) {
        case 'INSERT':
        case 'UPDATE':
          if (record) {
            // Only sync published listings
            if (record.status === 'published') {
              await syncListing(record);
            } else {
              // Remove from search if unpublished
              await deleteListing(record.id as string);
            }
          }
          break;
        case 'DELETE':
          if (oldRecord) {
            await deleteListing(oldRecord.id as string);
          }
          break;
      }
    } catch (error) {
      console.error('Typesense sync error:', error);
      // Don't throw - continue with revalidation
    }
  }

  // Trigger portal cache revalidation
  if (portalRevalidateUrl && revalidationSecret) {
    try {
      const slug = (record?.slug || oldRecord?.slug) as string;
      const paths = ['/listings', '/'];
      if (slug) {
        paths.push(`/listings/${slug}`);
      }

      await fetch(portalRevalidateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: revalidationSecret,
          paths,
          type: 'path',
        }),
      });
    } catch (error) {
      console.error('Revalidation error:', error);
    }
  }

  console.log(`Processed ${payload.type} event for listing:`, record?.id || oldRecord?.id);
}

/**
 * Handle taxonomy table events
 */
async function handleTaxonomyEvent(payload: SupabaseWebhookPayload): Promise<void> {
  const portalRevalidateUrl = process.env.PORTAL_REVALIDATE_URL;
  const revalidationSecret = process.env.REVALIDATION_SECRET;

  // Revalidate category pages
  if (portalRevalidateUrl && revalidationSecret) {
    try {
      const record = payload.record || payload.old_record;
      const slug = record?.slug as string;

      const paths = ['/categories'];
      if (slug) {
        paths.push(`/categories/${slug}`);
      }

      await fetch(portalRevalidateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: revalidationSecret,
          paths,
          type: 'path',
        }),
      });
    } catch (error) {
      console.error('Revalidation error:', error);
    }
  }

  console.log(`Processed ${payload.type} event for taxonomy:`, payload.record?.id || payload.old_record?.id);
}
