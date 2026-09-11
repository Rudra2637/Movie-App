import React from 'react';
import { Film, RotateCcw, AlertCircle } from 'lucide-react';

export default function EmptyState({
  title = 'No Archival Records Found',
  description = 'No films match your selected filter criteria or search query.',
  onReset,
  isError = false,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center film-plate rounded-xl my-6">
      <div className="w-14 h-14 rounded-lg bg-[#181c26] border border-[#262c3d] flex items-center justify-center mb-4 text-[#d49547]">
        {isError ? (
          <AlertCircle className="w-6 h-6 text-[#c73e45]" />
        ) : (
          <Film className="w-6 h-6" />
        )}
      </div>

      <h3 className="text-lg font-bold text-[#e2dbd0] mb-1.5 font-['Syne']">{title}</h3>
      <p className="text-[#828b99] max-w-sm mb-6 text-xs sm:text-sm leading-relaxed">
        {description}
      </p>

      {onReset && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#d49547] hover:bg-[#c28539] text-[#08090c] font-bold text-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {isError ? 'Retry Connection' : 'Reset Filters'}
        </button>
      )}
    </div>
  );
}
