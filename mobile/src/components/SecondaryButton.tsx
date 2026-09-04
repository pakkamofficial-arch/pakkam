import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Radii } from '../theme';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'green' | 'danger';
  style?: any;
  disabled?: boolean;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  title,
  onPress,
  variant = 'green',
  style,
  disabled = false,
}) => {
  const isDanger = variant === 'danger';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isDanger ? styles.dangerButton : styles.greenButton,
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <Text
        style={[
          styles.text,
          isDanger ? styles.dangerText : styles.greenText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: Radii.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  greenButton: {
    backgroundColor: Colors.surface,
    borderColor: Colors.primary,
  },
  dangerButton: {
    backgroundColor: '#FEF2F2',
    borderColor: Colors.danger,
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '700',
    fontSize: 14,
  },
  greenText: {
    color: Colors.primary,
  },
  dangerText: {
    color: Colors.danger,
  },
});
