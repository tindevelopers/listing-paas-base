import { Hono } from 'hono';
import { z } from 'zod';
import { getAdminClient } from '../lib/supabase';
import { success, errors, paginated } from '../lib/response';
import { escapeSearchQuery } from '@listing-platform/shared';

/**
 * Public API Routes
 *
 * These endpoints do NOT require authentication.
 * Used by the portal for SSG/ISR page generation.
 *
 * All endpoints filter by status='published' automatically.
 */

export const publicRoutes = new Hono();

// ============================================================================
// Validation Schemas
// ============================================================================

const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  location: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  sortBy: z
    .enum(['created_at', 'updated_at', 'published_at', 'title', 'price', 'view_count'])
    .default('published_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  // For SSG: limit fields returned
  fields: z.string().optional(),
});

// ============================================================================
// Public Listings Endpoints
// ============================================================================

/**
 * GET /api/public/listings
 * Get published listings (for portal browse/search)
 */
publicRoutes.get('/listings', async (c) => {
  const query = listQuerySchema.parse(c.req.query());
  const supabase = getAdminClient();

  let selectFields = '*';
  if (query.fields) {
    // Allow limiting fields for SSG (e.g., fields=id,slug,title)
    selectFields = query.fields;
  }

  let dbQuery = supabase
    .from('listings')
    .select(selectFields, { count: 'exact' })
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order(query.sortBy, { ascending: query.sortOrder === 'asc' })
    .range((query.page - 1) * query.limit, query.page * query.limit - 1);

  if (query.search) {
    const escapedSearch = escapeSearchQuery(query.search);
    dbQuery = dbQuery.or(
      `title.ilike.%${escapedSearch}%,description.ilike.%${escapedSearch}%`
    );
  }

  if (query.category) {
    dbQuery = dbQuery.eq('category', query.category);
  }

  if (query.minPrice !== undefined) {
    dbQuery = dbQuery.gte('price', query.minPrice);
  }

  if (query.maxPrice !== undefined) {
    dbQuery = dbQuery.lte('price', query.maxPrice);
  }

  if (query.featured) {
    dbQuery = dbQuery.eq('featured', true);
  }

  // Location search (simple city/state match)
  if (query.location) {
    const escapedLocation = escapeSearchQuery(query.location);
    dbQuery = dbQuery.or(
      `address->city.ilike.%${escapedLocation}%,address->region.ilike.%${escapedLocation}%`
    );
  }

  const { data, error, count } = await dbQuery;

  if (error) throw error;

  return paginated(c, data || [], query.page, query.limit, count || 0);
});

/**
 * GET /api/public/listings/slug/:slug
 * Get a single published listing by slug
 */
publicRoutes.get('/listings/slug/:slug', async (c) => {
  const { slug } = c.req.param();
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return errors.notFound(c, 'Listing');
    }
    throw error;
  }

  // Increment view count (fire and forget)
  supabase.rpc('increment_view_count', { listing_id: data.id }).catch(() => {});

  return success(c, data);
});

/**
 * GET /api/public/listings/:id
 * Get a single published listing by ID
 */
publicRoutes.get('/listings/:id', async (c) => {
  const { id } = c.req.param();
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return errors.notFound(c, 'Listing');
    }
    throw error;
  }

  return success(c, data);
});

/**
 * GET /api/public/featured
 * Get featured listings for homepage
 */
publicRoutes.get('/featured', async (c) => {
  const limit = Number(c.req.query('limit')) || 6;
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'published')
    .eq('featured', true)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return success(c, { listings: data || [] });
});

/**
 * GET /api/public/categories
 * Get all categories with listing counts
 */
publicRoutes.get('/categories', async (c) => {
  const supabase = getAdminClient();

  // Get categories from taxonomy_terms table if it exists,
  // otherwise aggregate from listings
  const { data: taxonomyData } = await supabase
    .from('taxonomy_terms')
    .select('id, name, slug, parent_id')
    .eq('taxonomy_type', 'category')
    .order('name');

  if (taxonomyData && taxonomyData.length > 0) {
    // Get counts for each category
    const categoriesWithCounts = await Promise.all(
      taxonomyData.map(async (cat) => {
        const { count } = await supabase
          .from('listing_taxonomies')
          .select('*', { count: 'exact', head: true })
          .eq('taxonomy_term_id', cat.id);

        return {
          ...cat,
          count: count || 0,
        };
      })
    );

    return success(c, categoriesWithCounts);
  }

  // Fallback: aggregate categories from listings
  const { data: listings } = await supabase
    .from('listings')
    .select('category')
    .eq('status', 'published')
    .not('category', 'is', null);

  const categoryCounts: Record<string, number> = {};
  listings?.forEach((l) => {
    if (l.category) {
      categoryCounts[l.category] = (categoryCounts[l.category] || 0) + 1;
    }
  });

  const categories = Object.entries(categoryCounts).map(([name, count]) => ({
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    count,
  }));

  return success(c, categories);
});

/**
 * GET /api/public/sitemap
 * Get data for sitemap generation (SSG)
 */
publicRoutes.get('/sitemap', async (c) => {
  const supabase = getAdminClient();
  const limit = Number(c.req.query('limit')) || 10000;

  const { data, error } = await supabase
    .from('listings')
    .select('slug, updated_at, published_at')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return success(c, {
    listings: data || [],
    generatedAt: new Date().toISOString(),
  });
});

/**
 * GET /api/public/popular
 * Get popular listings for SSG pre-generation
 */
publicRoutes.get('/popular', async (c) => {
  const limit = Number(c.req.query('limit')) || 500;
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('listings')
    .select('slug')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('view_count', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return success(c, {
    slugs: data?.map((l) => l.slug) || [],
  });
});

/**
 * GET /api/public/stats
 * Get platform statistics for homepage
 */
publicRoutes.get('/stats', async (c) => {
  const supabase = getAdminClient();

  const [listingsCount, categoriesCount] = await Promise.all([
    supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabase
      .from('taxonomy_terms')
      .select('*', { count: 'exact', head: true })
      .eq('taxonomy_type', 'category'),
  ]);

  return success(c, {
    totalListings: listingsCount.count || 0,
    totalCategories: categoriesCount.count || 0,
  });
});
