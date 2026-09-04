import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { tokens } from '../theme/tokens';

interface VegetableQtyPickerProps {
  availableUnits: string[];
  selectedUnit: string;
  onSelectUnit: (unit: string) => void;
}

export const VegetableQtyPicker: React.FC<VegetableQtyPickerProps> = ({
  availableUnits,
  selectedUnit,
  onSelectUnit,
}) => {
  const units = availableUnits && availableUnits.length > 0
    ? availableUnits
    : ['250 g', '500 g', '1 kg', '2 kg', '5 kg'];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {units.map((unit) => {
        const isSelected = selectedUnit === unit;
        return (
          <TouchableOpacity
            key={unit}
            style={[styles.unitChip, isSelected && styles.selectedUnitChip]}
            onPress={() => onSelectUnit(unit)}
          >
            <Text style={[styles.unitText, isSelected && styles.selectedUnitText]}>
              {unit}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: tokens.spacing.xs,
  },
  unitChip: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: 5,
    borderRadius: tokens.radii.pill,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginRight: tokens.spacing.xs,
  },
  selectedUnitChip: {
    backgroundColor: tokens.colors.lightSurface,
    borderColor: tokens.colors.primary,
  },
  unitText: {
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.medium,
    color: tokens.colors.textSecondary,
  },
  selectedUnitText: {
    color: tokens.colors.primary,
    fontWeight: tokens.typography.weights.bold,
  },
});
