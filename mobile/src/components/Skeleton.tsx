import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, StyleSheet, View } from 'react-native';
import { Colors, Radii } from '../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = Radii.md || 8,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const ProductCardSkeleton: React.FC = () => (
  <View style={styles.cardSkeletonContainer}>
    <Skeleton height={120} borderRadius={10} style={{ marginBottom: 8 }} />
    <Skeleton height={14} width="70%" style={{ marginBottom: 6 }} />
    <Skeleton height={12} width="40%" style={{ marginBottom: 10 }} />
    <View style={styles.rowBetween}>
      <Skeleton height={16} width="35%" />
      <Skeleton height={32} width={70} borderRadius={8} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E2E8F0',
  },
  cardSkeletonContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    width: '48%',
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
