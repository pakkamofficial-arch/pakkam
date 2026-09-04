import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert, Platform } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useDispatch } from 'react-redux';
import { setCartData } from '../redux/slices/cartSlice';
import client from '../api/client';
import { Colors, Radii, Spacing } from '../theme';

export const OrdersHistoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [orders, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const res = await client.get('/orders');
      if (res.data.success && res.data.orders) {
        setOrders(res.data.orders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const performCancel = async (orderId: string, reasonText = 'Changed my mind') => {
    try {
      const res = await client.patch(`/orders/${orderId}/cancel`, {
        reason: reasonText,
      });
      if (res.data.success) {
        alert('✓ Order cancelled successfully');
        fetchOrders();
      }
    } catch (err: any) {
      try {
        const res = await client.post(`/orders/${orderId}/cancel`, {
          reason: reasonText,
        });
        if (res.data.success) {
          alert('✓ Order cancelled successfully');
          fetchOrders();
        }
      } catch (fallbackErr: any) {
        alert(fallbackErr.response?.data?.message || err.response?.data?.message || 'Failed to cancel order');
      }
    }
  };

  const handleCancelOrder = (orderId: string) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to cancel this order?');
      if (confirmed) {
        performCancel(orderId);
      }
    } else {
      Alert.alert(
        'Cancel Order',
        'Are you sure you want to cancel this order?',
        [
          { text: 'Keep Order', style: 'cancel' },
          {
            text: 'Cancel Order',
            style: 'destructive',
            onPress: () => performCancel(orderId),
          },
        ]
      );
    }
  };

  const handleReorder = async (orderId: string) => {
    try {
      const res = await client.post(`/orders/${orderId}/reorder`);
      if (res.data.success) {
        const cartRes = await client.get('/cart');
        if (cartRes.data.success) {
          dispatch(
            setCartData({
              items: cartRes.data.cart.items || [],
              subtotal: cartRes.data.subtotal || 0,
              deliveryFee: cartRes.data.deliveryFee || 0,
            })
          );
        }
        alert('Items added to cart!');
        navigation.navigate('Cart');
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to reorder items');
    }
  };

  const activeOrders = orders.filter((o) =>
    ['PLACED', 'CONFIRMED', 'SHOP_ACCEPTED', 'ACCEPTED', 'PREPARING', 'READY', 'READY_FOR_PICKUP', 'DELIVERY_ASSIGNED', 'DELIVERY_ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)
  );

  const pastOrders = orders.filter((o) =>
    ['DELIVERED', 'CANCELED', 'CANCELLED', 'PAYMENT_FAILED', 'PAYMENT_CANCELLED'].includes(o.orderStatus)
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchOrders} colors={[Colors.primary]} />}
      >
        {/* Header: back arrow, centered "Orders" */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={22} color={Colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Active Orders Section */}
        <Text style={styles.sectionTitle}>Active Orders ({activeOrders.length})</Text>

        {activeOrders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyCardText}>No active orders right now</Text>
          </View>
        ) : (
          activeOrders.map((item) => {
            const canCancel = ['PLACED', 'CONFIRMED', 'SHOP_ACCEPTED', 'ACCEPTED', 'PREPARING'].includes(item.orderStatus);

            return (
              <View key={item._id} style={styles.orderCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.orderNumberText}>#{item.orderNumber}</Text>
                  <Text style={styles.orderStatusPill}>{item.orderStatus.replace('_', ' ')}</Text>
                </View>

                <Text style={styles.orderItemsPreview} numberOfLines={2}>
                  {item.items?.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                </Text>

                <View style={styles.cardFooterRow}>
                  <Text style={styles.orderAmount}>Total: ₹{item.total}</Text>

                  <View style={styles.actionBtnRow}>
                    {canCancel && (
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => handleCancelOrder(item._id)}
                      >
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.trackPillBtn}
                      onPress={() => navigation.navigate('OrderTracking', { orderId: item._id })}
                    >
                      <Text style={styles.trackPillText}>Track</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}

        {/* Past Orders Section */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>Previous Orders</Text>

        {pastOrders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyCardText}>No past orders yet</Text>
          </View>
        ) : (
          pastOrders.map((item) => (
            <View key={item._id} style={styles.orderCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.orderNumberText}>#{item.orderNumber}</Text>
                <Text
                  style={[
                    styles.orderStatusPill,
                    item.orderStatus === 'CANCELED' ? styles.statusCanceled : styles.statusDelivered,
                  ]}
                >
                  {item.orderStatus}
                </Text>
              </View>

              <Text style={styles.orderItemsPreview} numberOfLines={2}>
                {item.items?.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
              </Text>

              <View style={styles.cardFooterRow}>
                <Text style={styles.orderAmount}>Total: ₹{item.total}</Text>
                <TouchableOpacity
                  style={styles.reorderPillBtn}
                  onPress={() => handleReorder(item._id)}
                >
                  <Text style={styles.reorderPillText}>Reorder</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyCardText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  orderCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderNumberText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  orderStatusPill: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: Colors.chipSelected,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.sm,
  },
  statusDelivered: {
    color: Colors.primary,
    backgroundColor: Colors.chipSelected,
  },
  statusCanceled: {
    color: Colors.danger,
    backgroundColor: '#FEE2E2',
  },
  orderItemsPreview: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 10,
    lineHeight: 16,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: Colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radii.pill,
  },
  cancelBtnText: {
    color: Colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  trackPillBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: Radii.pill,
  },
  trackPillText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  reorderPillBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: Radii.pill,
  },
  reorderPillText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
