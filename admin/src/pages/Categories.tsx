import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Grid, Plus } from 'lucide-react';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '24px' }}>Loading Categories...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Categories Management</h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>14 Indian grocery and fresh produce categories</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {categories.map((cat) => (
          <div key={cat._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '32px', width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {cat.icon}
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{cat.name}</h4>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Order #{cat.order}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
