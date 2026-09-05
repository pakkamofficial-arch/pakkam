import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useDispatch } from 'react-redux';
import { setCredentials, logout } from '../redux/slices/authSlice';
import { setAddresses } from '../redux/slices/addressSlice';
import client, { getStoredToken, clearStoredToken } from '../api/client';
import { Colors } from '../theme';

export const SplashScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    bootstrapApp();
  }, []);

  const bootstrapApp = async () => {
    try {
      // Part 4: Load persisted JWT cleanly
      const token = await getStoredToken();

      let hasAddress = false;
      let hasCompletedOnboard = false;
      let isAuthenticated = false;

      if (token) {
        try {
          // Fetch fresh user profile
          const userRes = await client.get('/auth/me');
          if (userRes.data.success && userRes.data.user) {
            const user = userRes.data.user;
            // Hydrate Redux auth state cleanly (Part 2 & 4)
            dispatch(setCredentials({ user, token }));
            isAuthenticated = true;
            hasCompletedOnboard = !!user.hasCompletedOnboarding;

            // Fetch saved customer addresses for current user (Part 8 & 9)
            try {
              const addrRes = await client.get('/addresses');
              if (addrRes.data.success && addrRes.data.addresses) {
                dispatch(setAddresses(addrRes.data.addresses));
                if (addrRes.data.addresses.length > 0) {
                  hasAddress = true;
                }
              }
            } catch (addrErr) {
              console.warn('[Splash] Address fetch fallback:', addrErr);
            }
          }
        } catch (authErr: any) {
          console.warn('[Splash] Token validation failed:', authErr.response?.status || authErr.message);
          await clearStoredToken();
          dispatch(logout());
        }
      }

      // Allow 1.2s splash branding display
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Part 4 Routing Decision (Guest Browsing Enabled)
      if (isAuthenticated && (hasAddress || hasCompletedOnboard)) {
        navigation.replace('MainTabs');
      } else if (isAuthenticated) {
        navigation.replace('LocationSelect');
      } else {
        navigation.replace('MainTabs');
      }
    } catch (err) {
      navigation.replace('MainTabs');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/pakkam-logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.brandTitle}>PAKKAM</Text>
        <Text style={styles.tagline}>Your Nearby Everything</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 2,
    marginTop: 4,
  },
  tagline: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
  },
});
