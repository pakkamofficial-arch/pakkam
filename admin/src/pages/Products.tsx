import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Search, Edit3, Trash2, Tag, CheckCircle2, AlertCircle } from 'lucide-react';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products?search=${encodeURIComponent(search)}&limit=100`);
      if (res.data.success) {
        setProducts(res.data.products || []);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStock = async (product: any) => {
    try {
      const newStatus = product.stockStatus === 'IN_STOCK' ? 'OUT_OF_STOCK' : 'IN_STOCK';
      const res = await api.put(`/products/${product._id}`, { stockStatus: newStatus });
      if (res.data.success) {
        fetchProducts();
      }
    } catch (err) {
      alert('Failed to update stock status');
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    try {
      const sellingPriceNum = Number(editingProduct.sellingPrice || editingProduct.price);
      const res = await api.patch(`/products/${editingProduct._id}/price`, {
        sellingPrice: sellingPriceNum,
        marketPrice: editingProduct.marketPrice ? Number(editingProduct.marketPrice) : sellingPriceNum,
        source: editingProduct.priceSource || 'Admin Updated',
        reason: 'Admin price management',
      });
      if (res.data.success) {
        // Update basic details too
        await api.put(`/products/${editingProduct._id}`, {
          name: editingProduct.name_en || editingProduct.name,
          name_en: editingProduct.name_en || editingProduct.name,
          name_ta: editingProduct.name_ta || '',
          availableQuantity: Number(editingProduct.availableQuantity || 1000),
          stockStatus: Number(editingProduct.availableQuantity || 1000) > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
        });
        setEditingProduct(null);
        fetchProducts();
      }
    } catch (err) {
      alert('Failed to update product details');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Products Inventory</h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Manage grocery items, bilingual names (English + Tamil), pricing & stock</p>
        </div>

        <div style={{ width: '300px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '24px' }}>Loading products...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Tamil Name (தமிழ்)</th>
                <th>Category</th>
                <th>Market Price</th>
                <th>Pakkam Selling Price</th>
                <th>Unit</th>
                <th>Stock Qty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={prod.images[0]} alt={prod.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{prod.name_en || prod.name}</div>
                        {prod.isFreshToday && <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>Fresh Today</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: '600', color: '#16a34a' }}>{prod.name_ta || '-'}</td>
                  <td>{prod.category?.name || 'Category'}</td>
                  <td style={{ color: '#64748b', fontWeight: '600' }}>₹{prod.marketPrice || prod.sellingPrice || prod.price}</td>
                  <td style={{ color: '#16a34a', fontWeight: '700' }}>₹{prod.sellingPrice || prod.price}</td>
                  <td>
                    <span className="badge badge-blue">{prod.unit}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: '700', color: (prod.availableQuantity ?? 100) <= 25 ? '#d97706' : '#0f172a' }}>
                      {prod.availableQuantity ?? 100} {prod.unitType || 'kg'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                      onClick={() => setEditingProduct(prod)}
                    >
                      Edit Price & Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal with Market Price, Selling Price & Stock Fields */}
      {editingProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '460px', backgroundColor: '#fff' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Edit Price & Stock: {editingProduct.name}</h4>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>English Name</label>
              <input
                type="text"
                value={editingProduct.name_en || editingProduct.name || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, name_en: e.target.value, name: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#16a34a' }}>Tamil Name (தமிழ் Name)</label>
              <input
                type="text"
                placeholder="e.g. தக்காளி, வெங்காயம்"
                value={editingProduct.name_ta || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, name_ta: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Market Ref Price (₹)</label>
                <input
                  type="number"
                  value={editingProduct.marketPrice ?? editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, marketPrice: e.target.value })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#16a34a' }}>Pakkam Selling Price (₹)</label>
                <input
                  type="number"
                  value={editingProduct.sellingPrice ?? editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, sellingPrice: e.target.value, price: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Available Stock Quantity ({editingProduct.unitType || 'kg'})</label>
              <input
                type="number"
                value={editingProduct.availableQuantity ?? 1000}
                onChange={(e) => setEditingProduct({ ...editingProduct, availableQuantity: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn-secondary" onClick={() => setEditingProduct(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleUpdateProduct}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
