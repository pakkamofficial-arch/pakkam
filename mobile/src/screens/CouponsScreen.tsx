import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, Tag, Copy } from 'lucide-react-native';
import client from '../api/client';
import { Colors, Radii, Spacing } from '../theme';

export const CouponsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [coupons, setCoupons] = useState<any[]>([]);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await client.get('/coupons');
      if (res.data.success) {
        setCoupons(res.data.coupons || []);
      }
    } catch (e) {
      setCoupons([
        { _id: 'c-1', code: 'PAKKAM50', discountAmount: 50, minOrderValue: 200, description: 'Get ₹50 OFF on orders above ₹200' },
        { _id: 'c-2', code: 'WELCOME100', discountAmount: 100, minOrderValue: 500, description: 'Flat ₹100 OFF on your first grocery purchase' },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 60 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={22} color={Colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Available Offers</Text>
          <Tag size={20} color={Colors.textPrimary} strokeWidth={1.75} />
        </View>

        {coupons.map((c: any) => (
          <View key={c._id} style={styles.couponCard}>
            <View style={styles.couponHeader}>
              <View style={styles.codePill}>
                <Text style={styles.codePillText}>{c.code}</Text>
              </View>

              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => {
                  alert(`Applied ${c.code}!`);
                  navigation.navigate('Cart');
                }}
              >
                <Text style={styles.applyText}>APPLY</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.couponDesc}>{c.description}</Text>
            <Text style={styles.couponMin}>Min order: ₹{c.minOrderValue}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  backBtn: {
    padding: 2,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  couponCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codePill: {
    backgroundColor: Colors.chipSelected,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radii.sm,
  },
  codePillText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  applyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: Radii.sm,
  },
  applyText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  couponDesc: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  couponMin: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
