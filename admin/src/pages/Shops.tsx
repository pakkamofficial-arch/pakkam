import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Store, Star, MapPin, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export const Shops: React.FC = () => {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const res = await api.get('/shops');
      if (res.data.success) {
        setShops(res.data.shops || []);
      }
    } catch (err) {
      console.error('Failed to fetch shops', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (shopId: string, newStatus: string) => {
    try {
      const res = await api.put(`/shops/${shopId}`, { status: newStatus });
      if (res.data.success) {
        alert(`Shop status updated to ${newStatus}`);
        fetchShops();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update shop status');
    }
  };

  if (loading) return <div style={{ padding: '24px' }}>Loading Shops...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Registered Nearby Shops</h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Manage shop approvals, status and delivery coverage</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {shops.map((shop) => (
          <div key={shop._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <img src={shop.logo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300'} alt={shop.name} style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{shop.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#d97706', marginTop: '2px' }}>
                  <Star size={14} fill="#d97706" />
                  <span style={{ fontWeight: '600' }}>{shop.rating || 4.5}</span>
                  <span style={{ color: '#64748b' }}>({shop.reviewCount || 100} reviews)</span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <MapPin size={12} />
                  <span>{shop.address}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px' }}>
              <span>Delivery Radius: <strong>{shop.deliveryRadius || 5} km</strong></span>
              <span>Min Order: <strong>₹{shop.minimumOrder || 100}</strong></span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
              <div>
                <span className={`badge ${shop.status === 'APPROVED' ? 'badge-green' : shop.status === 'SUSPENDED' ? 'badge-red' : 'badge-yellow'}`}>
                  {shop.status}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {shop.status !== 'APPROVED' && (
                  <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => handleStatusChange(shop._id, 'APPROVED')}>
                    Approve
                  </button>
                )}
                {shop.status !== 'SUSPENDED' && (
                  <button style={{ backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }} onClick={() => handleStatusChange(shop._id, 'SUSPENDED')}>
                    Suspend
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
