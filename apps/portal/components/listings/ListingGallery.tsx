"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * ListingGallery - Image gallery component for listing detail
 *
 * CUSTOMIZE: Add video support, 3D tours, or floor plans for your vertical
 */

interface ListingGalleryProps {
  images: string[];
  title: string;
}

export function ListingGallery({ images, title }: ListingGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Handle empty images
  if (!images || images.length === 0) {
    return (
      <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center">
        <span className="text-gray-400 dark:text-gray-500">No images available</span>
      </div>
    );
  }

  const selectedImage = images[selectedIndex];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
        <Image
          src={selectedImage}
          alt={`${title} - Image ${selectedIndex + 1}`}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
        />

        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
          {selectedIndex + 1} / {images.length}
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setSelectedIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setSelectedIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                index === selectedIndex
                  ? "border-blue-500"
                  : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <Image
                src={image}
                alt={`${title} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ListingGallery;
