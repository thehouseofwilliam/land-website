"use client";

export default function MapRightLandCards({ property, onClick }) {
  return (
    <div
      onClick={onClick}
      className="p-4 border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
    >
      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
        {property.address}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {property.city}, {property.state} {property.zip}
      </p>
    </div>
  );
}
