import React from 'react';
import { TouchableOpacity, StyleSheet, Text, ViewStyle } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { Colors } from '../theme';

interface BackButtonProps {
  navigation: any;
  onPress?: () => void;
  color?: string;
  size?: number;
  label?: string;
  style?: ViewStyle;
  fallbackScreen?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  navigation,
  onPress,
  color = Colors.textPrimary,
  size = 22,
  label,
  style,
  fallbackScreen = 'MainTabs',
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    if (navigation && navigation.canGoBack()) {
      navigation.goBack();
    } else if (navigation && fallbackScreen) {
      navigation.navigate(fallbackScreen);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.btn, style]}
      onPress={handlePress}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <ChevronLeft size={size} color={color} strokeWidth={2} />
      {label ? <Text style={[styles.label, { color }]}>{label}</Text> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 2,
  },
});
