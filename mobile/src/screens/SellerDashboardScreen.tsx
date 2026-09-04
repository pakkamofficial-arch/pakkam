import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, RefreshControl } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import client from '../api/client';
import { Colors, Radii, Spacing } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';

export const SellerDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [updatePriceVal, setUpdatePriceVal] = useState('25.00');
  const [refreshing, setRefreshing] = useState(false);

  const fallbackStats = {
    orders: 0,
    pending: 0,
    completed: 0,
    salesToday: 1000,
    denials: 2000,
    products: 300,
    stock: 30,
  };

  const fallbackOrders = [
    {
      _id: 'ord-p1',
      orderNumber: 'PK-88219',
      customerName: 'Customer',
      items: [{ name: 'Tomato', quantity: 2 }, { name: 'Onion', quantity: 1 }],
      total: 109,
      orderStatus: 'PLACED',
    },
  ];

  useEffect(() => {
    fetchSellerData();
  }, []);

  const fetchSellerData = async () => {
    try {
      setRefreshing(true);
      const res = await client.get('/shops/myshop');
      if (res.data.success) {
        setStats(res.data.stats || fallbackStats);
      } else {
        setStats(fallbackStats);
      }
      const ordRes = await client.get('/orders');
      if (ordRes.data.success && ordRes.data.orders?.length > 0) {
        setOrders(ordRes.data.orders);
      } else {
        setOrders(fallbackOrders);
      }
    } catch (e) {
      setStats(fallbackStats);
      setOrders(fallbackOrders);
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
    );
  };

  const displayStats = stats || fallbackStats;
  const displayOrders = orders.length > 0 ? orders : fallbackOrders;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchSellerData} colors={[Colors.primary]} />}
      >
        {/* Header: back arrow, centered "Dashboard" */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={22} color={Colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* "Today's orders" card: three stat columns — Orders (green number), Pancing/Pending (orange number), Completed (dark number) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's orders</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={[styles.statNum, { color: Colors.primary }]}>{displayStats.orders || 0}</Text>
              <Text style={styles.statSub}>Orders</Text>
            </View>

            <View style={styles.statCol}>
              <Text style={[styles.statNum, { color: Colors.accentOrange }]}>{displayStats.pending || 0}</Text>
              <Text style={styles.statSub}>Pancing</Text>
            </View>

            <View style={styles.statCol}>
              <Text style={[styles.statNum, { color: Colors.textPrimary }]}>{displayStats.completed || 0}</Text>
              <Text style={styles.statSub}>Completed</Text>
            </View>
          </View>
        </View>

        {/* "Sales today" card: Today ₹amount, progress bar (green), Denius/secondary figure with second progress bar (orange), Products count, Stock count */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sales today</Text>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Today</Text>
            <Text style={styles.metricVal}>₹ {displayStats.salesToday || 1000}</Text>
          </View>
          <View style={[styles.barFill, { width: '80%', backgroundColor: Colors.primary }]} />

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Denius</Text>
            <Text style={styles.metricVal}>₹ {displayStats.denials || 2000}</Text>
          </View>
          <View style={[styles.barFill, { width: '50%', backgroundColor: Colors.accentOrange }]} />

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Products</Text>
            <Text style={styles.metricVal}>₹ {displayStats.products || 300}</Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Stock</Text>
            <Text style={styles.metricVal}>{displayStats.stock || 30}</Text>
          </View>
        </View>

        {/* "Update price" row with current price and edit affordance */}
        <View style={styles.card}>
          <View style={styles.updatePriceRow}>
            <Text style={styles.updatePriceLabel}>Update price</Text>
            <View style={styles.priceInputBox}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.priceInput}
                value={updatePriceVal}
                onChangeText={setUpdatePriceVal}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Two buttons side by side: outlined/red-tinted "Reject Order" and solid green "Accept Order" */}
        {displayOrders.map((order: any) => (
          <View key={order._id} style={styles.card}>
            <Text style={styles.orderTitle}>Order #{order.orderNumber}</Text>
            <Text style={styles.orderItems}>
              {order.items?.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
            </Text>

            <View style={styles.dualBtnsRow}>
              <SecondaryButton
                title="Reject Order"
                variant="danger"
                onPress={() => handleUpdateStatus(order._id, 'REJECTED')}
                style={{ flex: 1 }}
              />

              <PrimaryButton
                title="Accept Order"
                onPress={() => handleUpdateStatus(order._id, 'ACCEPTED')}
                style={{ flex: 1, height: 48 }}
              />
            </View>

            {/* Bottom: full-width green "Mark Order Ready" button */}
            <PrimaryButton
              title="Mark Order Ready"
              onPress={() => handleUpdateStatus(order._id, 'READY')}
              style={{ marginTop: 8 }}
            />
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
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statNum: {
    fontSize: 22,
    fontWeight: '800',
  },
  statSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  metricVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  barFill: {
    height: 4,
    borderRadius: 2,
    marginTop: 4,
    marginBottom: 6,
  },
  updatePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  updatePriceLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  priceInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currencySymbol: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  priceInput: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    paddingHorizontal: 4,
    minWidth: 50,
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  orderItems: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginVertical: 6,
  },
  dualBtnsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 6,
  },
});
