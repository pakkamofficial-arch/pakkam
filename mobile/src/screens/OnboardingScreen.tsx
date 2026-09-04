import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

export const OnboardingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconBox}>
          <Text style={{ fontSize: 72 }}>🛒</Text>
        </View>
        <Text style={styles.title}>Fresh Groceries from Nearby Shops</Text>
        <Text style={styles.subtitle}>
          Discover fresh local vegetable markets and provision stores in your neighborhood. Get fast delivery in 20-30 minutes.
        </Text>

        <View style={styles.featureBox}>
          <Text style={styles.featureText}>🥬 Farm Fresh Country Vegetables</Text>
          <Text style={styles.featureText}>📅 Monthly Grocery List Manager</Text>
          <Text style={styles.featureText}>⚡ Fast Local Shop Deliveries</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.primaryButtonText}>Get Started / Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.secondaryButtonText}>Create New Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 24,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#bbf7d0',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  featureBox: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#15803d',
  },
  footer: {
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#16a34a',
    fontSize: 15,
    fontWeight: '700',
  },
});
