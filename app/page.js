"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, TrendingDown, Lock, Map } from "lucide-react";
import MapMoreLocations from "@/components/Map/MapMoreLocations";

export default function Home() {
  const [cityInput, setcityInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showNonUSModal, setShowNonUSModal] = useState(false);
  const router = useRouter();

  const popularLocations = [
    { name: "Miami, FL", value: "Miami, FL" },
    { name: "Los Angeles, CA", value: "Los Angeles, CA" },
  ];

  const handleSearch = async () => {
    if (!cityInput.trim()) return;

    setIsLoading(true);

    try {
      // Use Google Maps Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cityInput)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const { lat, lng } = result.geometry.location;

        // Check if location is in USA
        let country = "";
        result.address_components.forEach((component) => {
          if (component.types.includes("country")) {
            country = component.short_name;
          }
        });

        if (country !== "US") {
          setShowNonUSModal(true);
          return;
        }

        // Navigate to map - only lat, lng
        router.push(`/map?lat=${lat}&lng=${lng}`);
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

  const features = [
    {
      icon: Lock,
      title: "Off-Market Deals",
      description: "Exclusive land opportunities",
    },
    {
      icon: TrendingDown,
      title: "Below Market Value",
      description: "Properties priced under market",
    },
    {
      icon: Map,
      title: "Easy Discovery",
      description: "Find land quickly on our map",
    },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              LandConnect
            </span>
          </div>
          <nav className="flex gap-6 text-sm font-medium">
            <a href="/map" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Browse
            </a>
            <a href="#" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              List Land
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content - Centered */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-4xl text-center">
          {/* Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
            Find Land
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-12">
            Below-market opportunities for builders
          </p>

          {/* Search Section */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
              <label className="block text-left text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Select Location
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none z-10" />
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => setcityInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Enter state, city, or zip..."
                    list="popular-locations"
                    className="w-full pl-12 pr-6 py-4 text-lg rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                  />
                  <datalist id="popular-locations">
                    {popularLocations.map((location, index) => (
                      <option key={index} value={location.value}>
                        {location.name}
                      </option>
                    ))}
                  </datalist>
                </div>
                <button
                  onClick={handleSearch}
                  disabled={!cityInput.trim() || isLoading}
                  className="px-10 py-4 text-lg font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 whitespace-nowrap"
                >
                  {isLoading ? "Finding..." : "Search"}
                </button>
              </div>

              {/* Popular Locations Quick Select */}
              <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
                <span className="text-sm text-slate-600 dark:text-slate-400">Popular:</span>
                {popularLocations.map((location, index) => (
                  <button
                    key={index}
                    onClick={() => setcityInput(location.value)}
                    className="px-4 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  >
                    {location.name}
                  </button>
                ))}
              </div>

              {/* USA Indicator */}
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="text-2xl">🇺🇸</span>
                <span>Currently showing USA properties only</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-400">
            <p>&copy; {new Date().getFullYear()} LandConnect. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Non-US Location Modal */}
      <MapMoreLocations
        isOpen={showNonUSModal}
        onClose={() => setShowNonUSModal(false)}
      />
    </div>
  );
}
