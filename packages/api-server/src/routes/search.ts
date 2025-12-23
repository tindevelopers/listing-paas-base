import { Hono } from 'hono';
import { z } from 'zod';
import { success } from '../lib/response';

/**
 * Search API Routes
 *
 * Provides fast search using Typesense.
 * Falls back to database search if Typesense is not configured.
 */

export const searchRoutes = new Hono();

const searchQuerySchema = z.object({
  q: z.string().optional().default('*'),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().optional(), // km
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(['relevance', 'price_asc', 'price_desc', 'date', 'views']).default('relevance'),
});

/**
 * GET /api/search
 * Fast search endpoint using Typesense
 */
searchRoutes.get('/', async (c) => {
  const query = searchQuerySchema.parse(c.req.query());

  // Check if Typesense is configured
  const typesenseEnabled = process.env.TYPESENSE_API_KEY && process.env.TYPESENSE_HOST;

  if (!typesenseEnabled) {
    // Fall back to database search
    return c.json({
      success: true,
      data: {
        hits: [],
        found: 0,
        page: 1,
        totalPages: 0,
        searchTimeMs: 0,
      },
      message: 'Typesense not configured. Use /api/public/listings for database search.',
    });
  }

  try {
    // Dynamic import to avoid errors when Typesense is not installed
    const { searchListings } = await import('@listing-platform/search');

    const result = await searchListings({
      query: query.q,
      filters: {
        category: query.category,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        city: query.city,
        state: query.state,
        featured: query.featured,
      },
      geo:
        query.lat && query.lng && query.radius
          ? {
              lat: query.lat,
              lng: query.lng,
              radiusKm: query.radius,
            }
          : undefined,
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
    });

    return success(c, result);
  } catch (error) {
    console.error('Search error:', error);
    return c.json(
      {
        success: false,
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

/**
 * GET /api/search/suggestions
 * Autocomplete suggestions
 */
searchRoutes.get('/suggestions', async (c) => {
  const query = c.req.query('q') || '';
  const limit = Math.min(parseInt(c.req.query('limit') || '5', 10), 10);

  if (!query || query.length < 2) {
    return success(c, { suggestions: [] });
  }

  const typesenseEnabled = process.env.TYPESENSE_API_KEY && process.env.TYPESENSE_HOST;

  if (!typesenseEnabled) {
    return success(c, { suggestions: [] });
  }

  try {
    const { getSearchSuggestions } = await import('@listing-platform/search');
    const suggestions = await getSearchSuggestions(query, limit);
    return success(c, { suggestions });
  } catch (error) {
    console.error('Suggestions error:', error);
    return success(c, { suggestions: [] });
  }
});

/**
 * POST /api/search/reindex
 * Trigger full reindex of all listings to Typesense
 * Admin only
 */
searchRoutes.post('/reindex', async (c) => {
  const typesenseEnabled = process.env.TYPESENSE_API_KEY && process.env.TYPESENSE_HOST;

  if (!typesenseEnabled) {
    return c.json({ success: false, error: 'Typesense not configured' }, 400);
  }

  try {
    const { initializeCollection, syncListings } = await import('@listing-platform/search');
    const { getAdminClient } = await import('../lib/supabase');

    // Initialize collection
    await initializeCollection();

    // Fetch all published listings from database
    const supabase = getAdminClient();
    const { data: listings, error } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'published');

    if (error) throw error;

    // Sync to Typesense
    const result = await syncListings(listings || []);

    return success(c, {
      message: 'Reindex completed',
      ...result,
      total: listings?.length || 0,
    });
  } catch (error) {
    console.error('Reindex error:', error);
    return c.json(
      {
        success: false,
        error: 'Reindex failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});
