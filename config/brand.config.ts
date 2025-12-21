/**
 * Brand Configuration
 * 
 * CUSTOMIZE: This file contains all branding and company information.
 * Update these values to match your platform's identity.
 * 
 * This configuration is used throughout the application for:
 * - Platform naming
 * - Company information
 * - Theme colors
 * - Social media links
 * - Contact information
 * - Legal pages
 */

export interface BrandConfig {
  // CUSTOMIZE: Platform identity
  platform: {
    name: string;
    tagline: string;
    description: string;
    domain: string;
    supportEmail: string;
    logo: {
      light: string;
      dark: string;
      icon: string;
    };
  };
  
  // CUSTOMIZE: Company information
  company: {
    name: string;
    legalName: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
    };
    phone?: string;
    email: string;
  };
  
  // CUSTOMIZE: Theme configuration
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    successColor: string;
    warningColor: string;
    errorColor: string;
    // Tailwind color class names
    primaryColorClass: string;
    secondaryColorClass: string;
  };
  
  // CUSTOMIZE: Social media links
  social: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
    github?: string;
    tiktok?: string;
  };
  
  // CUSTOMIZE: Footer and legal information
  footer: {
    copyrightText: string;
    showPoweredBy: boolean;
    poweredByText?: string;
    poweredByLink?: string;
  };
  
  // CUSTOMIZE: SEO defaults
  seo: {
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    defaultImage: string;
    twitterHandle?: string;
    locale: string;
    siteName: string;
  };
}

/**
 * Default Brand Configuration
 * 
 * CUSTOMIZE: Update all values below for your platform
 */
export const brandConfig: BrandConfig = {
  // CUSTOMIZE: Your platform's identity
  platform: {
    name: 'Listing Platform',                    // CUSTOMIZE: Your platform name
    tagline: 'Find What You\'re Looking For',    // CUSTOMIZE: Your tagline
    description: 'The best place to discover and list items in your area.', // CUSTOMIZE
    domain: 'example.com',                       // CUSTOMIZE: Your domain
    supportEmail: 'support@example.com',         // CUSTOMIZE: Support email
    logo: {
      light: '/images/logo/logo.svg',            // CUSTOMIZE: Path to light mode logo
      dark: '/images/logo/logo-dark.svg',        // CUSTOMIZE: Path to dark mode logo
      icon: '/images/logo/logo-icon.svg',        // CUSTOMIZE: Path to icon/favicon
    },
  },
  
  // CUSTOMIZE: Your company information
  company: {
    name: 'Your Company',                        // CUSTOMIZE: Company name
    legalName: 'Your Company, Inc.',             // CUSTOMIZE: Legal entity name
    address: {
      street: '123 Main Street',                 // CUSTOMIZE: Office address
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'USA',
    },
    phone: '+1 (555) 123-4567',                  // CUSTOMIZE: Company phone
    email: 'hello@example.com',                  // CUSTOMIZE: General contact email
  },
  
  // CUSTOMIZE: Your brand colors
  theme: {
    primaryColor: '#3B82F6',                     // CUSTOMIZE: Primary brand color (hex)
    secondaryColor: '#1E40AF',                   // CUSTOMIZE: Secondary color
    accentColor: '#F59E0B',                      // CUSTOMIZE: Accent color
    successColor: '#10B981',                     // Success green
    warningColor: '#F59E0B',                     // Warning yellow
    errorColor: '#EF4444',                       // Error red
    // Tailwind class names for easy use in components
    primaryColorClass: 'blue-600',               // CUSTOMIZE: e.g., 'indigo-600', 'emerald-600'
    secondaryColorClass: 'blue-800',             // CUSTOMIZE
  },
  
  // CUSTOMIZE: Your social media profiles
  social: {
    twitter: 'https://twitter.com/yourplatform', // CUSTOMIZE or remove
    facebook: undefined,                          // CUSTOMIZE: Add Facebook URL
    instagram: undefined,                         // CUSTOMIZE: Add Instagram URL
    linkedin: 'https://linkedin.com/company/yourplatform', // CUSTOMIZE or remove
    youtube: undefined,                           // CUSTOMIZE: Add YouTube URL
    github: undefined,                            // CUSTOMIZE: Add GitHub URL
    tiktok: undefined,                            // CUSTOMIZE: Add TikTok URL
  },
  
  // CUSTOMIZE: Footer configuration
  footer: {
    copyrightText: '© {year} Your Company. All rights reserved.', // CUSTOMIZE: {year} is replaced automatically
    showPoweredBy: false,                        // Set to true to show "Powered by" credit
    poweredByText: 'Powered by Listing Platform',
    poweredByLink: 'https://github.com/yourorg/listing-platform',
  },
  
  // CUSTOMIZE: SEO configuration
  seo: {
    defaultTitle: 'Listing Platform',            // CUSTOMIZE: Default page title
    titleTemplate: '%s | Listing Platform',      // CUSTOMIZE: Title template (%s = page title)
    defaultDescription: 'Discover the best listings. Find exactly what you\'re looking for on our platform.', // CUSTOMIZE
    defaultImage: '/images/og-image.jpg',        // CUSTOMIZE: Default OpenGraph image
    twitterHandle: '@yourplatform',              // CUSTOMIZE: Twitter handle for cards
    locale: 'en_US',                             // CUSTOMIZE: Default locale
    siteName: 'Listing Platform',                // CUSTOMIZE: Site name for OpenGraph
  },
};

export default brandConfig;

// Helper functions
export function getPlatformName(): string {
  return brandConfig.platform.name;
}

export function getCompanyName(): string {
  return brandConfig.company.name;
}

export function getCopyrightText(): string {
  return brandConfig.footer.copyrightText.replace(
    '{year}',
    new Date().getFullYear().toString()
  );
}

export function getSocialLinks(): Array<{ platform: string; url: string }> {
  return Object.entries(brandConfig.social)
    .filter(([, url]) => url)
    .map(([platform, url]) => ({ platform, url: url! }));
}

export function getPageTitle(pageTitle?: string): string {
  if (!pageTitle) return brandConfig.seo.defaultTitle;
  return brandConfig.seo.titleTemplate.replace('%s', pageTitle);
}

export function getThemeColor(colorName: keyof typeof brandConfig.theme): string {
  return brandConfig.theme[colorName];
}

export function getLogo(mode: 'light' | 'dark' | 'icon' = 'light'): string {
  return brandConfig.platform.logo[mode];
}
