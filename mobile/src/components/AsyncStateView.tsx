import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import { Colors, Radii, Spacing } from '../theme';

interface AsyncStateViewProps {
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  dataLength?: number;
  skeletonType?: 'productGrid' | 'productDetail' | 'list';
  children: React.ReactNode;
}

export const AsyncStateView: React.FC<AsyncStateViewProps> = ({
  loading,
  error,
  onRetry,
  skeletonType = 'productGrid',
  children,
}) => {
  if (loading) {
    return (
      <View style={styles.skeletonContainer}>
        {skeletonType === 'productGrid' && (
          <View style={styles.gridWrapper}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.skeletonCard}>
                <View style={styles.skeletonImageBlock} />
                <View style={styles.skeletonTextBlock1} />
                <View style={styles.skeletonTextBlock2} />
                <View style={styles.skeletonButtonRow} />
              </View>
            ))}
          </View>
        )}

        {skeletonType === 'productDetail' && (
          <View style={{ padding: Spacing.lg }}>
            <View style={styles.skeletonDetailImage} />
            <View style={[styles.skeletonTextBlock1, { width: '80%', height: 24, marginTop: 16 }]} />
            <View style={[styles.skeletonTextBlock2, { width: '40%', height: 20, marginTop: 8 }]} />
            <View style={[styles.skeletonDetailImage, { height: 100, marginTop: 16 }]} />
          </View>
        )}

        {skeletonType === 'list' && (
          <View style={{ padding: Spacing.lg }}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.skeletonListRow}>
                <View style={styles.skeletonAvatar} />
                <View style={{ flex: 1, gap: 8 }}>
                  <View style={[styles.skeletonTextBlock1, { width: '70%' }]} />
                  <View style={[styles.skeletonTextBlock2, { width: '40%' }]} />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <WifiOff size={44} color={Colors.textSecondary} strokeWidth={1.5} />
        <Text style={styles.errorTitle}>Couldn't load</Text>
        <Text style={styles.errorSub}>Check your internet connection and try again.</Text>

        {onRetry && (
          <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
            <RefreshCw size={16} color={Colors.white} strokeWidth={2} />
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  skeletonContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  skeletonCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  skeletonImageBlock: {
    height: 110,
    backgroundColor: '#E5E7EB',
    borderRadius: Radii.md,
    marginBottom: 8,
  },
  skeletonTextBlock1: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: '75%',
    marginBottom: 6,
  },
  skeletonTextBlock2: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: '45%',
    marginBottom: 10,
  },
  skeletonButtonRow: {
    height: 28,
    backgroundColor: '#E5E7EB',
    borderRadius: Radii.sm,
  },
  skeletonDetailImage: {
    height: 220,
    backgroundColor: '#E5E7EB',
    borderRadius: Radii.lg,
  },
  skeletonListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  errorSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Radii.md,
  },
  retryBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
