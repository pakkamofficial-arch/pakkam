import React, { useState } from 'react';
import api from '../services/api';

interface LoginProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [emailOrPhone, setEmailOrPhone] = useState('admin@pakkam.test');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/auth/login', { emailOrPhone, password });
      if (res.data.success) {
        if (res.data.user.role !== 'ADMIN') {
          setError('Access denied: Admin role required');
          return;
        }
        onLoginSuccess(res.data.user, res.data.token);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
      <div className="card" style={{ width: '400px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px' }}>🥬</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#15803d', margin: '8px 0 4px 0' }}>PAKKAM Admin</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Your Nearby Everything - Control Panel</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', display: 'block', marginBottom: '4px' }}>Email or Mobile</label>
            <input type="text" value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)} required />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', display: 'block', marginBottom: '4px' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Admin'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
          Demo Admin: <strong>admin@pakkam.test</strong> / <strong>Password123!</strong>
        </div>
      </div>
    </div>
  );
};
