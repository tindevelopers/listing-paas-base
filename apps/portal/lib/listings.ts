/**
 * Listing Data Fetching Helpers
 *
 * CUSTOMIZE: Update these functions to match your listing type and API endpoints
 *
 * This file provides data fetching utilities for the portal.
 * It abstracts the API calls and provides typed responses.
 */

// CUSTOMIZE: Import your listing config for type-specific settings
// import { listingConfig } from '@/config/listing.config';

// CUSTOMIZE: Define your listing type to match your vertical
export interface Listing {
  id: string;
  slug: string;
  title: string;
  description: string;
  price?: number;
  images: string[];
  category?: string;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    lat?: number;
    lng?: number;
  };
  status: 'active' | 'pending' | 'sold' | 'archived';
  createdAt: string;
  updatedAt: string;
  // CUSTOMIZE: Add custom fields for your vertical
  // For real estate: bedrooms, bathrooms, sqft, yearBuilt
  // For services: hourlyRate, availability, serviceArea
  // For directory: businessHours, phone, website
  customFields?: Record<string, unknown>;
}

export interface ListingSearchParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'date' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

export interface ListingSearchResult {
  listings: Listing[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// CUSTOMIZE: Update API_URL to match your deployment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Fetch a single listing by slug
 */
export async function getListingBySlug(slug: string): Promise<Listing | null> {
  try {
    const response = await fetch(`${API_URL}/api/listings/slug/${slug}`, {
      next: { revalidate: 60 }, // ISR: Revalidate every 60 seconds
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch listing: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching listing:', error);
    return null;
  }
}

/**
 * Fetch a single listing by ID
 */
export async function getListingById(id: string): Promise<Listing | null> {
  try {
    const response = await fetch(`${API_URL}/api/listings/${id}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch listing: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching listing:', error);
    return null;
  }
}

/**
 * Search listings with filters
 */
export async function searchListings(
  params: ListingSearchParams = {}
): Promise<ListingSearchResult> {
  const searchParams = new URLSearchParams();

  if (params.query) searchParams.set('q', params.query);
  if (params.category) searchParams.set('category', params.category);
  if (params.minPrice) searchParams.set('minPrice', params.minPrice.toString());
  if (params.maxPrice) searchParams.set('maxPrice', params.maxPrice.toString());
  if (params.location) searchParams.set('location', params.location);
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  try {
    const response = await fetch(
      `${API_URL}/api/listings?${searchParams.toString()}`,
      {
        next: { revalidate: 30 }, // Shorter cache for search results
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to search listings: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error searching listings:', error);
    return {
      listings: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
    };
  }
}

/**
 * Get listings by category
 */
export async function getListingsByCategory(
  category: string,
  page = 1,
  limit = 12
): Promise<ListingSearchResult> {
  return searchListings({ category, page, limit });
}

/**
 * Get featured/promoted listings for homepage
 */
export async function getFeaturedListings(limit = 6): Promise<Listing[]> {
  try {
    const response = await fetch(
      `${API_URL}/api/listings?featured=true&limit=${limit}`,
      {
        next: { revalidate: 300 }, // Cache featured for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch featured listings: ${response.statusText}`);
    }

    const result = await response.json();
    return result.listings || [];
  } catch (error) {
    console.error('Error fetching featured listings:', error);
    return [];
  }
}

/**
 * Get all categories for navigation
 * CUSTOMIZE: Update to fetch from your categories endpoint
 */
export async function getCategories(): Promise<
  Array<{ slug: string; name: string; count: number }>
> {
  try {
    const response = await fetch(`${API_URL}/api/categories`, {
      next: { revalidate: 600 }, // Cache categories for 10 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    // CUSTOMIZE: Return default categories for your vertical
    return [];
  }
}

/**
 * Format price for display
 * CUSTOMIZE: Update currency and formatting for your locale
 */
export function formatPrice(price: number | undefined): string {
  if (price === undefined || price === null) return 'Contact for price';

  // CUSTOMIZE: Update currency code and locale
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Generate static params for SSG
 * Used by generateStaticParams in page components
 */
export async function getAllListingSlugs(): Promise<string[]> {
  try {
    const response = await fetch(`${API_URL}/api/listings?limit=1000&fields=slug`);
    if (!response.ok) return [];

    const result = await response.json();
    return result.listings?.map((l: { slug: string }) => l.slug) || [];
  } catch {
    return [];
  }
}
