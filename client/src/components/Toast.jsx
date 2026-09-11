import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Bookmark, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10, transition: { duration: 0.15 } }}
            className="pointer-events-auto flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-[#12151d] border border-[#1e2433] shadow-xl text-[#e2dbd0]"
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#d49547] shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-[#c73e45] shrink-0" />}
            {toast.type === 'info' && <Bookmark className="w-4 h-4 text-[#828b99] shrink-0" />}
            
            <p className="text-xs font-medium pr-1 text-[#e2dbd0]">{toast.message}</p>

            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded text-[#828b99] hover:text-[#e2dbd0] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
