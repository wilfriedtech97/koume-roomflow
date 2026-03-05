import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// Animated overlay modal with glass-card styling
// Closes when clicking backdrop or the X button
export default function GlassModal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  // Don't render anything when modal is closed
  if (!open) return null;

  return (
    <AnimatePresence>
      {/* Full-screen overlay container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Blurred dark backdrop — clicking it closes the modal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        {/* Modal content panel with spring entrance animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-full ${maxWidth} glass-card p-6 max-h-[85vh] overflow-y-auto`}
        >
          {/* Header with title and close button */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Slot for modal body content */}
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}