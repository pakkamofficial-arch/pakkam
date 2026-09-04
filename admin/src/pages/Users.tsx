import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users as UsersIcon, Shield, Phone, Mail } from 'lucide-react';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (userId: string) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle`);
      if (res.data.success) {
        fetchUsers();
      }
    } catch (err) {
      alert('Failed to toggle user status');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Registered Users & Accounts</h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Manage Customer, Seller, Delivery & Admin accounts</p>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '24px' }}>Loading users...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td style={{ fontWeight: '600' }}>{u.name}</td>
                  <td>{u.phone}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-red' : u.role === 'SELLER' ? 'badge-yellow' : u.role === 'DELIVERY' ? 'badge-blue' : 'badge-green'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {u.role !== 'ADMIN' && (
                      <button
                        className="btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => handleToggle(u._id)}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
