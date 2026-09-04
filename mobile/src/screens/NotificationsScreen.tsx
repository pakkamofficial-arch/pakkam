import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, Bell, Package, Tag, Wallet } from 'lucide-react-native';
import client from '../api/client';
import { Colors, Radii, Spacing } from '../theme';

export const NotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await client.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (e) {
      setNotifications([
        {
          _id: 'n-1',
          title: 'Order Delivered 🎉',
          body: 'Your order #8232901 has been delivered successfully.',
          type: 'ORDER_UPDATE',
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'n-2',
          title: 'Weekend Super Offer ⚡',
          body: 'Get 20% OFF on all fresh organic vegetables today.',
          type: 'OFFER',
          createdAt: new Date().toISOString(),
        },
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
          <Text style={styles.headerTitle}>Notifications</Text>
          <Bell size={20} color={Colors.textPrimary} strokeWidth={1.75} />
        </View>

        {notifications.map((n: any) => (
          <View key={n._id} style={styles.notifCard}>
            <View style={styles.iconCircle}>
              {n.type === 'OFFER' ? (
                <Tag size={18} color={Colors.primary} strokeWidth={2} />
              ) : (
                <Package size={18} color={Colors.primary} strokeWidth={2} />
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.notifTitle}>{n.title}</Text>
              <Text style={styles.notifBody}>{n.body}</Text>
              <Text style={styles.notifDate}>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
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
  notifCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.chipSelected,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  notifBody: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  notifDate: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
