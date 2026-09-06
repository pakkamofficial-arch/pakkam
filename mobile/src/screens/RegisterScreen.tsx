import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eye, EyeOff } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import client, { setStoredToken } from '../api/client';

import { BackButton } from '../components/BackButton';

export const RegisterScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { returnTo, returnScreen, returnParams, intendedProduct, intendedUnit } = route?.params || {};
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim() || `usr_${cleanPhone}`;

    if (!cleanName) {
      setError('Full name is required.');
      return;
    }

    if (!cleanPhone) {
      setError('Mobile number is required.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }

    if (cleanEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        setError('Enter a valid email address.');
        return;
      }
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await client.post('/auth/register', {
        fullName: cleanName,
        name: cleanName,
        mobileNumber: cleanPhone,
        phone: cleanPhone,
        email: cleanEmail || undefined,
        userId: cleanUsername,
        username: cleanUsername,
        password,
        confirmPassword,
        role: 'CUSTOMER',
      });

      if (res.data.success) {
        const { user, token } = res.data;
        await setStoredToken(token);
        dispatch(setCredentials({ user, token }));

        if (intendedProduct && !returnParams?.directPurchaseItem) {
          try {
            await client.post('/cart/add', {
              productId: intendedProduct._id,
              selectedUnit: intendedUnit || intendedProduct.unit || 'kg',
              quantity: 1,
            });
          } catch (cartErr) {
            console.error('Failed to sync intended product on register', cartErr);
          }
        }

        const target = returnTo || returnScreen;
        if (target) {
          navigation.replace(target, returnParams || { intendedProduct, intendedUnit });
        } else {
          navigation.replace('MainTabs');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: Math.max(insets.top + 16, 24) }]} keyboardShouldPersistTaps="handled">
      <View style={styles.topBackRow}>
        <BackButton navigation={navigation} fallbackScreen="Login" />
      </View>
      <View style={styles.header}>
        <Text style={styles.title}>Create Customer Account</Text>
        <Text style={styles.subtitle}>Join PAKKAM for hyperlocal grocery delivery</Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput style={styles.input} placeholder="e.g. Ravi Kumar" value={name} onChangeText={setName} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mobile Number *</Text>
          <TextInput style={styles.input} placeholder="10-digit Indian mobile" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email ID (Optional)</Text>
          <TextInput style={styles.input} placeholder="e.g. ravi@example.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password *</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Create password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
            >
              {showPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Password *</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm password"
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

        <TouchableOpacity style={styles.primaryButton} onPress={handleRegister} disabled={loading}>
          <Text style={styles.primaryButtonText}>{loading ? 'Creating Account...' : 'Register Account'}</Text>
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login', { returnScreen, returnTo, returnParams, intendedProduct, intendedUnit })}>
            <Text style={styles.link}>Sign In</Text>
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#ffffff',
    flexGrow: 1,
  },
  topBackRow: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
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
  },
  errorText: {
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    padding: 10,
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
  },
  form: {
    gap: 14,
  },
  inputGroup: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#ffffff',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  eyeBtn: {
    padding: 6,
  },
  primaryButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
  },
  link: {
    color: '#16a34a',
    fontWeight: '700',
    fontSize: 14,
  },
});
