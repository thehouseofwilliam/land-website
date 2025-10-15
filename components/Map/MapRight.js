"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { X } from "lucide-react";
import MapRightLandCards from "@/components/Map/MapRightLandCards";

export default function MapRight({ land, onPropertyClick }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const state = searchParams.get("state");
  const city = searchParams.get("city");

  const handleClearState = () => {
    router.push("/map");
  };

  const handleClearCity = async () => {
    if (state) {
      try {
        // Geocode the state to get its center coordinates
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(state)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          router.push(`/map?state=${state}&lat=${lat}&lng=${lng}&zoom=6`);
        } else {
          router.push(`/map?state=${state}`);
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        router.push(`/map?state=${state}`);
      }
    }
  };

  return (
    <div className="w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 overflow-y-auto">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Available Land
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            ({Object.keys(land).length})
          </span>
        </div>

        {/* Filter Pills */}
        {(state || city) && (
          <div className="flex flex-wrap gap-2">
            {state && (
              <button
                onClick={handleClearState}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                {state}
                <X className="w-3 h-3" />
              </button>
            )}
            {city && (
              <button
                onClick={handleClearCity}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                {city}
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
      <div>
        {Object.values(land).map((property) => (
          <MapRightLandCards
            key={property.id}
            property={property}
            onClick={() => onPropertyClick(property)}
          />
        ))}
      </div>
    </div>
  );
}
