import React from 'react';
import { ShoppingBag } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = ShoppingBag,
  title = 'No Items Found',
  description = 'There are no items to display at this time.',
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm my-6">
      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
        <Icon size={32} />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-full transition-colors shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
