import React, { useEffect, useState } from 'react';
import client from '../services/api';
import { UserCheck, UserX, Search, RefreshCw, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';

export const DeliveryApplications: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [rejectingApp, setRejectingApp] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [issuedCreds, setIssuedCreds] = useState<any>(null);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      let url = '/delivery-applications';
      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }
      const res = await client.get(url);
      if (res.data.success) {
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (appId: string) => {
    try {
      setActionLoading(true);
      const res = await client.patch(`/delivery-applications/${appId}/accept`);
      if (res.data.success) {
        alert('✓ Delivery Partner Application ACCEPTED!');
        setIssuedCreds(res.data.partner?.temporaryCredentialsIssued || null);
        fetchApplications();
        if (selectedApp && selectedApp._id === appId) {
          setSelectedApp({ ...selectedApp, applicationStatus: 'accepted' });
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to accept application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingApp) return;

    try {
      setActionLoading(true);
      const res = await client.patch(`/delivery-applications/${rejectingApp._id}/reject`, {
        rejectionReason: rejectionReason || 'Application criteria not met',
      });
      if (res.data.success) {
        alert('Application REJECTED.');
        setRejectingApp(null);
        setRejectionReason('');
        fetchApplications();
        if (selectedApp && selectedApp._id === rejectingApp._id) {
          setSelectedApp({ ...selectedApp, applicationStatus: 'rejected', rejectionReason });
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject application');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.fullName?.toLowerCase().includes(q) ||
      app.mobileNumber?.includes(q) ||
      app.pincode?.includes(q) ||
      app.city?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            📝 Delivery Partner Applications (Google Form Sync)
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
            Review candidate applications submitted via Google Form / Recruitment portal and issue partner accounts
          </p>
        </div>
        <button
          onClick={fetchApplications}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '10px 16px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <RefreshCw size={16} /> Sync Applications
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search candidate name, mobile number, PIN code, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '14px',
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '14px',
            fontWeight: '600',
            backgroundColor: '#fff',
          }}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending Review</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Applications Table */}
      <div className="card" style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Loading applications...</div>
        ) : filteredApps.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>No delivery partner applications found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '14px 16px' }}>Applicant</th>
                <th style={{ padding: '14px 16px' }}>PIN Code & Location</th>
                <th style={{ padding: '14px 16px' }}>Service PINs</th>
                <th style={{ padding: '14px 16px' }}>Vehicle</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 16px' }}>Submitted Date</th>
                <th style={{ padding: '14px 16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr key={app._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{app.fullName}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>📞 {app.mobileNumber}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: '700', color: '#16a34a' }}>PIN: {app.pincode}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{app.city}, {app.state}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {app.servicePincodes?.map((pin: string) => (
                        <span key={pin} style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                          {pin}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: '600' }}>
                    {app.vehicleType}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '800',
                        backgroundColor:
                          app.applicationStatus === 'accepted'
                            ? '#dcfce7'
                            : app.applicationStatus === 'rejected'
                            ? '#fee2e2'
                            : '#fef3c7',
                        color:
                          app.applicationStatus === 'accepted'
                            ? '#15803d'
                            : app.applicationStatus === 'rejected'
                            ? '#b91c1c'
                            : '#d97706',
                      }}
                    >
                      {app.applicationStatus.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b' }}>
                    {new Date(app.submittedAt || app.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setSelectedApp(app)}
                        style={{
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        View Detail
                      </button>

                      {app.applicationStatus !== 'accepted' && (
                        <button
                          onClick={() => handleAccept(app._id)}
                          disabled={actionLoading}
                          style={{
                            backgroundColor: '#16a34a',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          ACCEPT
                        </button>
                      )}

                      {app.applicationStatus !== 'rejected' && (
                        <button
                          onClick={() => setRejectingApp(app)}
                          disabled={actionLoading}
                          style={{
                            backgroundColor: '#fff',
                            color: '#dc2626',
                            border: '1px solid #fee2e2',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          REJECT
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Application Detail Modal (Requirement 25) */}
      {selectedApp && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 250, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', width: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                Application #{selectedApp.applicationId}
              </h2>
              <button onClick={() => setSelectedApp(null)} style={{ border: 'none', backgroundColor: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div><strong>Full Name:</strong> {selectedApp.fullName}</div>
              <div><strong>Mobile Number:</strong> {selectedApp.mobileNumber}</div>
              <div><strong>Email:</strong> {selectedApp.email || 'N/A'}</div>
              <div><strong>Address:</strong> {selectedApp.address}</div>
              <div><strong>Delivery PIN Code:</strong> <span style={{ fontWeight: '800', color: '#16a34a' }}>{selectedApp.pincode}</span></div>
              <div><strong>City / State:</strong> {selectedApp.city}, {selectedApp.state}</div>
              <div><strong>Vehicle Type:</strong> {selectedApp.vehicleType} ({selectedApp.vehicleNumber || 'N/A'})</div>
              <div>
                <strong>Service PIN Codes:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {selectedApp.servicePincodes?.map((pin: string) => (
                    <span key={pin} style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>
                      {pin}
                    </span>
                  ))}
                </div>
              </div>
              <div><strong>Identity Verification Status:</strong> <span style={{ fontWeight: '700', color: '#0369a1' }}>{selectedApp.identityVerificationStatus || 'PENDING'}</span></div>
              <div><strong>Application Status:</strong> <strong style={{ color: selectedApp.applicationStatus === 'accepted' ? '#16a34a' : selectedApp.applicationStatus === 'rejected' ? '#b91c1c' : '#d97706' }}>{selectedApp.applicationStatus.toUpperCase()}</strong></div>
              {selectedApp.rejectionReason && (
                <div style={{ color: '#b91c1c', backgroundColor: '#fef2f2', padding: '10px', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                  <strong>Rejection Reason:</strong> {selectedApp.rejectionReason}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              {selectedApp.applicationStatus !== 'accepted' && (
                <button
                  onClick={() => handleAccept(selectedApp._id)}
                  style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                >
                  ACCEPT APPLICATION
                </button>
              )}
              <button onClick={() => setSelectedApp(null)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingApp && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 260 }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '14px', width: '420px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#b91c1c' }}>Reject Application</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Please provide a reason for rejecting {rejectingApp.fullName}'s application:
            </p>
            <form onSubmit={handleRejectSubmit}>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginBottom: '16px' }}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setRejectingApp(null)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#dc2626', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Temporary Credentials Popup */}
      {issuedCreds && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', width: '420px', textAlign: 'center' }}>
            <CheckCircle2 size={48} color="#16a34a" style={{ marginBottom: '12px' }} />
            <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Delivery Account Created</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
              Issue these temporary credentials to the partner for initial website login:
            </p>
            <div style={{ backgroundColor: '#f1f5f9', padding: '14px', borderRadius: '10px', textAlign: 'left', margin: '16px 0', fontSize: '14px' }}>
              <div><strong>Username / Phone:</strong> {issuedCreds.username}</div>
              <div style={{ marginTop: '6px' }}><strong>Temporary Password:</strong> <span style={{ color: '#16a34a', fontWeight: '800' }}>{issuedCreds.temporaryPassword}</span></div>
            </div>
            <button onClick={() => setIssuedCreds(null)} style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
