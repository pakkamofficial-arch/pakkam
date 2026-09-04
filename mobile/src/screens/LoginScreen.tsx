import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import client, { setStoredToken } from '../api/client';
import { Colors } from '../theme';

import { BackButton } from '../components/BackButton';

export const LoginScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { returnScreen, intendedProduct, intendedUnit } = route?.params || {};
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!emailOrPhone.trim() || !password) {
      setError('Please enter your mobile number or email and password.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await client.post('/auth/login', {
        identifier: emailOrPhone.trim(),
        emailOrPhone: emailOrPhone.trim(),
        password,
      });
      if (res.data.success) {
        const { user, token } = res.data;
        await setStoredToken(token);
        dispatch(setCredentials({ user, token }));

        if (intendedProduct) {
          try {
            await client.post('/cart/add', {
              productId: intendedProduct._id,
              selectedUnit: intendedUnit || intendedProduct.unit || 'kg',
              quantity: 1,
            });
          } catch (cartErr) {
            console.error('Failed to sync intended product on login', cartErr);
          }
        }

        if (returnScreen === 'Checkout') {
          navigation.replace('Checkout');
        } else if (returnScreen === 'AddAddress') {
          navigation.replace('AddAddress');
        } else if (returnScreen) {
          navigation.replace(returnScreen);
        } else {
          navigation.replace('MainTabs');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid mobile/email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.topBackRow}>
        <BackButton navigation={navigation} fallbackScreen="MainTabs" />
      </View>
      <View style={styles.header}>
        <Text style={styles.logoIcon}>🥬</Text>
        <Text style={styles.title}>Welcome to PAKKAM</Text>
        <Text style={styles.subtitle}>Sign in to order fresh groceries from nearby local shops</Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mobile Number or Email ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Mobile number or Email ID"
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.label}>Password</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter password"
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

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
          <Text style={styles.loginButtonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    alignItems: 'center',
    marginBottom: 24,
  },
  logoIcon: {
    fontSize: 52,
    marginBottom: 8,
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
    textAlign: 'center',
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
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
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
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  eyeBtn: {
    padding: 6,
  },
  forgotPasswordLink: {
    color: Colors.primary || '#16a34a',
    fontSize: 12,
    fontWeight: '700',
  },
  loginButton: {
    backgroundColor: Colors.primary || '#16a34a',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
  },
  registerLink: {
    color: Colors.primary || '#16a34a',
    fontWeight: '700',
    fontSize: 14,
  },
});
