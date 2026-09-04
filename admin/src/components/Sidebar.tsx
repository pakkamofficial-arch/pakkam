import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingBag,
  Grid,
  ClipboardList,
  Ticket,
  Settings,
  LogOut,
  Truck,
  MapPin,
  FileText,
} from 'lucide-react';

interface SidebarProps {
  user: any;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await import('../services/api').then((m) => m.default.get('/admin/notifications'));
      if (res.data.success) {
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (e) {
      // ignore
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Orders Control', path: '/orders', icon: ClipboardList, badge: unreadCount },
    { name: 'Delivery Applications', path: '/delivery-applications', icon: FileText },
    { name: 'Active Partners', path: '/delivery-boys', icon: Truck },
    { name: 'Delivery Zones', path: '/delivery-zones', icon: MapPin },
    { name: 'Shops Management', path: '/shops', icon: Store },
    { name: 'Products Inventory', path: '/products', icon: ShoppingBag },
    { name: 'Categories', path: '/categories', icon: Grid },
    { name: 'Users & Customers', path: '/users', icon: Users },
    { name: 'Coupons & Promos', path: '/coupons', icon: Ticket },
    { name: 'App Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', height: '100vh', position: 'fixed', display: 'flex', flexDirection: 'column', zIndex: 100 }}>
      {/* Brand Header */}
      <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold' }}>
          🥬
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#15803d', margin: 0 }}>PAKKAM</h1>
          <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Your Nearby Everything</p>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '12px' }}>
          Admin Panel
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '4px',
                fontSize: '14px',
                fontWeight: isActive ? '600' : '500',
                backgroundColor: isActive ? '#f0fdf4' : 'transparent',
                color: isActive ? '#15803d' : '#475569',
                borderLeft: isActive ? '4px solid #16a34a' : '4px solid transparent',
              })}
            >
              <Icon size={18} />
              <span style={{ flex: 1 }}>{item.name}</span>
              {item.badge && item.badge > 0 ? (
                <span
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#fff',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '2px 8px',
                  }}
                >
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer */}
      <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{user?.name || 'Admin User'}</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>{user?.email || 'admin@pakkam.test'}</div>
        </div>
        <button onClick={onLogout} title="Logout" style={{ background: 'none', color: '#ef4444', padding: '6px', borderRadius: '6px' }}>
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};
