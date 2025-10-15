"use client";

import { motion } from "framer-motion";

export default function MapLandPin({ address, zoom }) {
  // Extract the street number from the address
  const streetNumber = address?.match(/^\d+/)?.[0] || "";
  const showPill = zoom >= 14;

  if (!showPill) {
    // Just show the green dot when zoomed out
    return (
      <div className="relative flex items-center justify-center w-6 h-6">
        {/* Outer pulsing ring */}
        <motion.div
          className="absolute w-6 h-6 rounded-full bg-green-500/30"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Inner solid circle */}
        <motion.div
          className="absolute w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-lg"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    );
  }

  // Show pill with number and green dot when zoomed in
  return (
    <div className="relative">
      {/* Pill container */}
      <div className="bg-white rounded-full px-3 py-1 shadow-lg border border-gray-200">
        <span className="text-sm font-semibold text-gray-900">{streetNumber}</span>
      </div>

      {/* Green dot in top right */}
      <div className="absolute -top-1 right-0 flex items-center justify-center w-4 h-4">
        {/* Outer pulsing ring */}
        <motion.div
          className="absolute w-4 h-4 rounded-full bg-green-500/30"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Inner solid circle */}
        <motion.div
          className="absolute w-2 h-2 rounded-full bg-green-500 border border-white shadow-lg"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}
