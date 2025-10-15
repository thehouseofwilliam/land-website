"use client";

export default function MapLandPinHover({ property }) {
  if (!property) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 min-w-[200px] pointer-events-none">
      <div className="space-y-2">
        {property.address && (
          <div className="font-semibold text-gray-900">
            {property.address}
          </div>
        )}
        {property.city && property.state && (
          <div className="text-sm text-gray-600">
            {property.city}, {property.state}
          </div>
        )}
        {property.acres && (
          <div className="text-sm text-gray-700">
            <span className="font-medium">Acres:</span> {property.acres}
          </div>
        )}
        {property.price && (
          <div className="text-sm text-gray-700">
            <span className="font-medium">Price:</span> ${property.price.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
