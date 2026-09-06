import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { store } from './src/redux/store';
import { RootNavigator } from './src/navigation/RootNavigator';
import client, { getStoredToken, clearStoredToken } from './src/api/client';
import { setCredentials, logout } from './src/redux/slices/authSlice';

const PERSISTENCE_KEY = 'PAKKAM_NAV_STATE_V1';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState<any>();

  useEffect(() => {
    const restoreStateAndAuth = async () => {
      try {
        // 1. Navigation State Restoration
        const savedStateString = await AsyncStorage.getItem(PERSISTENCE_KEY);
        const state = savedStateString ? JSON.parse(savedStateString) : undefined;
        if (state !== undefined) {
          setInitialState(state);
        }

        // 2. Auth State Rehydration from persistent storage
        const token = await getStoredToken();
        if (token) {
          try {
            const res = await client.get('/users/profile');
            if (res.data.success && res.data.user) {
              store.dispatch(setCredentials({ user: res.data.user, token }));
            } else {
              await clearStoredToken();
              store.dispatch(logout());
            }
          } catch (profileErr: any) {
            if (profileErr.response && profileErr.response.status === 401) {
              await clearStoredToken();
              store.dispatch(logout());
            } else {
              console.warn('[App] Offline or network note during profile rehydration:', profileErr);
            }
          }
        }
      } catch (e) {
        console.warn('State restoration note:', e);
      } finally {
        setIsReady(true);
      }
    };

    restoreStateAndAuth();
  }, []);

  if (!isReady) {
    return (
      <View style={[styles.webWrapper, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <View style={styles.webWrapper}>
        <View style={styles.appContainer}>
          <NavigationContainer
            initialState={initialState}
            onStateChange={(state) => {
              try {
                AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
              } catch (e) {}
            }}
          >
            <StatusBar style="auto" />
            <RootNavigator />
          </NavigationContainer>
        </View>
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#F3F4F6' : '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContainer: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 430 : '100%', // Max 430px on web per responsive spec
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
});
