"use client";

import { MapPin } from "lucide-react";
import MapFilter from "@/components/Map/MapFilter";

export default function Header() {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span className="text-lg font-semibold text-slate-900 dark:text-white">
            LandConnect
          </span>
        </a>
        <MapFilter />
      </div>
    </header>
  );
}
