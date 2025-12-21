/**
 * Listing Configuration
 * 
 * CUSTOMIZE: This is the primary configuration file for your listing vertical.
 * Update these values to match your specific listing type (real estate, services, directory, etc.)
 * 
 * @example Real Estate:
 *   name: 'Property', namePlural: 'Properties', slug: 'properties'
 * 
 * @example Services:
 *   name: 'Service', namePlural: 'Services', slug: 'services'
 * 
 * @example Directory:
 *   name: 'Business', namePlural: 'Businesses', slug: 'businesses'
 */

export interface ListingFieldConfig {
  enabled: boolean;
  required?: boolean;
  label?: string;
  placeholder?: string;
  helpText?: string;
}

export interface CustomFieldConfig {
  name: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'date' | 'range';
  label: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  unit?: string;
  filterable?: boolean;
  searchable?: boolean;
  sortable?: boolean;
}

export interface ListingConfig {
  // CUSTOMIZE: Basic listing type naming
  name: string;
  namePlural: string;
  slug: string;
  
  // CUSTOMIZE: Core field configuration
  coreFields: {
    title: ListingFieldConfig & { maxLength?: number };
    description: ListingFieldConfig & { maxLength?: number };
    price: ListingFieldConfig & { 
      currency?: string;
      format?: 'currency' | 'number';
      showRange?: boolean;
    };
    location: ListingFieldConfig & {
      requireAddress?: boolean;
      requireCity?: boolean;
      requireState?: boolean;
      requireZip?: boolean;
      requireCountry?: boolean;
      enableMap?: boolean;
      mapProvider?: 'mapbox' | 'google' | 'leaflet';
    };
    images: ListingFieldConfig & {
      maxCount?: number;
      maxSizeMB?: number;
      requiredCount?: number;
      acceptedFormats?: string[];
    };
    category: ListingFieldConfig;
  };
  
  // CUSTOMIZE: Custom fields specific to your vertical
  customFields: CustomFieldConfig[];
  
  // CUSTOMIZE: Feature toggles
  features: {
    reviews: boolean;
    ratings: boolean;
    booking: boolean;
    messaging: boolean;
    favorites: boolean;
    sharing: boolean;
    comparing: boolean;
    reporting: boolean;
    claiming: boolean;
    verification: boolean;
  };
  
  // CUSTOMIZE: Search & filter configuration
  search: {
    defaultSortBy: 'date' | 'price' | 'relevance' | 'rating' | 'views';
    defaultSortOrder: 'asc' | 'desc';
    resultsPerPage: number;
    enableMapView: boolean;
    enableGridView: boolean;
    enableListView: boolean;
    defaultView: 'grid' | 'list' | 'map';
    quickFilters: string[]; // Field names to show as quick filters
  };
  
  // CUSTOMIZE: Display configuration
  display: {
    showPrice: boolean;
    showLocation: boolean;
    showRating: boolean;
    showViewCount: boolean;
    showListedDate: boolean;
    cardLayout: 'vertical' | 'horizontal';
    galleryLayout: 'grid' | 'carousel' | 'masonry';
  };
  
  // CUSTOMIZE: Status options
  statuses: Array<{
    value: string;
    label: string;
    color: string;
    isDefault?: boolean;
    isActive?: boolean;
  }>;
}

/**
 * Default Listing Configuration
 * 
 * CUSTOMIZE: Update these values for your specific vertical
 */
export const listingConfig: ListingConfig = {
  // CUSTOMIZE: Change these to match your listing type
  name: 'Listing',
  namePlural: 'Listings',
  slug: 'listings',
  
  // CUSTOMIZE: Configure which core fields to show and their behavior
  coreFields: {
    title: {
      enabled: true,
      required: true,
      maxLength: 100,
      label: 'Title',
      placeholder: 'Enter a descriptive title',
    },
    description: {
      enabled: true,
      required: true,
      maxLength: 5000,
      label: 'Description',
      placeholder: 'Describe your listing in detail...',
    },
    price: {
      enabled: true,
      required: false,
      currency: 'USD',
      format: 'currency',
      showRange: false,
      label: 'Price',
      placeholder: 'Enter price',
    },
    location: {
      enabled: true,
      required: false,
      requireAddress: false,
      requireCity: true,
      requireState: true,
      requireZip: false,
      requireCountry: false,
      enableMap: true,
      mapProvider: 'mapbox',
      label: 'Location',
    },
    images: {
      enabled: true,
      required: false,
      maxCount: 20,
      maxSizeMB: 10,
      requiredCount: 1,
      acceptedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      label: 'Images',
    },
    category: {
      enabled: true,
      required: true,
      label: 'Category',
    },
  },
  
  // CUSTOMIZE: Add custom fields for your vertical
  // Examples included below - remove or modify as needed
  customFields: [
    // Example for Real Estate:
    // {
    //   name: 'bedrooms',
    //   type: 'number',
    //   label: 'Bedrooms',
    //   required: false,
    //   min: 0,
    //   max: 20,
    //   filterable: true,
    //   sortable: true,
    // },
    // {
    //   name: 'bathrooms',
    //   type: 'number',
    //   label: 'Bathrooms',
    //   required: false,
    //   min: 0,
    //   max: 20,
    //   filterable: true,
    // },
    // {
    //   name: 'sqft',
    //   type: 'number',
    //   label: 'Square Feet',
    //   required: false,
    //   unit: 'sqft',
    //   filterable: true,
    //   sortable: true,
    // },
    // {
    //   name: 'propertyType',
    //   type: 'select',
    //   label: 'Property Type',
    //   required: true,
    //   filterable: true,
    //   options: [
    //     { value: 'house', label: 'House' },
    //     { value: 'condo', label: 'Condo' },
    //     { value: 'townhouse', label: 'Townhouse' },
    //     { value: 'land', label: 'Land' },
    //   ],
    // },
    
    // Example for Services:
    // {
    //   name: 'hourlyRate',
    //   type: 'number',
    //   label: 'Hourly Rate',
    //   unit: '/hr',
    //   filterable: true,
    //   sortable: true,
    // },
    // {
    //   name: 'availability',
    //   type: 'multiselect',
    //   label: 'Availability',
    //   options: [
    //     { value: 'weekdays', label: 'Weekdays' },
    //     { value: 'weekends', label: 'Weekends' },
    //     { value: 'evenings', label: 'Evenings' },
    //   ],
    //   filterable: true,
    // },
    
    // Example for Directory:
    // {
    //   name: 'businessHours',
    //   type: 'text',
    //   label: 'Business Hours',
    // },
    // {
    //   name: 'phone',
    //   type: 'text',
    //   label: 'Phone Number',
    // },
    // {
    //   name: 'website',
    //   type: 'text',
    //   label: 'Website',
    // },
  ],
  
  // CUSTOMIZE: Enable/disable features
  features: {
    reviews: true,
    ratings: true,
    booking: false,
    messaging: true,
    favorites: true,
    sharing: true,
    comparing: true,
    reporting: true,
    claiming: false,
    verification: false,
  },
  
  // CUSTOMIZE: Search and display settings
  search: {
    defaultSortBy: 'date',
    defaultSortOrder: 'desc',
    resultsPerPage: 12,
    enableMapView: true,
    enableGridView: true,
    enableListView: true,
    defaultView: 'grid',
    quickFilters: ['category', 'price'], // CUSTOMIZE: Add your filterable custom fields
  },
  
  display: {
    showPrice: true,
    showLocation: true,
    showRating: true,
    showViewCount: false,
    showListedDate: true,
    cardLayout: 'vertical',
    galleryLayout: 'carousel',
  },
  
  // CUSTOMIZE: Listing status options
  statuses: [
    { value: 'draft', label: 'Draft', color: 'gray', isDefault: true, isActive: false },
    { value: 'pending', label: 'Pending Review', color: 'yellow', isActive: false },
    { value: 'active', label: 'Active', color: 'green', isActive: true },
    { value: 'sold', label: 'Sold', color: 'blue', isActive: false },
    { value: 'archived', label: 'Archived', color: 'gray', isActive: false },
  ],
};

export default listingConfig;

// Helper functions
export function getListingName(plural = false): string {
  return plural ? listingConfig.namePlural : listingConfig.name;
}

export function getListingSlug(): string {
  return listingConfig.slug;
}

export function isFieldEnabled(fieldName: keyof typeof listingConfig.coreFields): boolean {
  return listingConfig.coreFields[fieldName]?.enabled ?? false;
}

export function isFieldRequired(fieldName: keyof typeof listingConfig.coreFields): boolean {
  return listingConfig.coreFields[fieldName]?.required ?? false;
}

export function getCustomFields(): CustomFieldConfig[] {
  return listingConfig.customFields;
}

export function getFilterableFields(): CustomFieldConfig[] {
  return listingConfig.customFields.filter((f) => f.filterable);
}

export function getSortableFields(): CustomFieldConfig[] {
  return listingConfig.customFields.filter((f) => f.sortable);
}

export function getActiveStatuses(): typeof listingConfig.statuses {
  return listingConfig.statuses.filter((s) => s.isActive);
}
