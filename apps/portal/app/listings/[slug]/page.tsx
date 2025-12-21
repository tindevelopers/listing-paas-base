import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { ListingDetail } from "@/components/listings";
import { getListingBySlug, getAllListingSlugs } from "@/lib/listings";

/**
 * Listing Detail Page
 *
 * CUSTOMIZE: Update metadata generation and add schema.org structured data
 * for SEO optimization specific to your listing vertical.
 */

interface ListingPageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: ListingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    return {
      title: "Listing Not Found",
    };
  }

  // CUSTOMIZE: Update meta description format for your vertical
  const description = listing.description?.slice(0, 160) || 
    `View details for ${listing.title}`;

  return {
    title: `${listing.title} | Listing Platform`,
    description,
    openGraph: {
      title: listing.title,
      description,
      images: listing.images?.[0] ? [listing.images[0]] : [],
      type: "website",
    },
    // CUSTOMIZE: Add structured data for your listing type
    // For real estate: Product schema, RealEstateListing
    // For services: Service schema
    // For directory: LocalBusiness schema
  };
}

// Generate static paths for SSG (optional, for better performance)
export async function generateStaticParams() {
  // CUSTOMIZE: Enable this for SSG if you have a known set of listings
  // const slugs = await getAllListingSlugs();
  // return slugs.map((slug) => ({ slug }));
  return [];
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <li>
              <a href="/" className="hover:text-gray-700 dark:hover:text-gray-200">
                Home
              </a>
            </li>
            <li>/</li>
            <li>
              <a
                href="/listings"
                className="hover:text-gray-700 dark:hover:text-gray-200"
              >
                Listings
              </a>
            </li>
            {listing.category && (
              <>
                <li>/</li>
                <li>
                  <a
                    href={`/categories/${listing.category}`}
                    className="hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    {listing.category}
                  </a>
                </li>
              </>
            )}
            <li>/</li>
            <li className="text-gray-900 dark:text-white truncate max-w-[200px]">
              {listing.title}
            </li>
          </ol>
        </nav>

        {/* Listing Detail */}
        <ListingDetail listing={listing} />
      </main>

      <Footer />
    </div>
  );
}
