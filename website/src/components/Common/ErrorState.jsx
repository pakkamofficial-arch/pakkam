import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const ErrorState = ({
  title = 'Unable to Load Data',
  message = 'Please check your internet connection and try again.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-rose-50/70 border border-rose-200 rounded-2xl my-4">
      <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-3">
        <AlertTriangle size={24} />
      </div>
      <h4 className="text-base font-bold text-rose-900 mb-1">{title}</h4>
      <p className="text-xs text-rose-700 max-w-md mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-full transition-colors"
        >
          <RefreshCw size={14} />
          Retry
        </button>
      )}
    </div>
  );
};
