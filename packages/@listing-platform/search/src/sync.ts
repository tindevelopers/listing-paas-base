import { typesenseClient } from './client';
import type { ListingDocument } from './types';

/**
 * Collection name for listings
 */
const COLLECTION_NAME = 'listings';

/**
 * Typesense collection schema for listings
 */
const LISTINGS_SCHEMA = {
  name: COLLECTION_NAME,
  fields: [
    { name: 'id', type: 'string' as const },
    { name: 'tenant_id', type: 'string' as const, facet: true },
    { name: 'slug', type: 'string' as const },
    { name: 'title', type: 'string' as const },
    { name: 'description', type: 'string' as const },
    { name: 'excerpt', type: 'string' as const, optional: true },
    { name: 'category', type: 'string' as const, facet: true, optional: true },
    { name: 'price', type: 'float' as const, optional: true },
    { name: 'currency', type: 'string' as const, optional: true },
    { name: 'status', type: 'string' as const, facet: true },
    { name: 'featured', type: 'bool' as const, facet: true, optional: true },
    { name: 'location', type: 'geopoint' as const, optional: true },
    { name: 'city', type: 'string' as const, facet: true, optional: true },
    { name: 'state', type: 'string' as const, facet: true, optional: true },
    { name: 'country', type: 'string' as const, facet: true, optional: true },
    { name: 'published_at', type: 'int64' as const },
    { name: 'created_at', type: 'int64' as const },
    { name: 'updated_at', type: 'int64' as const },
    { name: 'view_count', type: 'int32' as const, optional: true },
  ],
  default_sorting_field: 'published_at',
};

/**
 * Initialize the listings collection
 * Creates the collection if it doesn't exist
 */
export async function initializeCollection(): Promise<void> {
  const client = typesenseClient();

  try {
    // Check if collection exists
    await client.collections(COLLECTION_NAME).retrieve();
    console.log(`Collection '${COLLECTION_NAME}' already exists`);
  } catch (error) {
    // Collection doesn't exist, create it
    console.log(`Creating collection '${COLLECTION_NAME}'...`);
    await client.collections().create(LISTINGS_SCHEMA);
    console.log(`Collection '${COLLECTION_NAME}' created successfully`);
  }
}

/**
 * Transform a database listing to a Typesense document
 */
function transformToDocument(listing: Record<string, unknown>): ListingDocument {
  const address = listing.address as Record<string, string> | null;
  const location = listing.location as { lat: number; lng: number } | null;

  return {
    id: listing.id as string,
    tenant_id: listing.tenant_id as string,
    slug: listing.slug as string,
    title: listing.title as string,
    description: (listing.description as string) || '',
    excerpt: (listing.excerpt as string) || undefined,
    category: (listing.category as string) || undefined,
    price: (listing.price as number) || undefined,
    currency: (listing.currency as string) || 'USD',
    status: listing.status as string,
    featured: (listing.featured as boolean) || false,
    location: location ? [location.lat, location.lng] as unknown as { lat: number; lng: number } : undefined,
    city: address?.city || undefined,
    state: address?.region || address?.state || undefined,
    country: address?.country || undefined,
    published_at: listing.published_at
      ? new Date(listing.published_at as string).getTime()
      : Date.now(),
    created_at: listing.created_at
      ? new Date(listing.created_at as string).getTime()
      : Date.now(),
    updated_at: listing.updated_at
      ? new Date(listing.updated_at as string).getTime()
      : Date.now(),
    view_count: (listing.view_count as number) || 0,
  };
}

/**
 * Sync a single listing to Typesense
 * Creates or updates the document
 */
export async function syncListing(listing: Record<string, unknown>): Promise<void> {
  const client = typesenseClient();
  const document = transformToDocument(listing);

  try {
    await client
      .collections(COLLECTION_NAME)
      .documents()
      .upsert(document);
    
    console.log(`Synced listing ${document.id} to Typesense`);
  } catch (error) {
    console.error(`Failed to sync listing ${document.id}:`, error);
    throw error;
  }
}

/**
 * Sync multiple listings to Typesense
 * Uses bulk import for efficiency
 */
export async function syncListings(listings: Record<string, unknown>[]): Promise<{
  success: number;
  failed: number;
}> {
  const client = typesenseClient();
  const documents = listings.map(transformToDocument);

  try {
    const results = await client
      .collections(COLLECTION_NAME)
      .documents()
      .import(documents, { action: 'upsert' });

    let success = 0;
    let failed = 0;

    for (const result of results) {
      if (result.success) {
        success++;
      } else {
        failed++;
        console.error('Import error:', result.error);
      }
    }

    console.log(`Synced ${success} listings to Typesense (${failed} failed)`);
    return { success, failed };
  } catch (error) {
    console.error('Bulk sync failed:', error);
    throw error;
  }
}

/**
 * Delete a listing from Typesense
 */
export async function deleteListing(listingId: string): Promise<void> {
  const client = typesenseClient();

  try {
    await client.collections(COLLECTION_NAME).documents(listingId).delete();
    console.log(`Deleted listing ${listingId} from Typesense`);
  } catch (error) {
    // Ignore 404 errors (document already deleted)
    if ((error as { httpStatus?: number }).httpStatus !== 404) {
      console.error(`Failed to delete listing ${listingId}:`, error);
      throw error;
    }
  }
}

/**
 * Delete all documents from the collection
 * Useful for re-indexing
 */
export async function clearCollection(): Promise<void> {
  const client = typesenseClient();

  try {
    await client.collections(COLLECTION_NAME).documents().delete({
      filter_by: 'id:!=none', // Match all documents
    });
    console.log('Cleared all documents from Typesense');
  } catch (error) {
    console.error('Failed to clear collection:', error);
    throw error;
  }
}
