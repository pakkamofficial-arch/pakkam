import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Truck } from 'lucide-react-native';
import { tokens } from '../theme/tokens';

interface DeliveryBadgeProps {
  subtotal: number;
  freeDeliveryThreshold?: number;
  deliveryFee: number;
}

export const DeliveryBadge: React.FC<DeliveryBadgeProps> = ({
  subtotal,
  freeDeliveryThreshold = 500,
  deliveryFee,
}) => {
  const needed = Math.max(0, freeDeliveryThreshold - subtotal);
  const isFree = subtotal >= freeDeliveryThreshold && subtotal > 0;

  return (
    <View style={styles.container}>
      <Truck size={16} color={tokens.colors.primary} strokeWidth={1.75} style={styles.icon} />
      <View style={styles.textContainer}>
        {isFree ? (
          <Text style={styles.freeText}>🎉 You get FREE Delivery on this order!</Text>
        ) : subtotal > 0 ? (
          <Text style={styles.neededText}>
            Add <Text style={styles.boldText}>₹{needed}</Text> more for <Text style={styles.boldText}>FREE Delivery!</Text> (Delivery Fee: ₹{deliveryFee})
          </Text>
        ) : (
          <Text style={styles.neededText}>
            Free Delivery on orders above ₹{freeDeliveryThreshold}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.colors.lightSurface,
    borderColor: tokens.colors.border,
    borderWidth: 1,
    padding: tokens.spacing.md,
    borderRadius: tokens.radii.input,
    marginVertical: tokens.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: tokens.spacing.xs,
  },
  textContainer: {
    flex: 1,
  },
  freeText: {
    color: tokens.colors.primary,
    fontWeight: tokens.typography.weights.bold,
    fontSize: tokens.typography.sizes.xs,
  },
  neededText: {
    color: tokens.colors.textSecondary,
    fontSize: tokens.typography.sizes.xs,
  },
  boldText: {
    color: tokens.colors.textPrimary,
    fontWeight: tokens.typography.weights.bold,
  },
});
