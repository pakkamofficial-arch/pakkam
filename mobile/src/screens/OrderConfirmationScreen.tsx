import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { Check, MessageSquare } from 'lucide-react-native';
import { Colors, Radii, Spacing } from '../theme';

export const OrderConfirmationScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { order } = route.params || {};

  const orderNum = order?.orderNumber || 'PKM10234';
  const isCOD = order?.paymentMethod === 'COD';
  const paymentTitle = isCOD ? 'Cash on Delivery' : 'Online Payment Verified';

  const rawPhone = order?.deliveryAddress?.phone || order?.user?.phone || '9876543210';
  const maskedPhone = rawPhone.length >= 10 ? `******${rawPhone.slice(-4)}` : '******XX12';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Prominent Green Success Circle with Checkmark */}
        <View style={styles.greenTickCircle}>
          <Check size={48} color={Colors.white} strokeWidth={3.5} />
        </View>

        <Text style={styles.title}>🎉 Order Confirmed!</Text>
        <Text style={styles.subTitle}>Thank you for shopping with Pakkam ❤️</Text>
        <Text style={styles.orderIdText}>Order ID: {orderNum}</Text>

        {/* WhatsApp Delivery OTP Notice Card */}
        <View style={styles.whatsappOtpCard}>
          <View style={styles.whatsappHeaderRow}>
            <MessageSquare size={20} color="#15803d" strokeWidth={2.2} />
            <Text style={styles.whatsappCardTitle}>Delivery OTP Sent to WhatsApp</Text>
          </View>
          <Text style={styles.whatsappCardText}>
            Your 4-digit delivery OTP has been sent to your WhatsApp number:{'\n'}
            <Text style={styles.whatsappPhoneHighlight}>{maskedPhone}</Text>
          </Text>
          <View style={styles.whatsappWarningPill}>
            <Text style={styles.whatsappWarningText}>
              🔒 Please keep the OTP safe and share it with the delivery partner only when your order is delivered.
            </Text>
          </View>
        </View>

        {/* Estimated Delivery Box */}
        <View style={styles.estimateCard}>
          <Text style={styles.estimateTitle}>Estimated Delivery</Text>
          <Text style={styles.estimateTime}>1–2 Hours</Text>
          <Text style={styles.estimateSub}>Your nearby grocery shop is packing fresh items.</Text>
        </View>

        {/* Order Details Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Payment Details</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Status:</Text>
            <Text style={styles.summaryValue}>{paymentTitle}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Grand Total:</Text>
            <Text style={[styles.summaryValue, styles.greenTotal]}>₹{order?.total || 0}</Text>
          </View>
          {order?.deliveryAddress && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Deliver To:</Text>
              <Text style={styles.summaryValue} numberOfLines={1}>
                {order.deliveryAddress.houseFlat}, {order.deliveryAddress.city}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer Buttons per requirement 27 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() => navigation.replace('OrderTracking', { orderId: order?._id || orderNum })}
        >
          <Text style={styles.trackBtnText}>Track Order</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shoppingBtn}
          onPress={() => navigation.replace('MainTabs')}
        >
          <Text style={styles.shoppingBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  greenTickCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    elevation: 4,
    ...(Platform.OS === 'web'
      ? ({ boxShadow: '0px 4px 12px rgba(46, 125, 50, 0.3)' } as any)
      : {
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }),
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
    marginBottom: Spacing.lg,
  },
  estimateCard: {
    backgroundColor: Colors.chipSelected,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  estimateTitle: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  estimateTime: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primary,
    marginVertical: 4,
  },
  estimateSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    width: '100%',
    gap: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  greenTotal: {
    color: Colors.primary,
    fontSize: 16,
  },
  footer: {
    padding: Spacing.lg,
    gap: 10,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  trackBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: Radii.md,
    alignItems: 'center',
  },
  trackBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  shoppingBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    borderRadius: Radii.md,
    alignItems: 'center',
  },
  shoppingBtnText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  whatsappOtpCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    width: '100%',
    marginVertical: Spacing.md,
  },
  whatsappHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  whatsappCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#166534',
  },
  whatsappCardText: {
    fontSize: 13,
    color: '#15803d',
    lineHeight: 18,
    marginBottom: 8,
  },
  whatsappPhoneHighlight: {
    fontWeight: '800',
    color: '#14532d',
  },
  whatsappWarningPill: {
    backgroundColor: '#ffffff',
    borderRadius: Radii.sm,
    padding: 8,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  whatsappWarningText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
    lineHeight: 15,
  },
});
