import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;
  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-800 animate-slide-up">
      {isSuccess ? (
        <CheckCircle className="text-emerald-400 shrink-0" size={20} />
      ) : (
        <AlertCircle className="text-rose-400 shrink-0" size={20} />
      )}
      <span className="text-sm font-medium">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-3 text-slate-400 hover:text-white font-bold text-xs"
        >
          ✕
        </button>
      )}
    </div>
  );
};
