import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Store, ShoppingBag, Users, IndianRupee, TrendingUp, Clock } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentOrders(res.data.recentOrders || []);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading Dashboard...</div>;
  }

  const statCards = [
    { title: 'Total Revenue', value: `₹${stats?.totalRevenue || 0}`, icon: IndianRupee, color: '#16a34a', bg: '#f0fdf4' },
    { title: 'Total Orders', value: stats?.totalOrders || 0, icon: TrendingUp, color: '#2563eb', bg: '#eff6ff' },
    { title: 'Active Shops', value: `${stats?.activeShops || 0} / ${stats?.totalShops || 0}`, icon: Store, color: '#d97706', bg: '#fefce8' },
    { title: 'Total Products', value: stats?.totalProducts || 0, icon: ShoppingBag, color: '#9333ea', bg: '#faf5ff' },
    { title: 'Registered Users', value: stats?.totalUsers || 0, icon: Users, color: '#0d9488', bg: '#f0fdfa' },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px' }}>
      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={24} />
              </div>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>{card.title}</div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>{card.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Recent Orders</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Live incoming orders from PAKKAM app customers</p>
          </div>
          <button className="btn-secondary" onClick={fetchStats}>Refresh</button>
        </div>

        {recentOrders.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No orders placed yet. Place an order from the mobile app to see it live!</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Shop</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order: any) => (
                <tr key={order._id}>
                  <td style={{ fontWeight: '600' }}>{order.orderNumber}</td>
                  <td>{order.user?.name || 'Customer'}</td>
                  <td>{order.shop?.name || 'Local Shop'}</td>
                  <td style={{ fontWeight: '600', color: '#16a34a' }}>₹{order.total}</td>
                  <td>
                    <span className="badge badge-blue">{order.paymentMethod}</span>
                  </td>
                  <td>
                    <span className={`badge ${order.orderStatus === 'DELIVERED' ? 'badge-green' : order.orderStatus === 'CANCELED' ? 'badge-red' : 'badge-yellow'}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '13px' }}>
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
