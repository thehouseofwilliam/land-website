"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Globe } from "lucide-react";

export default function MapMoreLocations({ isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md mx-4 p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
            <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            USA Only for Now
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            We're currently only active in the United States. More locations coming soon!
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  ) : null;

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
