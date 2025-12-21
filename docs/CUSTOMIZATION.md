# Customization Guide

This guide provides detailed instructions for customizing the Listing Platform for your specific vertical.

## Overview

The platform is designed to be customized at multiple levels:

1. **Configuration** - No code changes, just edit config files
2. **Components** - Modify or extend UI components
3. **Features** - Enable/disable platform features
4. **Database** - Add custom fields and tables
5. **Styling** - Theme and brand customization

---

## Level 1: Configuration-Based Customization

### Listing Configuration

The primary customization point is `config/listing.config.ts`. This file defines:

#### Listing Naming

```typescript
export const listingConfig = {
  // CUSTOMIZE: These appear throughout the UI
  name: 'Property',           // "View Property", "Edit Property"
  namePlural: 'Properties',   // "Browse Properties", "All Properties"
  slug: 'properties',         // URL: /properties, /properties/my-listing
};
```

#### Core Fields

Enable or disable standard fields:

```typescript
coreFields: {
  title: {
    enabled: true,
    required: true,
    maxLength: 100,
    label: 'Property Title',
    placeholder: 'Beautiful 3BR home in...',
  },
  price: {
    enabled: true,
    required: true,
    currency: 'USD',
    format: 'currency',
    showRange: true,  // Show "min - max" for ranges
  },
  location: {
    enabled: true,
    enableMap: true,
    mapProvider: 'mapbox',
    requireCity: true,
    requireState: true,
  },
  images: {
    enabled: true,
    maxCount: 30,
    requiredCount: 3,  // Minimum images required
  },
}
```

#### Custom Fields

Add fields specific to your vertical:

```typescript
customFields: [
  // Number fields
  {
    name: 'bedrooms',
    type: 'number',
    label: 'Bedrooms',
    min: 0,
    max: 20,
    filterable: true,    // Show in search filters
    sortable: true,      // Allow sorting by this field
  },

  // Select fields
  {
    name: 'propertyType',
    type: 'select',
    label: 'Property Type',
    required: true,
    filterable: true,
    options: [
      { value: 'house', label: 'House' },
      { value: 'condo', label: 'Condo' },
      { value: 'townhouse', label: 'Townhouse' },
      { value: 'land', label: 'Land' },
    ],
  },

  // Multi-select fields
  {
    name: 'amenities',
    type: 'multiselect',
    label: 'Amenities',
    filterable: true,
    options: [
      { value: 'pool', label: 'Pool' },
      { value: 'gym', label: 'Gym' },
      { value: 'parking', label: 'Parking' },
      { value: 'pets', label: 'Pet Friendly' },
    ],
  },

  // Boolean fields
  {
    name: 'furnished',
    type: 'boolean',
    label: 'Furnished',
    filterable: true,
  },

  // Range fields
  {
    name: 'sqft',
    type: 'range',
    label: 'Square Footage',
    min: 0,
    max: 50000,
    unit: 'sqft',
    filterable: true,
    sortable: true,
  },
]
```

#### Field Types Reference

| Type | Use Case | Options |
|------|----------|---------|
| `text` | Short text, names | `maxLength` |
| `number` | Numeric values | `min`, `max`, `unit` |
| `select` | Single choice | `options` array |
| `multiselect` | Multiple choices | `options` array |
| `boolean` | Yes/No | - |
| `date` | Dates | `minDate`, `maxDate` |
| `range` | Min/Max ranges | `min`, `max`, `unit` |

#### Feature Toggles

Enable or disable features per-listing:

```typescript
features: {
  reviews: true,       // User reviews and ratings
  ratings: true,       // Star ratings
  booking: false,      // Booking/scheduling (for rentals, services)
  messaging: true,     // In-platform messaging
  favorites: true,     // Save to favorites
  sharing: true,       // Social sharing
  comparing: true,     // Compare listings side-by-side
  reporting: true,     // Report inappropriate content
  claiming: false,     // Business owners can claim listings
  verification: false, // Require verified listings
}
```

### Brand Configuration

Edit `config/brand.config.ts` for branding:

```typescript
export const brandConfig = {
  platform: {
    name: 'PropertyFinder',
    tagline: 'Find Your Perfect Home',
    domain: 'propertyfinder.com',
  },

  theme: {
    primaryColor: '#059669',        // Emerald green
    primaryColorClass: 'emerald-600',
  },

  seo: {
    defaultTitle: 'PropertyFinder - Real Estate Listings',
    titleTemplate: '%s | PropertyFinder',
    defaultDescription: 'Browse properties for sale and rent.',
  },
};
```

### Feature Configuration

Edit `config/features.config.ts` for platform-wide features:

```typescript
export const featuresConfig = {
  sdks: {
    reviews: { enabled: true },
    maps: {
      enabled: true,
      provider: 'mapbox',
    },
    booking: { enabled: false },
    crm: { enabled: true },
  },

  platform: {
    allowUserListings: true,
    requireVerification: false,
    enableMessaging: true,
  },

  media: {
    maxImagesPerListing: 30,
    allowVideos: true,
    allowVirtualTours: true,
  },
};
```

---

## Level 2: Component Customization

### Portal Components

Components in `apps/portal/components/` are designed to be customized. Look for `// CUSTOMIZE:` comments.

#### Customizing ListingCard

```tsx
// apps/portal/components/listings/ListingCard.tsx

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <div className="...">
      {/* Price */}
      <div className="text-lg font-bold text-emerald-600">
        {formatPrice(listing.price)}
      </div>

      {/* CUSTOMIZE: Add your custom fields */}
      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
        <span>{listing.customFields?.bedrooms} bd</span>
        <span>•</span>
        <span>{listing.customFields?.bathrooms} ba</span>
        <span>•</span>
        <span>{listing.customFields?.sqft?.toLocaleString()} sqft</span>
      </div>

      {/* CUSTOMIZE: Property type badge */}
      {listing.customFields?.propertyType && (
        <span className="mt-2 inline-block px-2 py-1 bg-gray-100 rounded text-xs">
          {listing.customFields.propertyType}
        </span>
      )}
    </div>
  );
}
```

#### Customizing ListingDetail

```tsx
// apps/portal/components/listings/ListingDetail.tsx

export function ListingDetail({ listing }: ListingDetailProps) {
  return (
    <div>
      {/* CUSTOMIZE: Property features grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold">{listing.customFields?.bedrooms}</div>
          <div className="text-sm text-gray-500">Bedrooms</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{listing.customFields?.bathrooms}</div>
          <div className="text-sm text-gray-500">Bathrooms</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">
            {listing.customFields?.sqft?.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">Sq Ft</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{listing.customFields?.yearBuilt}</div>
          <div className="text-sm text-gray-500">Year Built</div>
        </div>
      </div>

      {/* CUSTOMIZE: Amenities list */}
      {listing.customFields?.amenities?.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-3">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {listing.customFields.amenities.map((amenity) => (
              <span key={amenity} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

#### Customizing FilterPanel

```tsx
// apps/portal/components/search/FilterPanel.tsx

// CUSTOMIZE: Add your filter categories
const PROPERTY_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'house', label: 'House' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
];

const BEDROOM_OPTIONS = ['Any', '1+', '2+', '3+', '4+', '5+'];

export function FilterPanel({ isOpen, onClose }: FilterPanelProps) {
  const [propertyType, setPropertyType] = useState('');
  const [minBedrooms, setMinBedrooms] = useState('');

  return (
    <div>
      {/* Property Type Filter */}
      <div>
        <label>Property Type</label>
        <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
          {PROPERTY_TYPES.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      {/* Bedrooms Filter */}
      <div>
        <label>Bedrooms</label>
        <div className="flex gap-2">
          {BEDROOM_OPTIONS.map((option) => (
            <button
              key={option}
              className={`px-4 py-2 rounded ${minBedrooms === option ? 'bg-emerald-600 text-white' : 'bg-gray-100'}`}
              onClick={() => setMinBedrooms(option === 'Any' ? '' : option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Level 3: Database Customization

### Adding Custom Fields to Database

Create a new migration:

```bash
pnpm supabase migration new add_property_fields
```

Edit the migration file:

```sql
-- supabase/migrations/TIMESTAMP_add_property_fields.sql

-- Add custom fields column (JSONB for flexibility)
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';

-- Add specific columns for indexed/filtered fields
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS bedrooms INTEGER,
ADD COLUMN IF NOT EXISTS bathrooms NUMERIC(3,1),
ADD COLUMN IF NOT EXISTS sqft INTEGER,
ADD COLUMN IF NOT EXISTS property_type VARCHAR(50);

-- Create indexes for filterable fields
CREATE INDEX IF NOT EXISTS idx_listings_bedrooms ON listings(bedrooms);
CREATE INDEX IF NOT EXISTS idx_listings_property_type ON listings(property_type);
CREATE INDEX IF NOT EXISTS idx_listings_sqft ON listings(sqft);
```

Apply the migration:

```bash
pnpm supabase db reset
```

---

## Level 4: Styling Customization

### Theme Colors

Update `config/brand.config.ts`:

```typescript
theme: {
  primaryColor: '#059669',      // Emerald
  secondaryColor: '#047857',
  accentColor: '#F59E0B',
  primaryColorClass: 'emerald-600',
  secondaryColorClass: 'emerald-700',
}
```

### Global Styles

Edit `apps/portal/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* CUSTOMIZE: Your brand colors */
    --color-primary: 16 185 129;  /* emerald-500 */
    --color-primary-dark: 5 150 105;  /* emerald-600 */
  }
}

@layer components {
  /* CUSTOMIZE: Custom component styles */
  .btn-primary {
    @apply bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors;
  }

  .card {
    @apply bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden;
  }
}
```

---

## Example: Complete Real Estate Customization

### 1. listing.config.ts

```typescript
export const listingConfig = {
  name: 'Property',
  namePlural: 'Properties',
  slug: 'properties',

  coreFields: {
    title: { enabled: true, required: true, maxLength: 100 },
    description: { enabled: true, required: true },
    price: { enabled: true, required: true, currency: 'USD' },
    location: { enabled: true, enableMap: true, requireCity: true },
    images: { enabled: true, maxCount: 30, requiredCount: 5 },
    category: { enabled: true, required: true },
  },

  customFields: [
    { name: 'bedrooms', type: 'number', label: 'Bedrooms', filterable: true, sortable: true },
    { name: 'bathrooms', type: 'number', label: 'Bathrooms', filterable: true },
    { name: 'sqft', type: 'number', label: 'Square Feet', unit: 'sqft', filterable: true, sortable: true },
    { name: 'lotSize', type: 'number', label: 'Lot Size', unit: 'acres' },
    { name: 'yearBuilt', type: 'number', label: 'Year Built' },
    { name: 'propertyType', type: 'select', label: 'Property Type', required: true, filterable: true,
      options: [
        { value: 'single_family', label: 'Single Family' },
        { value: 'condo', label: 'Condo' },
        { value: 'townhouse', label: 'Townhouse' },
        { value: 'multi_family', label: 'Multi-Family' },
        { value: 'land', label: 'Land' },
      ],
    },
    { name: 'listingType', type: 'select', label: 'Listing Type', required: true, filterable: true,
      options: [
        { value: 'for_sale', label: 'For Sale' },
        { value: 'for_rent', label: 'For Rent' },
        { value: 'sold', label: 'Sold' },
      ],
    },
    { name: 'amenities', type: 'multiselect', label: 'Amenities', filterable: true,
      options: [
        { value: 'pool', label: 'Pool' },
        { value: 'garage', label: 'Garage' },
        { value: 'fireplace', label: 'Fireplace' },
        { value: 'ac', label: 'Central A/C' },
        { value: 'basement', label: 'Basement' },
        { value: 'deck', label: 'Deck/Patio' },
      ],
    },
    { name: 'parking', type: 'number', label: 'Parking Spaces' },
    { name: 'hoa', type: 'number', label: 'HOA Fee', unit: '/month' },
  ],

  features: {
    reviews: false,        // Not typical for real estate
    ratings: false,
    booking: false,
    messaging: true,
    favorites: true,
    sharing: true,
    comparing: true,
    reporting: true,
  },

  statuses: [
    { value: 'draft', label: 'Draft', color: 'gray', isDefault: true },
    { value: 'active', label: 'Active', color: 'green', isActive: true },
    { value: 'pending', label: 'Pending', color: 'yellow', isActive: true },
    { value: 'sold', label: 'Sold', color: 'blue' },
    { value: 'off_market', label: 'Off Market', color: 'gray' },
  ],
};
```

### 2. brand.config.ts

```typescript
export const brandConfig = {
  platform: {
    name: 'PropertyHub',
    tagline: 'Find Your Dream Home',
    domain: 'propertyhub.com',
    supportEmail: 'support@propertyhub.com',
  },

  theme: {
    primaryColor: '#1E40AF',
    secondaryColor: '#1E3A8A',
    primaryColorClass: 'blue-700',
  },

  seo: {
    defaultTitle: 'PropertyHub - Real Estate Listings',
    titleTemplate: '%s | PropertyHub',
    defaultDescription: 'Find homes for sale and rent in your area.',
  },
};
```

---

## Tips and Best Practices

1. **Start with configuration** - Most customization can be done without code changes
2. **Use CUSTOMIZE comments** - Search for `// CUSTOMIZE:` to find customization points
3. **Test incrementally** - Make small changes and verify before moving on
4. **Keep types updated** - Update TypeScript types when adding custom fields
5. **Document changes** - Add comments explaining why you customized something
6. **Use feature flags** - Enable features gradually, not all at once

---

## Need Help?

- See `FORKING.md` for initial setup
- See `config/README.md` for configuration details
- See `docs/DEVELOPER_GUIDE.md` for development workflow
