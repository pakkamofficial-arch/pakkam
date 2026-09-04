import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Radii } from '../theme';

interface IconChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: any;
}

export const IconChip: React.FC<IconChipProps> = ({
  label,
  selected = false,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        selected ? styles.selectedChip : styles.defaultChip,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.text,
          selected ? styles.selectedText : styles.defaultText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radii.pill,
    marginRight: 8,
    borderWidth: 1,
  },
  defaultChip: {
    backgroundColor: Colors.chipBackground, // #F2F2F2 per master prompt
    borderColor: Colors.border,
  },
  selectedChip: {
    backgroundColor: Colors.chipSelected,   // #DCEFDD per master prompt
    borderColor: Colors.primary,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  defaultText: {
    color: Colors.textSecondary,
  },
  selectedText: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
