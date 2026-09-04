import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Shops } from './pages/Shops';
import { Products } from './pages/Products';
import { Categories } from './pages/Categories';
import { Orders } from './pages/Orders';
import { Users } from './pages/Users';
import { Coupons } from './pages/Coupons';
import { Settings } from './pages/Settings';
import { DeliveryBoys } from './pages/DeliveryBoys';
import { DeliveryApplications } from './pages/DeliveryApplications';
import { DeliveryZones } from './pages/DeliveryZones';
import { Login } from './pages/Login';
import api from './services/api';

export const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success && res.data.role === 'ADMIN') {
          setUser(res.data.user || res.data);
        } else {
          localStorage.removeItem('admin_token');
        }
      } catch (err) {
        localStorage.removeItem('admin_token');
      }
    }
    setLoading(false);
  };

  const handleLoginSuccess = (userData: any, token: string) => {
    localStorage.setItem('admin_token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setUser(null);
  };

  if (loading) return null;

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar user={user} onLogout={handleLogout} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Header title="PAKKAM Hyperlocal E-commerce Admin" user={user} />
          <main style={{ marginLeft: '260px', flex: 1, backgroundColor: '#f8fafc' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/delivery-boys" element={<DeliveryBoys />} />
              <Route path="/delivery-applications" element={<DeliveryApplications />} />
              <Route path="/delivery-zones" element={<DeliveryZones />} />
              <Route path="/shops" element={<Shops />} />
              <Route path="/products" element={<Products />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/users" element={<Users />} />
              <Route path="/coupons" element={<Coupons />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
