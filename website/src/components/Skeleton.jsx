import React from 'react';

export const SkeletonBox = ({ width = '100%', height = '20px', borderRadius = '8px', className = '' }) => (
  <div
    className={`skeleton-box ${className}`}
    style={{ width, height, borderRadius }}
  />
);

export const ProductCardSkeleton = () => (
  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-3">
    <SkeletonBox height="140px" borderRadius="10px" />
    <SkeletonBox height="16px" width="75%" />
    <SkeletonBox height="14px" width="40%" />
    <div className="flex items-center justify-between mt-2">
      <SkeletonBox height="20px" width="30%" />
      <SkeletonBox height="36px" width="80px" borderRadius="999px" />
    </div>
  </div>
);

export const CategoryCardSkeleton = () => (
  <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
    <SkeletonBox width="64px" height="64px" borderRadius="50%" />
    <SkeletonBox height="14px" width="60px" />
  </div>
);
