import type { MetadataRoute } from 'next';

/**
 * Dynamic Sitemap Generation
 *
 * Generates a sitemap for search engines including all published listings.
 * This helps with SEO by ensuring all pages are discoverable.
 *
 * CUSTOMIZE: Update the base URL and add additional pages specific to your platform
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourplatform.com';

interface SitemapListing {
  slug: string;
  updated_at: string;
  published_at: string;
}

interface SitemapCategory {
  slug: string;
  name: string;
  count: number;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/listings`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // CUSTOMIZE: Add more static pages
    // {
    //   url: `${SITE_URL}/about`,
    //   lastModified: new Date(),
    //   changeFrequency: 'monthly',
    //   priority: 0.5,
    // },
  ];

  // Fetch all listings for sitemap
  let listingPages: MetadataRoute.Sitemap = [];
  try {
    const response = await fetch(`${API_URL}/api/public/sitemap?limit=50000`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (response.ok) {
      const result = await response.json();
      const listings: SitemapListing[] = result.data?.listings || [];

      listingPages = listings.map((listing) => ({
        url: `${SITE_URL}/listings/${listing.slug}`,
        lastModified: new Date(listing.updated_at || listing.published_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error('Error fetching listings for sitemap:', error);
  }

  // Fetch all categories for sitemap
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const response = await fetch(`${API_URL}/api/public/categories`, {
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      const result = await response.json();
      const categories: SitemapCategory[] = result.data || [];

      categoryPages = categories.map((category) => ({
        url: `${SITE_URL}/categories/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
  }

  return [...staticPages, ...categoryPages, ...listingPages];
}
