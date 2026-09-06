import React from 'react';
import { ProductCardSkeleton } from '../Skeleton';

export const Loading = ({ text = 'Loading...' }) => {
  return (
    <div className="space-y-4 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProductCardSkeleton />
        <ProductCardSkeleton />
        <ProductCardSkeleton />
        <ProductCardSkeleton />
      </div>
    </div>
  );
};
