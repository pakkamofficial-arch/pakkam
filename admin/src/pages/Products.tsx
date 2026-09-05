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
      const pPrice = Number(editingProduct.purchasePrice || 0);
      const aCost = Number(editingProduct.additionalCost || 0);
      const mrpNum = Number(editingProduct.MRP ?? editingProduct.marketPrice ?? 0);
      const discPercent = Number(editingProduct.discountPercent || 0);
      const targetMargin = Number(editingProduct.targetProfitMargin ?? 0.20);
      const availQty = Number(editingProduct.availableQuantity ?? 100);

      const res = await api.put(`/products/${editingProduct._id}`, {
        name: editingProduct.name_en || editingProduct.name,
        name_en: editingProduct.name_en || editingProduct.name,
        name_ta: editingProduct.name_ta || '',
        purchasePrice: pPrice,
        additionalCost: aCost,
        MRP: mrpNum,
        marketPrice: mrpNum,
        discountPercent: discPercent,
        targetProfitMargin: targetMargin,
        availableQuantity: availQty,
      });

      if (res.data.success) {
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
                <th>MRP Ceiling</th>
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
                  <td style={{ color: '#64748b', fontWeight: '600' }}>₹{prod.MRP || prod.marketPrice || prod.sellingPrice || prod.price}</td>
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

      {/* Edit Modal with Source Inputs & Live Calculated Profit Indicators */}
      {editingProduct && (() => {
        const pCost = Number(editingProduct.purchasePrice || 0);
        const aCost = Number(editingProduct.additionalCost || 0);
        const landedCost = pCost + aCost;
        const mrp = Number(editingProduct.MRP ?? editingProduct.marketPrice ?? 0);
        const discPercent = Number(editingProduct.discountPercent || 0);
        const discAmount = (mrp * discPercent) / 100;
        const finalPrice = Math.min(mrp > 0 ? mrp : Infinity, Math.max(0, mrp - discAmount));
        const profitAmount = finalPrice - landedCost;
        const profitMargin = finalPrice > 0 ? (profitAmount / finalPrice) * 100 : 0;
        const targetMargin = Number(editingProduct.targetProfitMargin ?? 0.20);
        const reqTargetPrice = (1 - targetMargin) > 0 ? landedCost / (1 - targetMargin) : landedCost;

        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card" style={{ width: '520px', backgroundColor: '#fff', maxHeight: '90vh', overflowY: 'auto' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Edit Product Pricing & Stock: {editingProduct.name}</h4>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>English Name</label>
                  <input
                    type="text"
                    value={editingProduct.name_en || editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name_en: e.target.value, name: e.target.value })}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#16a34a' }}>Tamil Name (தமிழ்)</label>
                  <input
                    type="text"
                    value={editingProduct.name_ta || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name_ta: e.target.value })}
                  />
                </div>
              </div>

              {/* INPUT FIELDS SECTION */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>Source Input Values</div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>Purchase Cost (₹)</label>
                    <input
                      type="number"
                      value={editingProduct.purchasePrice ?? 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, purchasePrice: e.target.value })}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>Additional Cost (₹)</label>
                    <input
                      type="number"
                      value={editingProduct.additionalCost ?? 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, additionalCost: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>MRP Ceiling (₹)</label>
                    <input
                      type="number"
                      value={editingProduct.MRP ?? editingProduct.marketPrice ?? 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, MRP: e.target.value, marketPrice: e.target.value })}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>Discount (%)</label>
                    <input
                      type="number"
                      value={editingProduct.discountPercent ?? 0}
                      onChange={(e) => setEditingProduct({ ...editingProduct, discountPercent: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>Target Margin (0.20 = 20%)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={editingProduct.targetProfitMargin ?? 0.20}
                      onChange={(e) => setEditingProduct({ ...editingProduct, targetProfitMargin: e.target.value })}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b' }}>Stock Qty ({editingProduct.unitType || 'kg'})</label>
                    <input
                      type="number"
                      value={editingProduct.availableQuantity ?? 100}
                      onChange={(e) => setEditingProduct({ ...editingProduct, availableQuantity: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* CALCULATED PREVIEW SECTION */}
              <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#166534', marginBottom: '8px' }}>Calculated Live Summary</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  <div>Landed Cost: <strong>₹{landedCost}</strong></div>
                  <div>Final Customer Price: <strong style={{ color: '#16a34a' }}>₹{finalPrice.toFixed(2)}</strong></div>
                  <div>Discount Amount: <strong>₹{discAmount.toFixed(2)}</strong></div>
                  <div>Profit Amount: <strong>₹{profitAmount.toFixed(2)}</strong></div>
                  <div>Achieved Profit Margin: <strong>{profitMargin.toFixed(1)}%</strong></div>
                  <div>Target Price Req: <strong>₹{reqTargetPrice.toFixed(2)}</strong></div>
                </div>
                {reqTargetPrice > mrp && mrp > 0 && (
                  <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '6px', fontWeight: '600' }}>
                    ⚠️ Note: Required price (₹{reqTargetPrice.toFixed(2)}) exceeds MRP ceiling (₹{mrp}). Customer price is capped at MRP.
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button className="btn-secondary" onClick={() => setEditingProduct(null)}>Cancel</button>
                <button className="btn-primary" onClick={handleUpdateProduct}>Save Changes</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
