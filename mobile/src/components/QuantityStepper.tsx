import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { Colors, Radii } from '../theme';

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  style?: any;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity style={styles.btn} onPress={onDecrement} activeOpacity={0.7}>
        <Minus size={12} color={Colors.primary} strokeWidth={2.5} />
      </TouchableOpacity>

      <Text style={styles.qtyText}>{quantity}</Text>

      <TouchableOpacity style={styles.btn} onPress={onIncrement} activeOpacity={0.7}>
        <Plus size={12} color={Colors.primary} strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.pill,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  btn: {
    padding: 6,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingHorizontal: 8,
  },
});
