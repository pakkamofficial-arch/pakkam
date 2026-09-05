import React, { useEffect, useState } from 'react';
import { Truck, Package, Clock, CheckCircle2, DollarSign, MapPin, Phone, LogOut, Check, ArrowRight, AlertTriangle, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface DashboardProps {
  partner: any;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ partner, onLogout }) => {
  const [tab, setTab] = useState<'available' | 'mine' | 'earnings'>('mine');
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');

  const [issueOrder, setIssueOrder] = useState<any>(null);
  const [issueReason, setIssueReason] = useState('Customer unavailable');
  const [issueNotes, setIssueNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000); // 8s polling
    return () => clearInterval(interval);
  }, [tab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (tab === 'available') {
        const res = await api.get('/orders/available');
        if (res.data.success) setAvailableOrders(res.data.orders || []);
      } else if (tab === 'mine') {
        const res = await api.get('/orders/mine');
        if (res.data.success) setMyDeliveries(res.data.orders || []);
      } else if (tab === 'earnings') {
        const res = await api.get('/earnings');
        if (res.data.success) setEarnings(res.data.stats || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const res = await api.post(`/orders/${orderId}/accept`);
      if (res.data.success) {
        alert('Order accepted! Moved to My Deliveries.');
        setTab('mine');
        fetchData();
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to accept order');
    }
  };

  const handlePickedUp = async (orderId: string) => {
    try {
      const res = await api.post(`/orders/${orderId}/picked-up`);
      if (res.data.success) {
        alert('Order marked Picked Up & Out for Delivery!');
        fetchData();
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCompleteDelivered = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    if (!otpInput.trim() || otpInput.trim().length !== 4) {
      setOtpError('Please enter the valid 4-digit Delivery OTP provided by customer.');
      return;
    }

    try {
      setSubmitting(true);
      setOtpError('');
      const res = await api.post(`/orders/${selectedOrder._id}/delivered`, { otp: otpInput.trim() });
      if (res.data.success) {
        alert('🎉 DELIVERY COMPLETED! Order marked as Delivered.');
        setSelectedOrder(null);
        setOtpInput('');
        fetchData();
      }
    } catch (err: any) {
      setOtpError(err.response?.data?.message || 'Failed to complete delivery.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueOrder) return;

    try {
      setSubmitting(true);
      const res = await api.post(`/orders/${issueOrder._id}/issue`, {
        reason: issueReason,
        notes: issueNotes,
      });

      if (res.data.success) {
        alert('⚠️ Issue reported to Admin. Admin has been notified for order reassignment.');
        setIssueOrder(null);
        setIssueNotes('');
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit delivery issue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '40px' }}>
      {/* Header Bar */}
      <header
        style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 90,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Truck size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>PAKKAM Delivery Partner</h1>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
              Partner: {partner?.name || 'Rider'} ({partner?.vehicleType || 'BIKE'})
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          title="Logout"
          style={{
            backgroundColor: '#334155',
            color: '#f8fafc',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <LogOut size={14} />
          Logout
        </button>
      </header>

      {/* Navigation Tabs */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '8px 12px',
        }}
      >
        <button
          onClick={() => setTab('mine')}
          style={{
            flex: 1,
            padding: '10px',
            border: 'none',
            backgroundColor: tab === 'mine' ? '#f0fdf4' : 'transparent',
            color: tab === 'mine' ? '#16a34a' : '#64748b',
            fontWeight: '700',
            fontSize: '13px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Assigned Orders ({myDeliveries.filter((o) => o.orderStatus !== 'DELIVERED').length})
        </button>

        <button
          onClick={() => setTab('available')}
          style={{
            flex: 1,
            padding: '10px',
            border: 'none',
            backgroundColor: tab === 'available' ? '#f0fdf4' : 'transparent',
            color: tab === 'available' ? '#16a34a' : '#64748b',
            fontWeight: '700',
            fontSize: '13px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Ready Pickups ({availableOrders.length})
        </button>

        <button
          onClick={() => setTab('earnings')}
          style={{
            flex: 1,
            padding: '10px',
            border: 'none',
            backgroundColor: tab === 'earnings' ? '#f0fdf4' : 'transparent',
            color: tab === 'earnings' ? '#16a34a' : '#64748b',
            fontWeight: '700',
            fontSize: '13px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Earnings 💰
        </button>
      </div>

      {/* Tab Content */}
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
        {/* My Assigned Deliveries Tab (Requirement 29, 30, 36, 37, 38, 39, 40) */}
        {tab === 'mine' && (
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
              My Assigned Deliveries
            </h2>

            {myDeliveries.length === 0 ? (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '30px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                }}
              >
                <Truck size={36} color="#94a3b8" style={{ marginBottom: '8px' }} />
                <p style={{ fontSize: '14px', fontWeight: '600' }}>No active deliveries assigned right now.</p>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>Admin will assign orders matching your service PIN codes.</p>
              </div>
            ) : (
              myDeliveries.map((order) => {
                const isDelivered = order.orderStatus === 'DELIVERED';
                const pin = order.deliveryAddress?.pincode || order.pincode || '625001';
                const city = order.deliveryAddress?.city || 'Madurai';
                const state = order.deliveryAddress?.state || 'Tamil Nadu';

                return (
                  <div
                    key={order._id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '14px',
                      padding: '16px',
                      marginBottom: '14px',
                      border: isDelivered ? '1px solid #e2e8f0' : '2px solid #16a34a',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '800', color: '#16a34a' }}>
                        ORDER #{order.orderNumber}
                      </span>
                      <span
                        style={{
                          backgroundColor: isDelivered ? '#e2e8f0' : '#dcfce7',
                          color: isDelivered ? '#475569' : '#15803d',
                          fontSize: '11px',
                          fontWeight: '800',
                          padding: '4px 10px',
                          borderRadius: '6px',
                        }}
                      >
                        {order.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Customer Delivery Snapshot (Requirement 36) */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                        📍 Customer: {order.deliveryAddress?.name || order.user?.name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: '700', marginTop: '2px' }}>
                        📞 Mobile: {order.deliveryAddress?.phone || order.user?.phone}
                      </div>
                      <div style={{ fontSize: '13px', color: '#334155', marginTop: '6px' }}>
                        {order.deliveryAddress?.houseFlat} {order.deliveryAddress?.street} {order.deliveryAddress?.addressLine}
                      </div>
                      {order.deliveryAddress?.landmark ? (
                        <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginTop: '2px' }}>
                          Landmark: {order.deliveryAddress.landmark}
                        </div>
                      ) : null}
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
                        PIN Code: <span style={{ color: '#16a34a' }}>{pin}</span> ({city}, {state})
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '8px 12px', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                        Payment: <strong>{order.paymentMethod}</strong> ({order.paymentStatus})
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: '800', color: '#16a34a' }}>
                        ₹{order.total}
                      </span>
                    </div>

                    {/* Order Status Action Buttons (Requirement 38, 39, 40, 42) */}
                    {!isDelivered && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {order.orderStatus === 'DELIVERY_ASSIGNED' && (
                          <button
                            onClick={() => handleAcceptOrder(order._id)}
                            style={{
                              backgroundColor: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              padding: '12px',
                              borderRadius: '8px',
                              fontWeight: '700',
                              fontSize: '14px',
                              cursor: 'pointer',
                            }}
                          >
                            ACCEPT ASSIGNMENT ✅
                          </button>
                        )}

                        {(order.orderStatus === 'DELIVERY_ACCEPTED' || order.orderStatus === 'READY_FOR_PICKUP') && (
                          <button
                            onClick={() => handlePickedUp(order._id)}
                            style={{
                              backgroundColor: '#2563eb',
                              color: '#ffffff',
                              border: 'none',
                              padding: '12px',
                              borderRadius: '8px',
                              fontWeight: '700',
                              fontSize: '14px',
                              cursor: 'pointer',
                            }}
                          >
                            START DELIVERY (Out for Delivery) 🛵
                          </button>
                        )}

                        {order.orderStatus === 'OUT_FOR_DELIVERY' && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setOtpInput('');
                              setOtpError('');
                            }}
                            style={{
                              backgroundColor: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              padding: '12px',
                              borderRadius: '8px',
                              fontWeight: '700',
                              fontSize: '14px',
                              cursor: 'pointer',
                            }}
                          >
                            MARK DELIVERY COMPLETED 🎉
                          </button>
                        )}

                        {/* Report Issue Button (Requirement 42) */}
                        <button
                          onClick={() => {
                            setIssueOrder(order);
                            setIssueReason('Customer unavailable');
                            setIssueNotes('');
                          }}
                          style={{
                            backgroundColor: '#fff',
                            color: '#dc2626',
                            border: '1px solid #fee2e2',
                            padding: '8px',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          <AlertTriangle size={14} /> Report Delivery Issue / Cannot Deliver
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Available Orders Tab */}
        {tab === 'available' && (
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>
              Orders Available in Your Service PIN Codes
            </h2>

            {availableOrders.length === 0 ? (
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '30px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                }}
              >
                <Package size={36} color="#94a3b8" style={{ marginBottom: '8px' }} />
                <p style={{ fontSize: '14px', fontWeight: '600' }}>No available unassigned orders right now.</p>
              </div>
            ) : (
              availableOrders.map((order) => (
                <div
                  key={order._id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '12px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                      #{order.orderNumber}
                    </span>
                    <span style={{ backgroundColor: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px' }}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#334155', marginBottom: '12px' }}>
                    <strong>Delivery PIN:</strong> {order.deliveryAddress?.pincode || order.pincode} ({order.deliveryAddress?.city})
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: '#16a34a' }}>
                      ₹{order.total} • {order.paymentMethod}
                    </span>
                    <button
                      onClick={() => handleAcceptOrder(order._id)}
                      style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                    >
                      Accept Order ➔
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Earnings Tab */}
        {tab === 'earnings' && (
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>
              My Earnings Summary 💰
            </h2>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div style={{ backgroundColor: '#f0fdf4', padding: '14px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                  <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '600' }}>Today's Earnings</span>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>
                    ₹{earnings?.todayEarnings || 0}
                  </div>
                </div>
                <div style={{ backgroundColor: '#eff6ff', padding: '14px', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                  <span style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: '600' }}>Completed Deliveries</span>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#2563eb', marginTop: '4px' }}>
                    {earnings?.totalDeliveries || 0}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
                • <strong>Payout Per Delivery:</strong> ₹{earnings?.perDeliveryPayout || 40}<br />
                • <strong>Rider Rating:</strong> ⭐ {earnings?.rating || 5.0} / 5.0
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Delivery Completion Confirmation Modal (Requirement 40, 41) */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 200 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '380px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
              Confirm Delivery Completion
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Confirm that Order #{selectedOrder.orderNumber} has been delivered to {selectedOrder.deliveryAddress?.name} at PIN {selectedOrder.deliveryAddress?.pincode}.
            </p>

            <form onSubmit={handleCompleteDelivered}>
              {selectedOrder.deliveryOtp && (
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', textAlign: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '700' }}>Customer Delivery OTP: </span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: '#16a34a', letterSpacing: '4px' }}>
                    {typeof selectedOrder.deliveryOtp === 'object' ? selectedOrder.deliveryOtp.code || '----' : String(selectedOrder.deliveryOtp)}
                  </span>
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Enter 4-Digit Customer Delivery OTP *
                </label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. 4827"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '20px',
                    fontWeight: '800',
                    letterSpacing: '6px',
                    textAlign: 'center',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    color: '#0f172a',
                  }}
                />
                {otpError ? (
                  <div style={{ marginTop: '8px', padding: '8px 12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', fontSize: '12px', fontWeight: '600' }}>
                    ⚠️ {otpError}
                  </div>
                ) : null}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrder(null);
                    setOtpInput('');
                    setOtpError('');
                  }}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#16a34a', color: '#ffffff', fontWeight: '700', cursor: 'pointer' }}
                >
                  {submitting ? 'Verifying...' : 'VERIFY & DELIVER'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delivery Issue Reporting Modal (Requirement 42) */}
      {issueOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 200 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px', border: '1px solid #fee2e2' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#b91c1c', marginBottom: '6px' }}>
              Report Delivery Issue
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Report why Order #{issueOrder.orderNumber} cannot be delivered right now. Admin will be notified for reassignment.
            </p>

            <form onSubmit={handleReportIssueSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Issue Reason *</label>
                <select
                  value={issueReason}
                  onChange={(e) => setIssueReason(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="Customer unavailable">Customer unavailable</option>
                  <option value="Wrong address">Wrong address</option>
                  <option value="PIN code mismatch">PIN code mismatch</option>
                  <option value="Vehicle issue">Vehicle issue / breakdown</option>
                  <option value="Other">Other reason</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Additional Details</label>
                <textarea
                  value={issueNotes}
                  onChange={(e) => setIssueNotes(e.target.value)}
                  placeholder="Explain why delivery failed..."
                  style={{ width: '100%', height: '60px', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIssueOrder(null)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', color: '#ffffff', fontWeight: '700', cursor: 'pointer' }}
                >
                  Submit Issue to Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
