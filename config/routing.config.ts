/**
 * Routing Configuration
 *
 * CUSTOMIZE: This file determines how URLs are structured for your platform.
 * Choose between industry-based (path tenants) or geographic (subdomain + path) routing.
 *
 * Industry Template:  yourplatform.com/[tenant]/listings/[slug]
 * Geographic Template: us.yourplatform.com/california/san-francisco/[slug]
 */

export type RoutingStrategy = 'industry' | 'geographic';

export interface IndustryRoutingConfig {
  /** Whether tenant slug appears in the URL path */
  tenantInPath: boolean;
  /** Reserved path segments that cannot be tenant slugs */
  reservedPaths: string[];
  /** URL pattern for listings */
  listingPattern: string;
  /** URL pattern for tenant pages */
  tenantPattern: string;
}

export interface GeographicRoutingConfig {
  /** Use country code as subdomain (us.domain.com) */
  useSubdomains: boolean;
  /** Allowed country subdomains */
  countrySubdomains: string[];
  /** Path structure after subdomain */
  pathStructure: '/:state/:city/:slug' | '/:region/:city/:slug' | '/:city/:slug';
  /** Default country if no subdomain */
  defaultCountry: string;
}

export interface RoutingConfig {
  /** Active routing strategy - set when forking */
  strategy: RoutingStrategy;

  /** Industry template settings (path-based tenants) */
  industry: IndustryRoutingConfig;

  /** Geographic template settings (subdomain + geo paths) */
  geographic: GeographicRoutingConfig;

  /** Domain configuration */
  domains: {
    /** Main portal domain */
    portal: string;
    /** Admin panel domain */
    admin: string;
    /** API domain */
    api: string;
    /** CDN domain for images */
    cdn: string;
  };
}

/**
 * Default Routing Configuration
 *
 * CUSTOMIZE: Update 'strategy' to match your platform type
 */
export const routingConfig: RoutingConfig = {
  // CUSTOMIZE: Set to 'industry' or 'geographic' based on your vertical
  strategy: (process.env.ROUTING_STRATEGY as RoutingStrategy) || 'industry',

  // Industry template: yourplatform.com/[tenant]/listings
  industry: {
    tenantInPath: true,
    reservedPaths: [
      'listings',
      'search',
      'categories',
      'about',
      'contact',
      'terms',
      'privacy',
      'api',
      'admin',
      'signin',
      'signup',
      'auth',
    ],
    listingPattern: '/:tenant/listings/:slug',
    tenantPattern: '/:tenant',
  },

  // Geographic template: us.yourplatform.com/california/san-francisco
  geographic: {
    useSubdomains: true,
    countrySubdomains: ['us', 'uk', 'ca', 'au', 'de', 'fr', 'es', 'it', 'mx', 'br'],
    pathStructure: '/:state/:city/:slug',
    defaultCountry: 'us',
  },

  // CUSTOMIZE: Update domains for your deployment
  domains: {
    portal: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourplatform.com',
    admin: process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.yourplatform.com',
    api: process.env.NEXT_PUBLIC_API_URL || 'https://api.yourplatform.com',
    cdn: process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.yourplatform.com',
  },
};

export default routingConfig;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the current routing strategy
 */
export function getRoutingStrategy(): RoutingStrategy {
  return routingConfig.strategy;
}

/**
 * Check if a path segment is a reserved path (not a tenant slug)
 */
export function isReservedPath(segment: string): boolean {
  return routingConfig.industry.reservedPaths.includes(segment.toLowerCase());
}

/**
 * Check if a subdomain is a valid country code
 */
export function isValidCountrySubdomain(subdomain: string): boolean {
  return routingConfig.geographic.countrySubdomains.includes(subdomain.toLowerCase());
}

/**
 * Parse tenant from URL path (industry template)
 */
export function parseTenantFromPath(pathname: string): string | null {
  if (routingConfig.strategy !== 'industry') return null;

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const firstSegment = segments[0];
  if (isReservedPath(firstSegment)) return null;

  return firstSegment;
}

/**
 * Parse geographic context from host and path
 */
export function parseGeographicContext(
  host: string,
  pathname: string
): { country: string | null; state: string | null; city: string | null } {
  if (routingConfig.strategy !== 'geographic') {
    return { country: null, state: null, city: null };
  }

  // Extract country from subdomain
  const subdomain = host.split('.')[0];
  const country = isValidCountrySubdomain(subdomain) ? subdomain : null;

  // Extract state/city from path
  const segments = pathname.split('/').filter(Boolean);
  const [state = null, city = null] = segments;

  return { country, state, city };
}

/**
 * Build a listing URL based on current routing strategy
 */
export function buildListingUrl(params: {
  slug: string;
  tenant?: string;
  country?: string;
  state?: string;
  city?: string;
}): string {
  const { slug, tenant, country, state, city } = params;
  const baseUrl = routingConfig.domains.portal;

  if (routingConfig.strategy === 'industry') {
    if (tenant) {
      return `${baseUrl}/${tenant}/listings/${slug}`;
    }
    return `${baseUrl}/listings/${slug}`;
  }

  // Geographic strategy
  if (country && state && city) {
    const countryDomain = baseUrl.replace('://', `://${country}.`);
    return `${countryDomain}/${state}/${city}/${slug}`;
  }

  return `${baseUrl}/listings/${slug}`;
}

/**
 * Build a category URL based on current routing strategy
 */
export function buildCategoryUrl(params: {
  category: string;
  tenant?: string;
  country?: string;
  state?: string;
}): string {
  const { category, tenant, country, state } = params;
  const baseUrl = routingConfig.domains.portal;

  if (routingConfig.strategy === 'industry') {
    if (tenant) {
      return `${baseUrl}/${tenant}/categories/${category}`;
    }
    return `${baseUrl}/categories/${category}`;
  }

  // Geographic strategy
  if (country && state) {
    const countryDomain = baseUrl.replace('://', `://${country}.`);
    return `${countryDomain}/${state}/categories/${category}`;
  }

  return `${baseUrl}/categories/${category}`;
}
