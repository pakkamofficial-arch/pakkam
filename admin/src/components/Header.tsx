import React, { useEffect, useState } from 'react';
import { Bell, ShieldCheck, CheckCheck, ShoppingCart } from 'lucide-react';
import client from '../services/api';

interface HeaderProps {
  title: string;
  user: any;
}

export const Header: React.FC<HeaderProps> = ({ title, user }) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await client.get('/admin/notifications');
      if (res.data.success) {
        setUnreadCount(res.data.unreadCount || 0);
        setNotifications(res.data.notifications || []);
      }
    } catch (e) {
      console.error('Error fetching admin notifications:', e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await client.put('/admin/notifications/read-all');
      setUnreadCount(0);
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = async (notif: any) => {
    try {
      if (!notif.isRead) {
        await client.put(`/admin/notifications/${notif._id}/read`);
      }
      setShowDropdown(false);
      fetchNotifications();
      window.location.href = '/orders';
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header
      style={{
        marginLeft: '260px',
        height: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 90,
      }}
    >
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>{title}</h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#f0fdf4',
            color: '#15803d',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            border: '1px solid #bbf7d0',
          }}
        >
          <ShieldCheck size={16} />
          <span>System Live</span>
        </div>

        {/* Bell Button with Unread Badge (Part 18) */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            background: '#f1f5f9',
            padding: '8px',
            borderRadius: '50%',
            color: '#475569',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: '#dc2626',
                color: '#fff',
                borderRadius: '10px',
                fontSize: '10px',
                fontWeight: '800',
                padding: '2px 6px',
                border: '2px solid #fff',
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notification Dropdown Menu (Part 18) */}
        {showDropdown && (
          <div
            style={{
              position: 'absolute',
              top: '50px',
              right: 0,
              width: '340px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              zIndex: 100,
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                Notifications ({unreadCount} unread)
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  style={{
                    fontSize: '11px',
                    color: '#16a34a',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <CheckCheck size={14} /> Mark all as read
                </button>
              )}
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                  No new notifications
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => handleNotificationClick(item)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: item.isRead ? '#ffffff' : '#f0fdf4',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShoppingCart size={14} color="#16a34a" />
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>
                        {item.title}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#475569', margin: '4px 0 0 0' }}>
                      {item.message || item.body}
                    </p>
                    <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
