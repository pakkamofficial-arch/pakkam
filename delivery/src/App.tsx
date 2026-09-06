import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import api from './services/api';

export const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('pakkam_delivery_token'));
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('pakkam_delivery_token');
      if (savedToken) {
        try {
          const res = await api.get('/profile');
          if (res.data.success && res.data.partner) {
            setToken(savedToken);
            setPartner(res.data.partner);
          } else {
            localStorage.removeItem('pakkam_delivery_token');
            setToken(null);
            setPartner(null);
          }
        } catch (err) {
          localStorage.removeItem('pakkam_delivery_token');
          setToken(null);
          setPartner(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (newToken: string, partnerData: any) => {
    localStorage.setItem('pakkam_delivery_token', newToken);
    setToken(newToken);
    setPartner(partnerData);
  };

  const handleLogout = () => {
    localStorage.removeItem('pakkam_delivery_token');
    setToken(null);
    setPartner(null);
  };

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={!token ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" replace />}
        />
        <Route
          path="/"
          element={token ? <Dashboard partner={partner} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
