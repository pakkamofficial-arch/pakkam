import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { store } from './src/redux/store';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <View style={styles.webWrapper}>
        <View style={styles.appContainer}>
          <NavigationContainer>
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
