import React, { useEffect, useState } from 'react';
import { MapPin, Plus, Edit2, Trash2 } from 'lucide-react';
import client from '../services/api';

export const DeliveryZones: React.FC = () => {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [city, setCity] = useState('Chennai');
  const [pincodes, setPincodes] = useState('600040, 600101');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const res = await client.get('/delivery-zones/admin');
      if (res.data.success) {
        setZones(res.data.zones || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setName('');
    setCity('Chennai');
    setPincodes('600040, 600101');
    setActive(true);
    setShowModal(true);
  };

  const handleOpenEdit = (zone: any) => {
    setEditId(zone._id);
    setName(zone.name || '');
    setCity(zone.city || 'Chennai');
    setPincodes(zone.pincodes ? zone.pincodes.join(', ') : '');
    setActive(zone.active !== undefined ? zone.active : true);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !pincodes) {
      alert('Zone Name and Pincodes are required');
      return;
    }

    try {
      setSaving(true);
      const pinsArray = pincodes.split(',').map((p) => p.trim()).filter((p) => p.length > 0);

      const payload = {
        name,
        city,
        pincodes: pinsArray,
        active,
      };

      if (editId) {
        await client.put(`/delivery-zones/admin/${editId}`, payload);
        alert('Delivery Zone updated successfully!');
      } else {
        await client.post('/delivery-zones/admin', payload);
        alert('Delivery Zone created successfully!');
      }

      setShowModal(false);
      fetchZones();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving delivery zone');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this delivery zone?')) return;
    try {
      await client.delete(`/delivery-zones/admin/${id}`);
      fetchZones();
    } catch (err) {
      alert('Failed to delete delivery zone');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            📍 Delivery Zones & Serviceability
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Configure serviceable city areas and supported pincodes for PAKKAM delivery
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          style={{
            backgroundColor: '#16a34a',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Plus size={18} /> Add Delivery Zone
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading delivery zones...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {zones.map((zone) => (
            <div
              key={zone._id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                    {zone.name}
                  </h3>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '800',
                      backgroundColor: zone.active ? '#dcfce7' : '#fee2e2',
                      color: zone.active ? '#15803d' : '#b91c1c',
                    }}
                  >
                    {zone.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 12px 0' }}>City: {zone.city}</p>

                <div style={{ fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Supported PIN Codes ({zone.pincodes?.length || 0}):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {zone.pincodes?.map((pin: string) => (
                    <span
                      key={pin}
                      style={{
                        backgroundColor: '#f1f5f9',
                        color: '#0f172a',
                        border: '1px solid #cbd5e1',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                      }}
                    >
                      {pin}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <button
                  onClick={() => handleOpenEdit(zone)}
                  style={{
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#fff',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                  }}
                >
                  Edit Zone
                </button>
                <button
                  onClick={() => handleDelete(zone._id)}
                  style={{
                    border: '1px solid #fee2e2',
                    backgroundColor: '#fff',
                    color: '#dc2626',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
          }}
        >
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '420px' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>
              {editId ? 'Edit Delivery Zone' : 'Add New Delivery Zone'}
            </h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                  Zone Name (e.g. Anna Nagar) *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                  City *
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                  Service PIN Codes (comma separated) *
                </label>
                <input
                  type="text"
                  value={pincodes}
                  onChange={(e) => setPincodes(e.target.value)}
                  placeholder="e.g. 600040, 600101, 600020"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#16a34a',
                    color: '#fff',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  {saving ? 'Saving...' : 'Save Zone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
