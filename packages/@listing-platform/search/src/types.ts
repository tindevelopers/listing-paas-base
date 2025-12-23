/**
 * Typesense Types
 */

export interface TypesenseConfig {
  apiKey: string;
  host: string;
  port?: number;
  protocol?: 'http' | 'https';
  connectionTimeoutSeconds?: number;
}

export interface ListingDocument {
  id: string;
  tenant_id: string;
  slug: string;
  title: string;
  description: string;
  excerpt?: string;
  category?: string;
  price?: number;
  currency?: string;
  status: string;
  featured?: boolean;
  // Location for geo-search
  location?: {
    lat: number;
    lng: number;
  };
  // Address fields for filtering
  city?: string;
  state?: string;
  country?: string;
  // Timestamps
  published_at: number; // Unix timestamp for sorting
  created_at: number;
  updated_at: number;
  view_count?: number;
  // Custom fields (flattened for search)
  custom_fields?: Record<string, unknown>;
}

export interface SearchParams {
  query: string;
  tenantId?: string;
  filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    city?: string;
    state?: string;
    featured?: boolean;
  };
  // Geo-search parameters
  geo?: {
    lat: number;
    lng: number;
    radiusKm: number;
  };
  // Pagination
  page?: number;
  limit?: number;
  // Sorting
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'date' | 'views';
}

export interface SearchHit {
  document: ListingDocument;
  highlight?: Record<string, { snippet: string; matched_tokens: string[] }>;
  text_match?: number;
  geo_distance_meters?: number;
}

export interface SearchResult {
  hits: SearchHit[];
  found: number;
  page: number;
  totalPages: number;
  searchTimeMs: number;
  facets?: Record<string, { value: string; count: number }[]>;
}
