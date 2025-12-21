"use client";

/**
 * ListingMap - Map component for listing location
 *
 * CUSTOMIZE: Replace with your preferred map provider
 * Options: Google Maps, Mapbox, Leaflet, etc.
 *
 * This is a placeholder component. To implement:
 * 1. Install your map library (e.g., @react-google-maps/api, react-map-gl)
 * 2. Configure API keys in environment variables
 * 3. Replace the placeholder with the actual map implementation
 */

interface ListingMapProps {
  lat: number;
  lng: number;
  title: string;
}

export function ListingMap({ lat, lng, title }: ListingMapProps) {
  // CUSTOMIZE: Replace with actual map implementation

  return (
    <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700">
      {/* Placeholder - Replace with actual map */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <svg
          className="w-12 h-12 mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </p>
        <p className="text-xs mt-2 text-gray-400">
          Map integration placeholder
        </p>
      </div>

      {/* CUSTOMIZE: Example Google Maps implementation
      import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
      
      const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
      });

      return isLoaded ? (
        <GoogleMap
          mapContainerClassName="w-full h-full"
          center={{ lat, lng }}
          zoom={15}
        >
          <Marker position={{ lat, lng }} title={title} />
        </GoogleMap>
      ) : null;
      */}

      {/* CUSTOMIZE: Example Mapbox implementation
      import Map, { Marker } from 'react-map-gl';
      import 'mapbox-gl/dist/mapbox-gl.css';

      return (
        <Map
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          initialViewState={{ latitude: lat, longitude: lng, zoom: 14 }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
        >
          <Marker latitude={lat} longitude={lng} />
        </Map>
      );
      */}
    </div>
  );
}

export default ListingMap;
