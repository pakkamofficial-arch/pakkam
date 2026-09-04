import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radii } from '../theme';

interface StatusBadgeProps {
  status: 'Open' | 'Closed' | string;
  isOpen?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, isOpen }) => {
  const openState = isOpen !== undefined ? isOpen : status.toLowerCase() === 'open';

  return (
    <View style={[styles.badge, openState ? styles.openBadge : styles.closedBadge]}>
      <Text style={[styles.text, openState ? styles.openText : styles.closedText]}>
        {openState ? 'Open' : 'Closed'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
    alignSelf: 'flex-start',
  },
  openBadge: {
    backgroundColor: '#E8F5E9',
  },
  closedBadge: {
    backgroundColor: '#FFEBEE',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
  openText: {
    color: Colors.primary,
  },
  closedText: {
    color: Colors.danger,
  },
});
