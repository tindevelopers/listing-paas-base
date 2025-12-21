"use client";

import { type Listing, formatPrice } from "@/lib/listings";
import { ListingGallery } from "./ListingGallery";
import { ListingMap } from "./ListingMap";

/**
 * ListingDetail - Full listing view component
 *
 * CUSTOMIZE: Update this component to display all relevant fields for your listing type
 * - Real estate: Property details, amenities, HOA, tax info
 * - Services: Pricing tiers, availability calendar, reviews
 * - Directory: Business hours, contact info, services offered
 */

interface ListingDetailProps {
  listing: Listing;
}

export function ListingDetail({ listing }: ListingDetailProps) {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Gallery Section */}
      <ListingGallery images={listing.images} title={listing.title} />

      {/* Main Content Grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {listing.title}
            </h1>

            {listing.location && (
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {[
                  listing.location.address,
                  listing.location.city,
                  listing.location.state,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatPrice(listing.price)}
          </div>

          {/* CUSTOMIZE: Add custom fields section for your vertical */}
          {/* Example for real estate:
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {listing.customFields?.bedrooms || 0}
              </div>
              <div className="text-sm text-gray-500">Bedrooms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {listing.customFields?.bathrooms || 0}
              </div>
              <div className="text-sm text-gray-500">Bathrooms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {listing.customFields?.sqft?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-500">Sq Ft</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {listing.customFields?.yearBuilt || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">Year Built</div>
            </div>
          </div>
          */}

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Description
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          </div>

          {/* CUSTOMIZE: Add additional sections for your vertical */}
          {/* Examples:
            - Amenities list
            - Services offered
            - Business hours
            - Reviews section
            - Availability calendar
          */}

          {/* Map Section */}
          {listing.location?.lat && listing.location?.lng && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Location
              </h2>
              <ListingMap
                lat={listing.location.lat}
                lng={listing.location.lng}
                title={listing.title}
              />
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-4">
            {/* Contact/CTA Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {/* CUSTOMIZE: Update CTA text for your vertical */}
                Interested in this listing?
              </h3>

              {/* CUSTOMIZE: Add appropriate CTAs for your vertical */}
              <button
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors mb-3"
              >
                {/* CUSTOMIZE: "Schedule Tour", "Book Now", "Contact" */}
                Contact Seller
              </button>

              <button
                type="button"
                className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Save to Favorites
              </button>
            </div>

            {/* Listing Meta Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm text-gray-500 dark:text-gray-400">
              <p>Listed: {new Date(listing.createdAt).toLocaleDateString()}</p>
              <p>Updated: {new Date(listing.updatedAt).toLocaleDateString()}</p>
              {listing.category && <p>Category: {listing.category}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListingDetail;
