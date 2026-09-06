import React from 'react';

export const SkeletonBox: React.FC<{ width?: string; height?: string; borderRadius?: string; style?: React.CSSProperties }> = ({
  width = '100%',
  height = '20px',
  borderRadius = '8px',
  style,
}) => (
  <div
    style={{
      width,
      height,
      borderRadius,
      backgroundColor: '#e2e8f0',
      animation: 'skeleton-pulse 1.2s infinite ease-in-out',
      ...style,
    }}
  />
);

export const DeliveryOrderSkeleton: React.FC = () => (
  <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
      <SkeletonBox width="120px" height="16px" />
      <SkeletonBox width="80px" height="20px" borderRadius="12px" />
    </div>
    <SkeletonBox width="80%" height="14px" style={{ marginBottom: '8px' }} />
    <SkeletonBox width="50%" height="14px" style={{ marginBottom: '12px' }} />
    <div style={{ display: 'flex', gap: '8px' }}>
      <SkeletonBox height="36px" width="100%" borderRadius="8px" />
    </div>
  </div>
);

export const DashboardStatSkeleton: React.FC = () => (
  <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', flex: 1 }}>
    <SkeletonBox width="60px" height="12px" style={{ marginBottom: '8px' }} />
    <SkeletonBox width="100px" height="24px" />
  </div>
);
