import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, ChevronLeft, ShoppingCart, Tag } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import {
  setCartData,
  updateLocalItemQty,
  removeLocalItem,
} from '../redux/slices/cartSlice';
import client, { getStoredToken } from '../api/client';
import { Colors, Radii, Spacing } from '../theme';
import { QuantityStepper } from '../components/QuantityStepper';
import { PrimaryButton } from '../components/PrimaryButton';
import { getProductName } from '../utils/languageHelper';

export const CartScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { defaultAddress } = useSelector((state: RootState) => state.address);
  const { items, subtotal, deliveryFee, coupon, walletApplied, tax } = useSelector(
    (state: RootState) => state.cart
  );

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = await getStoredToken();
      if (!token) return;
      const res = await client.get('/cart');
      if (res.data?.success && res.data?.cart) {
        dispatch(
          setCartData({
            items: res.data.cart.items || [],
            subtotal: res.data.subtotal || 0,
            deliveryFee: res.data.deliveryFee || 0,
            freeDeliveryThreshold: res.data.freeDeliveryThreshold,
            amountNeededForFreeDelivery: res.data.amountNeededForFreeDelivery,
          })
        );
      }
    } catch (e: any) {
      // quiet fallback
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQty: number) => {
    dispatch(updateLocalItemQty({ itemId, quantity: newQty }));
    const token = await getStoredToken();
    if (!token) return;
    try {
      await client.put('/cart/item', { itemId, quantity: newQty });
    } catch (e) {
      fetchCart();
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    dispatch(removeLocalItem(itemId));
    const token = await getStoredToken();
    if (!token) return;
    try {
      await client.delete(`/cart/item/${itemId}`);
    } catch (e) {
      fetchCart();
    }
  };

  const couponDiscount = coupon ? coupon.discountAmount : 0;
  const grandTotal = Math.max(0, subtotal + deliveryFee + (tax || 0) - couponDiscount - (walletApplied || 0));

  if (items.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: Math.max(insets.top + 8, 16) }]}>
        <View style={[styles.headerRow, { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={22} color={Colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart (0)</Text>
          <ShoppingCart size={20} color={Colors.textPrimary} strokeWidth={1.75} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 44, marginBottom: 12 }}>🛒</Text>
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySub}>Add fresh vegetables and groceries to get started.</Text>
          <PrimaryButton
            title="Browse Products"
            onPress={() => navigation.navigate('Home')}
            style={{ width: 220, marginTop: Spacing.md }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top + 8, 16) }]}>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 110 }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={22} color={Colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart ({items.length})</Text>
          <ShoppingCart size={20} color={Colors.textPrimary} strokeWidth={1.75} />
        </View>

        {/* Free Delivery Bar */}
        {subtotal < 499 && (
          <View style={styles.freeDeliveryBanner}>
            <Text style={styles.freeDeliveryText}>
              Add <Text style={{ fontWeight: '700' }}>₹{499 - subtotal}</Text> more for FREE Delivery!
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Cart Items</Text>

        {/* Cart items list */}
        {items.map((item: any) => {
          const prod = item.product || {};
          const prodName = getProductName(prod, 'en');
          const unitPrice = item.price * (item.unitMultiplier || 1);

          return (
            <View key={item._id || prod._id} style={styles.itemCard}>
              <Image
                source={{
                  uri:
                    prod.images && prod.images.length > 0
                      ? prod.images[0]
                      : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300',
                }}
                style={styles.itemImage}
              />
              <View style={{ flex: 1 }}>
                <View style={styles.itemNameRow}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {prodName || 'Product'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveItem(item._id)}
                    style={styles.closeBtn}
                  >
                    <X size={16} color={Colors.textSecondary} strokeWidth={2} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.itemSubDetails}>{item.selectedUnit}</Text>
                <Text style={styles.itemPrice}>₹ {unitPrice * item.quantity}</Text>

                <View style={styles.qtyControlRow}>
                  <QuantityStepper
                    quantity={item.quantity}
                    onIncrement={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                    onDecrement={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                  />
                </View>
              </View>
            </View>
          );
        })}

        {/* Coupon Selector Link */}
        <TouchableOpacity
          style={styles.couponBar}
          onPress={() => navigation.navigate('Coupons')}
          activeOpacity={0.8}
        >
          <Tag size={16} color={Colors.primary} strokeWidth={2} />
          <Text style={styles.couponBarText}>
            {coupon ? `Coupon Applied: ${coupon.code} (-₹${couponDiscount})` : 'Apply Coupon Code'}
          </Text>
          <Text style={styles.couponBarLink}>{coupon ? 'Change' : 'Select'}</Text>
        </TouchableOpacity>

        {/* Exact Amount Breakdown Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Bill Details</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Item Subtotal</Text>
            <Text style={styles.summaryValue}>₹ {subtotal}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>
              {deliveryFee === 0 ? <Text style={{ color: Colors.primary, fontWeight: '700' }}>FREE</Text> : `₹ ${deliveryFee}`}
            </Text>
          </View>

          {couponDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Coupon Discount</Text>
              <Text style={[styles.summaryValue, { color: Colors.danger }]}>- ₹ {couponDiscount}</Text>
            </View>
          )}

          {walletApplied > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Wallet Discount</Text>
              <Text style={[styles.summaryValue, { color: Colors.danger }]}>- ₹ {walletApplied}</Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taxes & Charges</Text>
            <Text style={styles.summaryValue}>₹ {tax || 0}</Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>₹ {grandTotal}</Text>
          </View>
        </View>

        {/* Minimum Order Threshold Warning per requirement 23 */}
        {subtotal < 199 && (
          <View style={styles.minOrderWarningBox}>
            <Text style={styles.minOrderWarningText}>
              ⚠️ Minimum order value is ₹199. Add <Text style={{ fontWeight: '800' }}>₹{199 - subtotal}</Text> more to proceed.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Pinned Proceed Button */}
      <View style={styles.footerBar}>
        <PrimaryButton
          title={subtotal < 199 ? `Min. Order ₹199 Needed` : `Proceed to Checkout • ₹${grandTotal}`}
          onPress={() => {
            if (subtotal < 199) {
              alert(`Minimum order value is ₹199. Please add ₹${199 - subtotal} more items to your cart.`);
              return;
            }
            const targetScreen = defaultAddress ? 'Checkout' : 'LocationSelect';
            if (!isAuthenticated) {
              navigation.navigate('Login', {
                returnTo: targetScreen,
                returnParams: { source: 'cart' },
              });
              return;
            }
            if (!defaultAddress) {
              navigation.navigate('LocationSelect', { source: 'cart', isExplicitAdd: true });
            } else {
              navigation.navigate('Checkout', { source: 'cart' });
            }
          }}
          disabled={subtotal < 199}
        />
      </View>
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
    marginBottom: Spacing.sm,
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
  freeDeliveryBanner: {
    backgroundColor: Colors.chipSelected,
    borderWidth: 1,
    borderColor: Colors.primary,
    padding: 10,
    borderRadius: Radii.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  freeDeliveryText: {
    fontSize: 12,
    color: Colors.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: Radii.md,
    backgroundColor: Colors.chipBackground,
  },
  itemNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  closeBtn: {
    padding: 2,
  },
  itemSubDetails: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 4,
  },
  qtyControlRow: {
    alignItems: 'flex-start',
    marginTop: 6,
  },
  couponBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: 8,
  },
  couponBarText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  couponBarLink: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  minOrderWarningBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  minOrderWarningText: {
    fontSize: 12,
    color: '#D97706',
    textAlign: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
});
