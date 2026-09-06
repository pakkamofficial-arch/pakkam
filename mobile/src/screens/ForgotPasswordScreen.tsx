import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eye, EyeOff, Lock, Phone, KeyRound, CheckCircle2 } from 'lucide-react-native';
import client from '../api/client';
import { BackButton } from '../components/BackButton';
import { Colors } from '../theme';

export const ForgotPasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<'REQUEST' | 'VERIFY' | 'RESET' | 'SUCCESS'>('REQUEST');

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [verifiedToken, setVerifiedToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Step 1: Send Reset OTP
  const handleRequestOtp = async () => {
    if (!emailOrPhone.trim()) {
      setError('Please enter your mobile number or email');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setMessage('');
      const res = await client.post('/auth/forgot-password', {
        emailOrPhone: emailOrPhone.trim(),
      });

      if (res.data.success) {
        if (res.data.resetToken) {
          setResetToken(res.data.resetToken);
        }
        setMessage(
          res.data.devOtp
            ? `OTP code sent: ${res.data.devOtp}`
            : 'Password reset OTP has been sent to your registered contact.'
        );
        setStep('VERIFY');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError('Please enter the 6-digit OTP code');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await client.post('/auth/verify-reset-otp', {
        emailOrPhone: emailOrPhone.trim(),
        otp: otp.trim(),
        resetToken,
      });

      if (res.data.success) {
        setVerifiedToken(res.data.verifiedToken);
        setMessage('OTP verified successfully! Please enter your new password.');
        setStep('RESET');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await client.post('/auth/reset-password', {
        verifiedToken,
        newPassword,
        confirmPassword,
      });

      if (res.data.success) {
        setStep('SUCCESS');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { paddingTop: Math.max(insets.top + 16, 24) }]} keyboardShouldPersistTaps="handled">
      <View style={styles.topBackRow}>
        <BackButton navigation={navigation} fallbackScreen="Login" />
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          {step === 'REQUEST' && 'Enter your mobile number or email to receive a password reset OTP'}
          {step === 'VERIFY' && 'Enter the 6-digit OTP code sent to your mobile/email'}
          {step === 'RESET' && 'Set a strong new password for your PAKKAM account'}
          {step === 'SUCCESS' && 'Your password has been reset successfully!'}
        </Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {message ? <Text style={styles.messageText}>{message}</Text> : null}

      {/* STEP 1: REQUEST RESET */}
      {step === 'REQUEST' && (
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number or Email</Text>
            <View style={styles.inputWrapper}>
              <Phone size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="Enter mobile number or email"
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleRequestOtp} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Send Reset Code</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelLink} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.cancelLinkText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 2: VERIFY OTP */}
      {step === 'VERIFY' && (
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>6-Digit OTP Code</Text>
            <View style={styles.inputWrapper}>
              <KeyRound size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyOtp} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelLink} onPress={handleRequestOtp}>
            <Text style={styles.resendLinkText}>Resend OTP Code</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 3: RESET PASSWORD */}
      {step === 'RESET' && (
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowNewPassword(!showNewPassword)}
                activeOpacity={0.7}
              >
                {showNewPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={18} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                activeOpacity={0.7}
              >
                {showConfirmPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleResetPassword} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 4: SUCCESS */}
      {step === 'SUCCESS' && (
        <View style={styles.successCard}>
          <CheckCircle2 size={56} color="#16a34a" style={{ marginBottom: 12 }} />
          <Text style={styles.successTitle}>Password Reset Complete!</Text>
          <Text style={styles.successSub}>
            Your password has been successfully updated. You can now sign in with your new credentials.
          </Text>

          <TouchableOpacity
            style={[styles.primaryButton, { width: '100%', marginTop: 20 }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.primaryButtonText}>Return to Sign In</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#ffffff',
    flexGrow: 1,
    justifyContent: 'center',
  },
  topBackRow: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 18,
  },
  errorText: {
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    padding: 12,
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  messageText: {
    backgroundColor: '#f0fdf4',
    color: '#15803d',
    padding: 12,
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    fontWeight: '600',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 8,
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  eyeBtn: {
    padding: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary || '#16a34a',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelLink: {
    alignItems: 'center',
    marginTop: 12,
  },
  cancelLinkText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  resendLinkText: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '700',
  },
  successCard: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  successSub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
