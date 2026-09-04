import React, { useEffect, useState } from 'react';
import { Truck, Plus, Edit2, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import client from '../services/api';

export const DeliveryBoys: React.FC = () => {
  const [deliveryBoys, setDeliveryBoys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [vehicleType, setVehicleType] = useState('BIKE');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [servicePincodes, setServicePincodes] = useState('600040, 600101, 600020');
  const [maxActiveOrders, setMaxActiveOrders] = useState(5);
  const [status, setStatus] = useState('AVAILABLE');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDeliveryBoys();
  }, []);

  const fetchDeliveryBoys = async () => {
    try {
      setLoading(true);
      const res = await client.get('/delivery-boys/admin');
      if (res.data.success) {
        setDeliveryBoys(res.data.deliveryBoys || []);
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
    setMobile('');
    setEmail('');
    setVehicleType('BIKE');
    setVehicleNumber('');
    setServicePincodes('600040, 600101, 600020');
    setMaxActiveOrders(5);
    setStatus('AVAILABLE');
    setShowModal(true);
  };

  const handleOpenEdit = (boy: any) => {
    setEditId(boy._id);
    setName(boy.name || '');
    setMobile(boy.mobile || '');
    setEmail(boy.email || '');
    setVehicleType(boy.vehicleType || 'BIKE');
    setVehicleNumber(boy.vehicleNumber || '');
    setServicePincodes(boy.servicePincodes ? boy.servicePincodes.join(', ') : '');
    setMaxActiveOrders(boy.maxActiveOrders || 5);
    setStatus(boy.status || 'AVAILABLE');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) {
      alert('Name and Mobile number are required');
      return;
    }

    try {
      setSaving(true);
      const pinsArray = servicePincodes.split(',').map((p) => p.trim()).filter((p) => p.length > 0);

      const payload = {
        name,
        mobile,
        email,
        vehicleType,
        vehicleNumber,
        servicePincodes: pinsArray,
        maxActiveOrders: Number(maxActiveOrders),
        status,
      };

      if (editId) {
        await client.put(`/delivery-boys/admin/${editId}`, payload);
        alert('Delivery partner updated successfully!');
      } else {
        await client.post('/delivery-boys/admin', payload);
        alert('Delivery partner created successfully!');
      }

      setShowModal(false);
      fetchDeliveryBoys();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving delivery partner');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (boy: any, newStatus: string) => {
    try {
      await client.put(`/delivery-boys/admin/${boy._id}`, { status: newStatus });
      fetchDeliveryBoys();
    } catch (err: any) {
      alert('Failed to update status');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            🛵 Delivery Partners Management
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Manage delivery boys, active order capacities, and service pincodes
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
          <Plus size={18} /> Add Delivery Partner
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading delivery partners...</div>
      ) : (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '14px 16px' }}>Delivery Boy</th>
                <th style={{ padding: '14px 16px' }}>Vehicle</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 16px' }}>Service PIN Codes</th>
                <th style={{ padding: '14px 16px' }}>Active Workload</th>
                <th style={{ padding: '14px 16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliveryBoys.map((boy) => {
                const isAvailable = boy.status === 'AVAILABLE';
                const isSuspended = boy.status === 'SUSPENDED';

                return (
                  <tr key={boy._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{boy.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>📞 {boy.mobile}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontWeight: '600' }}>{boy.vehicleType}</span>
                      {boy.vehicleNumber ? (
                        <span style={{ display: 'block', fontSize: '12px', color: '#64748b' }}>
                          {boy.vehicleNumber}
                        </span>
                      ) : null}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '700',
                          backgroundColor: isAvailable ? '#dcfce7' : isSuspended ? '#fee2e2' : '#fef3c7',
                          color: isAvailable ? '#15803d' : isSuspended ? '#b91c1c' : '#d97706',
                        }}
                      >
                        {boy.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {boy.servicePincodes?.map((pin: string) => (
                          <span
                            key={pin}
                            style={{
                              backgroundColor: '#f1f5f9',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '600',
                            }}
                          >
                            {pin}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: '700' }}>
                      {boy.currentActiveOrders || 0} / {boy.maxActiveOrders || 5} Orders
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenEdit(boy)}
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
                          Edit
                        </button>
                        {isAvailable ? (
                          <button
                            onClick={() => handleToggleStatus(boy, 'SUSPENDED')}
                            style={{
                              border: '1px solid #fee2e2',
                              backgroundColor: '#fff',
                              color: '#dc2626',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                            }}
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(boy, 'AVAILABLE')}
                            style={{
                              border: '1px solid #bbf7d0',
                              backgroundColor: '#fff',
                              color: '#16a34a',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                            }}
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '460px' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>
              {editId ? 'Edit Delivery Partner' : 'Add New Delivery Partner'}
            </h2>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                  Full Name *
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
                  Mobile Number *
                </label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
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
                  value={servicePincodes}
                  onChange={(e) => setServicePincodes(e.target.value)}
                  placeholder="e.g. 600040, 600101, 600032"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                    Vehicle Type
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="BIKE">BIKE</option>
                    <option value="SCOOTER">SCOOTER</option>
                    <option value="BICYCLE">BICYCLE</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                    Max Active Capacity
                  </label>
                  <input
                    type="number"
                    value={maxActiveOrders}
                    onChange={(e) => setMaxActiveOrders(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
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
                  {saving ? 'Saving...' : 'Save Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
