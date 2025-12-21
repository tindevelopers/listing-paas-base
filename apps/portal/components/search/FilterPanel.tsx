"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * FilterPanel - Advanced filtering options for search
 *
 * CUSTOMIZE: Add filters specific to your listing vertical
 * - Real estate: Beds, baths, sqft range, property type, amenities
 * - Services: Service type, price range, availability, ratings
 * - Directory: Category, hours, distance, ratings
 */

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

// CUSTOMIZE: Update categories for your vertical
const DEFAULT_CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "land", label: "Land" },
  // Add your categories here
];

// CUSTOMIZE: Update sort options
const SORT_OPTIONS = [
  { value: "date", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "relevance", label: "Relevance" },
];

export function FilterPanel({ isOpen, onClose, className = "" }: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter state
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "date");
  const [location, setLocation] = useState(searchParams.get("location") || "");

  // CUSTOMIZE: Add more filter state for your vertical
  // const [bedrooms, setBedrooms] = useState(searchParams.get('beds') || '');

  // Sync state with URL params
  useEffect(() => {
    setCategory(searchParams.get("category") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setSortBy(searchParams.get("sort") || "date");
    setLocation(searchParams.get("location") || "");
  }, [searchParams]);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());

    // Update params based on filter values
    if (category) params.set("category", category);
    else params.delete("category");

    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");

    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");

    if (sortBy) params.set("sort", sortBy);
    else params.delete("sort");

    if (location) params.set("location", location);
    else params.delete("location");

    // CUSTOMIZE: Add more filter params

    params.delete("page"); // Reset pagination

    router.push(`/search?${params.toString()}`);
    onClose();
  }, [category, minPrice, maxPrice, sortBy, location, searchParams, router, onClose]);

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams();
    const query = searchParams.get("q");
    if (query) params.set("q", query);

    router.push(`/search?${params.toString()}`);
    onClose();
  }, [searchParams, router, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl z-50 overflow-y-auto ${className}`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filters
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Price Range
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              placeholder="City, state, or zip"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* CUSTOMIZE: Add more filters for your vertical */}
          {/* Example for real estate:
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bedrooms
            </label>
            <div className="flex gap-2">
              {['Any', '1+', '2+', '3+', '4+', '5+'].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`px-4 py-2 rounded-lg border ${
                    bedrooms === option
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setBedrooms(option === 'Any' ? '' : option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          */}

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex gap-3">
          <button
            type="button"
            onClick={clearFilters}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={applyFilters}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}

export default FilterPanel;
