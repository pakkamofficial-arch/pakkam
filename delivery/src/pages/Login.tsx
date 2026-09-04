import React, { useState } from 'react';
import { Truck, ShieldCheck, ArrowRight, Eye, EyeOff, FileText, CheckCircle2, X } from 'lucide-react';
import api from '../services/api';

interface LoginProps {
  onLoginSuccess: (token: string, partner: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [emailOrPhone, setEmailOrPhone] = useState('delivery@pakkam.test');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Google Form Application Modal State (Requirement 19, 21)
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantMobile, setApplicantMobile] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantAddress, setApplicantAddress] = useState('');
  const [applicantPincode, setApplicantPincode] = useState('625001');
  const [applicantCity, setApplicantCity] = useState('Madurai');
  const [applicantState, setApplicantState] = useState('Tamil Nadu');
  const [vehicleType, setVehicleType] = useState('BIKE');
  const [servicePincodes, setServicePincodes] = useState('625001, 625002');
  const [submittingApp, setSubmittingApp] = useState(false);
  const [appSuccessMessage, setAppSuccessMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone || !password) {
      setError('Please enter your mobile/email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.post('/delivery/auth/login', { emailOrPhone, password });
      if (res.data.success) {
        onLoginSuccess(res.data.token, res.data.deliveryBoy);
      } else {
        setError(res.data.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid delivery partner credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantMobile || !applicantPincode) {
      alert('Name, mobile number, and PIN code are required.');
      return;
    }

    try {
      setSubmittingApp(true);
      const res = await api.post('/delivery-applications/apply', {
        fullName: applicantName,
        mobileNumber: applicantMobile,
        email: applicantEmail,
        address: applicantAddress,
        pincode: applicantPincode,
        city: applicantCity,
        state: applicantState,
        vehicleType,
        servicePincodes: servicePincodes.split(',').map((p) => p.trim()),
      });

      if (res.data.success) {
        setAppSuccessMessage('✓ Application submitted successfully! Admin will review your application.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error submitting application');
    } finally {
      setSubmittingApp(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          padding: '32px 24px',
          border: '1px solid #334155',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          color: '#f8fafc',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
            }}
          >
            <Truck size={30} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>PAKKAM Delivery Partner 🚚</h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
            Rider Login & Delivery Management Website
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#451a1a',
              border: '1px solid #991b1b',
              color: '#fca5a5',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
              Mobile Number or Email
            </label>
            <input
              type="text"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder="e.g. delivery@pakkam.test"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                color: '#f8fafc',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  color: '#f8fafc',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              border: 'none',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? 'Signing In...' : 'Sign In as Delivery Partner'}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Entry Point for Google Form Application (Requirement 19) */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => {
              setAppSuccessMessage('');
              setShowApplyModal(true);
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              backgroundColor: 'transparent',
              border: '1px solid #16a34a',
              color: '#4ade80',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <FileText size={16} /> Become a Delivery Partner (Apply via Google Form)
          </button>
        </div>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #334155', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981' }}>
            <ShieldCheck size={16} />
            <span>Official PAKKAM Delivery App (Port 5174)</span>
          </div>
        </div>
      </div>

      {/* Delivery Partner Application Modal (Requirement 19, 21) */}
      {showApplyModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '20px' }}>
          <div style={{ backgroundColor: '#1e293b', color: '#f8fafc', padding: '24px', borderRadius: '16px', width: '460px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#4ade80' }}>
                🛵 Become a PAKKAM Delivery Partner
              </h3>
              <button onClick={() => setShowApplyModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {appSuccessMessage ? (
              <div style={{ backgroundColor: '#064e3b', color: '#6ee7b7', padding: '16px', borderRadius: '10px', textAlign: 'center', margin: '20px 0' }}>
                <CheckCircle2 size={36} style={{ marginBottom: '8px' }} />
                <div style={{ fontWeight: '700', fontSize: '15px' }}>{appSuccessMessage}</div>
                <p style={{ fontSize: '12px', marginTop: '6px', color: '#a7f3d0' }}>
                  Admin will review your application details and issue your login access.
                </p>
                <button onClick={() => setShowApplyModal(false)} style={{ marginTop: '14px', backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Full Name *</label>
                  <input type="text" value={applicantName} onChange={(e) => setApplicantName(e.target.value)} required placeholder="e.g. Anand Kumar" style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Mobile Number *</label>
                  <input type="text" value={applicantMobile} onChange={(e) => setApplicantMobile(e.target.value)} required placeholder="10-digit mobile number" style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Delivery PIN Code *</label>
                  <input type="text" value={applicantPincode} onChange={(e) => setApplicantPincode(e.target.value)} required placeholder="e.g. 625001" style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>City *</label>
                    <input type="text" value={applicantCity} onChange={(e) => setApplicantCity(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>State *</label>
                    <input type="text" value={applicantState} onChange={(e) => setApplicantState(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Service PIN Codes (comma separated)</label>
                  <input type="text" value={servicePincodes} onChange={(e) => setServicePincodes(e.target.value)} placeholder="625001, 625002, 625003" style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>Vehicle Type</label>
                  <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }}>
                    <option value="BIKE">BIKE</option>
                    <option value="SCOOTER">SCOOTER</option>
                    <option value="BICYCLE">BICYCLE</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                  <button type="button" onClick={() => setShowApplyModal(false)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#cbd5e1', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submittingApp} style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#16a34a', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>
                    {submittingApp ? 'Submitting...' : 'SUBMIT APPLICATION'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
