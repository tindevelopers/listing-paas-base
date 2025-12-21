"use client";

import Link from "next/link";
import Image from "next/image";
import { type Listing, formatPrice } from "@/lib/listings";

/**
 * ListingCard - Card component for listing grid/search results
 *
 * CUSTOMIZE: Modify this component to display fields relevant to your listing type
 * - Real estate: Add beds/baths/sqft badges
 * - Services: Add ratings/availability
 * - Directory: Add business hours/phone
 */

interface ListingCardProps {
  listing: Listing;
  className?: string;
}

export function ListingCard({ listing, className = "" }: ListingCardProps) {
  // CUSTOMIZE: Update the default image path for your vertical
  const primaryImage = listing.images?.[0] || "/images/placeholder-listing.jpg";

  return (
    <Link
      href={`/listings/${listing.slug}`}
      className={`group block overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow ${className}`}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={primaryImage}
          alt={listing.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* CUSTOMIZE: Add status badge or featured indicator */}
        {listing.status === "sold" && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            Sold
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Price */}
        <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-1">
          {formatPrice(listing.price)}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
          {listing.title}
        </h3>

        {/* Location */}
        {listing.location && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
            {[listing.location.city, listing.location.state]
              .filter(Boolean)
              .join(", ")}
          </p>
        )}

        {/* CUSTOMIZE: Add custom field badges for your vertical */}
        {/* Example for real estate:
        <div className="flex items-center gap-3 mt-3 text-sm text-gray-600 dark:text-gray-300">
          <span>{listing.customFields?.bedrooms} beds</span>
          <span>•</span>
          <span>{listing.customFields?.bathrooms} baths</span>
          <span>•</span>
          <span>{listing.customFields?.sqft?.toLocaleString()} sqft</span>
        </div>
        */}

        {/* Category Tag */}
        {listing.category && (
          <div className="mt-3">
            <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded">
              {listing.category}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default ListingCard;
