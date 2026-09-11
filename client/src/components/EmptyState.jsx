import React from 'react';
import { Film, RotateCcw, AlertTriangle } from 'lucide-react';

export default function EmptyState({
  title = 'No Movies Found',
  description = 'We couldn’t find any movies matching your current filters or search term.',
  onReset,
  isError = false,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center glass-panel rounded-3xl border border-slate-800/80 my-8">
      <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400">
        {isError ? (
          <AlertTriangle className="w-10 h-10 text-rose-400" />
        ) : (
          <Film className="w-10 h-10" />
        )}
      </div>

      <h3 className="text-2xl font-bold text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-400 max-w-md mb-8 text-sm md:text-base leading-relaxed">
        {description}
      </p>

      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]"
        >
          <RotateCcw className="w-4 h-4" />
          {isError ? 'Retry Loading' : 'Reset All Filters'}
        </button>
      )}
    </div>
  );
}
