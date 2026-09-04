import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { tokens } from '../theme/tokens';

interface StatusTrackerProps {
  currentStatus: string;
}

export const StatusTracker: React.FC<StatusTrackerProps> = ({ currentStatus }) => {
  const steps = [
    { key: 'CONFIRMED', label: 'Order Confirmed', keys: ['PLACED', 'ACCEPTED', 'CONFIRMED'] },
    { key: 'PACKED', label: 'Packed', keys: ['PREPARING', 'READY_FOR_PICKUP', 'PACKED'] },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', keys: ['OUT_FOR_DELIVERY', 'ON_THE_WAY'] },
    { key: 'DELIVERED', label: 'Delivered', keys: ['DELIVERED', 'COMPLETED'] },
  ];

  const getActiveStepIndex = (status: string) => {
    const uppercaseStatus = (status || '').toUpperCase();
    for (let i = steps.length - 1; i >= 0; i--) {
      if (steps[i].keys.includes(uppercaseStatus)) {
        return i;
      }
    }
    return 0; // Default to step 0
  };

  const activeIndex = getActiveStepIndex(currentStatus);

  return (
    <View style={styles.container}>
      {steps.map((step, idx) => {
        const isPassed = idx <= activeIndex;
        const isCurrent = idx === activeIndex;

        return (
          <View key={step.key} style={styles.stepRow}>
            <View style={styles.indicatorCol}>
              <View style={[styles.circle, isPassed ? styles.activeCircle : styles.inactiveCircle]}>
                {isPassed ? (
                  <Check size={12} color={tokens.colors.white} strokeWidth={3} />
                ) : (
                  <Text style={styles.inactiveDot}>•</Text>
                )}
              </View>
              {idx < steps.length - 1 && (
                <View style={[styles.line, idx < activeIndex ? styles.activeLine : styles.inactiveLine]} />
              )}
            </View>
            <View style={styles.labelCol}>
              <Text style={[styles.label, isPassed ? styles.activeLabel : styles.inactiveLabel, isCurrent && styles.currentLabel]}>
                {step.label}
              </Text>
              {isCurrent && <Text style={styles.statusNote}>In Progress</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: tokens.spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: tokens.spacing.xs,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 28,
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  activeCircle: {
    backgroundColor: tokens.colors.primary,
  },
  inactiveCircle: {
    backgroundColor: tokens.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  inactiveDot: {
    color: tokens.colors.textPlaceholder,
    fontSize: 14,
  },
  line: {
    width: 2,
    height: 28,
    marginVertical: -2,
  },
  activeLine: {
    backgroundColor: tokens.colors.primary,
  },
  inactiveLine: {
    backgroundColor: tokens.colors.border,
  },
  labelCol: {
    marginLeft: tokens.spacing.md,
    justifyContent: 'center',
    paddingTop: 1,
  },
  label: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.medium,
  },
  activeLabel: {
    color: tokens.colors.textPrimary,
  },
  inactiveLabel: {
    color: tokens.colors.textPlaceholder,
  },
  currentLabel: {
    color: tokens.colors.primary,
    fontWeight: tokens.typography.weights.bold,
  },
  statusNote: {
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.primary,
    fontWeight: tokens.typography.weights.semibold,
  },
});
