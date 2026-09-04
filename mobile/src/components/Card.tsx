import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radii, Spacing, Shadow } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface, // white surface per master prompt
    borderRadius: Radii.lg,          // Radii.lg (16px) per master prompt
    padding: Spacing.md,             // Spacing.md (16px) padding per master prompt
    ...Shadow.card,                  // Shadow.card per master prompt
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
