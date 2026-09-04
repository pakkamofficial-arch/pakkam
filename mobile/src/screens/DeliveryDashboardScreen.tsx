import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { Package, Truck, CheckCircle2, ChevronLeft, MapPin, Store, Phone, ShieldCheck } from 'lucide-react-native';
import client from '../api/client';
import { Colors, Radii, Spacing } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';

export const DeliveryDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDeliveryOrders();
  }, []);

  const fetchDeliveryOrders = async () => {
    try {
      setRefreshing(true);
      const res = await client.get('/delivery-boys/portal/orders');
      if (res.data.success && res.data.orders) {
        setOrders(res.data.orders);
      }
    } catch (e) {
      console.error('Error fetching delivery orders:', e);
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    try {
      setLoadingId(orderId);
      const res = await client.post(`/delivery-boys/portal/orders/${orderId}/update-status`, {
        status: nextStatus,
      });

      if (res.data.success) {
        alert(`✓ Order status updated to ${nextStatus.replace(/_/g, ' ')}`);
        fetchDeliveryOrders();
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to update order status');
    } finally {
      setLoadingId(null);
    }
  };

  const getActionForStatus = (order: any) => {
    const status = order.orderStatus;
    if (status === 'DELIVERY_ASSIGNED' || status === 'CONFIRMED' || status === 'READY') {
      return {
        label: 'ACCEPT ORDER',
        nextStatus: 'DELIVERY_ACCEPTED',
        variant: 'primary',
      };
    }
    if (status === 'DELIVERY_ACCEPTED' || status === 'SHOP_ACCEPTED' || status === 'PREPARING') {
      return {
        label: 'GO TO SHOP & PICK UP',
        nextStatus: 'PICKED_UP',
        variant: 'primary',
      };
    }
    if (status === 'PICKED_UP') {
      return {
        label: 'START DELIVERY',
        nextStatus: 'OUT_FOR_DELIVERY',
        variant: 'primary',
      };
    }
    if (status === 'OUT_FOR_DELIVERY') {
      return {
        label: 'MARK DELIVERED',
        nextStatus: 'DELIVERED',
        variant: 'success',
      };
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchDeliveryOrders} colors={[Colors.primary]} />}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={22} color={Colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Delivery Partner Dashboard</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Welcome Banner */}
        <View style={styles.riderBanner}>
          <Truck size={24} color={Colors.white} strokeWidth={2} />
          <View style={{ flex: 1 }}>
            <Text style={styles.riderBannerTitle}>🛵 Active Deliveries</Text>
            <Text style={styles.riderBannerSub}>Assigned orders for fast hyperlocal doorstep delivery</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Assigned Orders ({orders.length})</Text>

        {orders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Package size={36} color={Colors.textSecondary} strokeWidth={1.5} />
            <Text style={styles.emptyCardTitle}>No Assigned Orders</Text>
            <Text style={styles.emptyCardSub}>Pull down to refresh and check for new delivery assignments.</Text>
          </View>
        ) : (
          orders.map((item) => {
            const action = getActionForStatus(item);
            const isCompleted = item.orderStatus === 'DELIVERED';

            return (
              <View key={item._id} style={styles.orderCard}>
                {/* Header Row */}
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.orderNumberText}>#{item.orderNumber}</Text>

                  <View
                    style={[
                      styles.statusBadge,
                      isCompleted ? styles.badgeSuccess : styles.badgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        isCompleted ? styles.textSuccess : styles.textActive,
                      ]}
                    >
                      {item.orderStatus.replace(/_/g, ' ')}
                    </Text>
                  </View>
                </View>

                {/* Shop Location Info */}
                <View style={styles.infoRow}>
                  <Store size={16} color={Colors.primary} strokeWidth={2} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>PICKUP SHOP</Text>
                    <Text style={styles.infoVal}>{item.shop?.name || 'PAKKAM Hyperlocal Shop'}</Text>
                  </View>
                </View>

                {/* Customer Location Info */}
                <View style={styles.infoRow}>
                  <MapPin size={16} color={Colors.primary} strokeWidth={2} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>DROP LOCATION & PINCODE</Text>
                    <Text style={styles.infoVal}>
                      {item.deliveryAddress?.area || 'Anna Nagar'}, {item.deliveryAddress?.city || 'Chennai'} -{' '}
                      <Text style={{ fontWeight: '800' }}>{item.pincode || item.deliveryAddress?.pincode || '600040'}</Text>
                    </Text>
                    <Text style={styles.addressSub}>{item.deliveryAddress?.houseFlat}</Text>
                  </View>
                </View>

                {/* Item List Summary */}
                <Text style={styles.itemsSummary} numberOfLines={2}>
                  📦 {item.items?.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                </Text>

                {/* Footer Payment & Actions */}
                <View style={styles.cardFooterRow}>
                  <View>
                    <Text style={styles.totalLabel}>Collect Amount</Text>
                    <Text style={styles.totalValue}>
                      ₹{item.total}{' '}
                      <Text style={styles.paymentMethodTag}>
                        ({item.paymentMethod === 'COD' ? '💵 COD' : '💳 PAID'})
                      </Text>
                    </Text>
                  </View>

                  {action && (
                    <PrimaryButton
                      title={loadingId === item._id ? 'Updating...' : action.label}
                      onPress={() => handleUpdateStatus(item._id, action.nextStatus)}
                      loading={loadingId === item._id}
                      style={{ paddingHorizontal: 16, height: 42 }}
                    />
                  )}
                </View>
              </View>
            );
          })
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
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  riderBanner: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.lg,
  },
  riderBannerTitle: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  riderBannerSub: {
    color: '#DCFCE7',
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 10,
  },
  emptyCardSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
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
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 8,
  },
  orderNumberText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.sm,
  },
  badgeActive: {
    backgroundColor: '#FEF3C7',
  },
  badgeSuccess: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  textActive: {
    color: '#D97706',
  },
  textSuccess: {
    color: Colors.primary,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  addressSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  itemsSummary: {
    fontSize: 12,
    color: Colors.textSecondary,
    backgroundColor: Colors.chipBackground,
    padding: 8,
    borderRadius: Radii.sm,
    marginVertical: 8,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  paymentMethodTag: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
});
