import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Settings as SettingsIcon, Save, Truck } from 'lucide-react';

export const Settings: React.FC = () => {
  const [tiers, setTiers] = useState({
    tier1Threshold: 299,
    tier1Fee: 30,
    tier2Threshold: 499,
    tier2Fee: 20,
    freeThreshold: 500,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/settings');
      if (res.data.success) {
        const found = res.data.settings?.find((s: any) => s.key === 'delivery_fee_tiers');
        if (found) {
          setTiers(found.value);
        }
      }
    } catch (err) {
      console.error('Failed to fetch settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await api.put('/admin/settings', {
        key: 'delivery_fee_tiers',
        value: tiers,
        description: 'Dynamic delivery fee tiers configuration',
      });
      if (res.data.success) {
        alert('Delivery fee settings saved successfully!');
      }
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '24px' }}>Loading Settings...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Configurable Delivery Fees</h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Configure dynamic delivery charges based on customer cart total</p>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f0fdf4', padding: '16px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <Truck size={24} color="#16a34a" />
          <div style={{ fontSize: '13px', color: '#15803d' }}>
            <strong>Active Rule:</strong> Orders under ₹{tiers.tier1Threshold} charge ₹{tiers.tier1Fee} delivery. Orders ₹{tiers.tier1Threshold}–₹{tiers.tier2Threshold} charge ₹{tiers.tier2Fee}. Orders ₹{tiers.freeThreshold}+ get <strong>FREE DELIVERY</strong>!
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Tier 1 Order Limit (Below ₹)</label>
            <input
              type="number"
              value={tiers.tier1Threshold}
              onChange={(e) => setTiers({ ...tiers, tier1Threshold: Number(e.target.value) })}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Tier 1 Delivery Charge (₹)</label>
            <input
              type="number"
              value={tiers.tier1Fee}
              onChange={(e) => setTiers({ ...tiers, tier1Fee: Number(e.target.value) })}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Tier 2 Max Threshold (₹)</label>
            <input
              type="number"
              value={tiers.tier2Threshold}
              onChange={(e) => setTiers({ ...tiers, tier2Threshold: Number(e.target.value) })}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Tier 2 Delivery Charge (₹)</label>
            <input
              type="number"
              value={tiers.tier2Fee}
              onChange={(e) => setTiers({ ...tiers, tier2Fee: Number(e.target.value) })}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Free Delivery Threshold (₹ and above)</label>
          <input
            type="number"
            value={tiers.freeThreshold}
            onChange={(e) => setTiers({ ...tiers, freeThreshold: Number(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );
};
