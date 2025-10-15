"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MapPin, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function MapFilter() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [displayLocation, setDisplayLocation] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    // Load recent searches from localStorage
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Always sync display location with URL - reverse geocode whenever lat/lng changes
  useEffect(() => {
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (lat && lng) {
      // Reverse geocode to get location name
      fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.results && data.results.length > 0) {
            const result = data.results[0];
            let displayName = "";
            let state = "";

            result.address_components.forEach((component) => {
              if (component.types.includes("neighborhood") || component.types.includes("sublocality")) {
                displayName = component.long_name;
              }
              if (component.types.includes("administrative_area_level_1")) {
                state = component.short_name;
              }
            });

            // Fall back to locality if no neighborhood
            if (!displayName) {
              result.address_components.forEach((component) => {
                if (component.types.includes("locality")) {
                  displayName = component.long_name;
                }
              });
            }

            // Fall back to state if nothing else
            if (!displayName && state) {
              displayName = state;
            }

            if (displayName && state) {
              setDisplayLocation(`${displayName}, ${state}`);
            } else if (displayName) {
              setDisplayLocation(displayName);
            } else {
              setDisplayLocation(result.formatted_address);
            }
          }
        })
        .catch((err) => console.error("Reverse geocoding error:", err));
    } else {
      // No lat/lng in URL, clear display
      setDisplayLocation("");
    }
  }, [searchParams]);

  const handleSearch = async () => {
    if (!locationInput.trim()) return;

    setIsLoading(true);

    try {
      // Use Google Maps Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationInput)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const { lat, lng } = result.geometry.location;

        // Extract location info for display - prioritize neighborhood/sublocality
        let displayName = "";
        let state = "";

        result.address_components.forEach((component) => {
          if (component.types.includes("neighborhood") || component.types.includes("sublocality")) {
            displayName = component.long_name;
          }
          if (component.types.includes("administrative_area_level_1")) {
            state = component.short_name;
          }
        });

        // Fall back to locality (city) if no neighborhood
        if (!displayName) {
          result.address_components.forEach((component) => {
            if (component.types.includes("locality")) {
              displayName = component.long_name;
            }
          });
        }

        // Fall back to state if nothing else
        if (!displayName && state) {
          displayName = state;
        }

        // Set display location
        const locationDisplay = displayName && state ? `${displayName}, ${state}` : displayName || result.formatted_address;
        setDisplayLocation(locationDisplay);

        // Save to recent searches
        const newSearch = { name: locationDisplay, lat, lng };
        const updated = [newSearch, ...recentSearches.filter(s => s.name !== locationDisplay)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem("recentSearches", JSON.stringify(updated));

        // Only use lat and lng, simple zoom based on location type
        const locationType = result.types[0];
        let zoom = 13; // Default

        if (locationType === "country") {
          zoom = 4;
        } else if (locationType === "administrative_area_level_1") {
          zoom = 6; // State
        } else if (locationType === "locality") {
          zoom = 12; // City
        } else if (locationType === "postal_code") {
          zoom = 14; // Zip
        } else if (locationType === "street_address" || locationType === "premise") {
          zoom = 18; // Address
        }

        router.push(`/map?lat=${lat}&lng=${lng}&zoom=${zoom}`);
        setIsOpen(false);
        setLocationInput("");
      } else {
        alert("Location not found. Please try again.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      alert("Error finding location. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={() => setIsOpen(false)}
      />

      {/* Filter Panel */}
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 w-96 p-6 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Filters
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Location Filter */}
        <div className="space-y-4">
          <div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Enter state, city, or zip..."
                className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="flex gap-2 overflow-x-auto mt-2 pb-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/map?lat=${search.lat}&lng=${search.lng}&zoom=12`);
                      setIsOpen(false);
                    }}
                    className="group flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors whitespace-nowrap flex-shrink-0"
                  >
                    {search.name}
                    <X
                      className="w-2.5 h-2.5 opacity-60 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = recentSearches.filter((_, i) => i !== index);
                        setRecentSearches(updated);
                        localStorage.setItem("recentSearches", JSON.stringify(updated));
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Apply Button */}
          <button
            onClick={handleSearch}
            disabled={!locationInput.trim() || isLoading}
            className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  if (!mounted) return null;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 transition-all group"
      >
        <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {displayLocation || "Search Location"}
        </span>
      </button>

      {/* Portal Modal */}
      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
