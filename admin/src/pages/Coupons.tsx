import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Ticket, Plus } from 'lucide-react';

export const Coupons: React.FC = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    description: '',
    discountType: 'FLAT',
    discountValue: 50,
    minimumOrder: 200,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/coupons');
      if (res.data.success) {
        setCoupons(res.data.coupons || []);
      }
    } catch (err) {
      console.error('Failed to fetch coupons', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async () => {
    if (!newCoupon.code || !newCoupon.description) {
      alert('Please fill out code and description');
      return;
    }
    try {
      const res = await api.post('/coupons', newCoupon);
      if (res.data.success) {
        setShowModal(false);
        fetchCoupons();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create coupon');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      fetchCoupons();
    } catch (err) {
      alert('Failed to delete coupon');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Coupons & Promotions</h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Create discount offers & promo codes for customers</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {coupons.map((coupon) => (
          <div key={coupon._id} className="card" style={{ borderLeft: '4px solid #16a34a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="badge badge-green" style={{ fontSize: '14px', fontWeight: '700' }}>{coupon.code}</span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Expires {new Date(coupon.expiryDate).toLocaleDateString()}</span>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '12px' }}>{coupon.description}</p>
            <div style={{ fontSize: '13px', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Discount: <strong>{coupon.discountType === 'FLAT' ? `₹${coupon.discountValue}` : `${coupon.discountValue}%`} OFF</strong></span>
              <span>Min Order: <strong>₹{coupon.minimumOrder}</strong></span>
            </div>
            <div style={{ marginTop: '12px', textAlign: 'right' }}>
              <button style={{ color: '#ef4444', background: 'none', border: 'none', fontSize: '12px', fontWeight: '600' }} onClick={() => handleDeleteCoupon(coupon._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '420px', backgroundColor: '#fff' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Create New Promo Code</h4>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600' }}>Coupon Code</label>
              <input type="text" placeholder="e.g. PAKKAM100" value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })} />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600' }}>Description</label>
              <input type="text" placeholder="e.g. Flat ₹100 OFF on orders above ₹500" value={newCoupon.description} onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600' }}>Discount Type</label>
                <select value={newCoupon.discountType} onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}>
                  <option value="FLAT">Flat ₹</option>
                  <option value="PERCENTAGE">Percentage %</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600' }}>Discount Value</label>
                <input type="number" value={newCoupon.discountValue} onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600' }}>Min Order (₹)</label>
                <input type="number" value={newCoupon.minimumOrder} onChange={(e) => setNewCoupon({ ...newCoupon, minimumOrder: Number(e.target.value) })} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600' }}>Expiry Date</label>
                <input type="date" value={newCoupon.expiryDate} onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreateCoupon}>Create Coupon</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
