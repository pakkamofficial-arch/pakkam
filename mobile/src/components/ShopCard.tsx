import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Star, MapPin, Clock } from 'lucide-react-native';
import { tokens } from '../theme/tokens';

interface ShopCardProps {
  shop: any;
  onPressShop?: (shop: any) => void;
}

export const ShopCard: React.FC<ShopCardProps> = ({ shop, onPressShop }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPressShop && onPressShop(shop)}
      activeOpacity={0.88}
    >
      {/* Banner Image: 110px height per spec */}
      <Image
        source={{
          uri:
            shop.coverImage ||
            shop.logo ||
            'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500',
        }}
        style={styles.bannerImage}
      />

      {/* Content Padding 12px per spec */}
      <View style={styles.body}>
        <View style={styles.titleRow}>
          {/* Title: "Green Basket Organic S..." (15px Bold #111827) */}
          <Text style={styles.title} numberOfLines={1}>
            {shop.name || 'Green Basket Organic Store'}
          </Text>

          {/* Rating Badge: Light amber pill (#FEF3C7), star icon + "4.9" (12px Bold #D97706) */}
          <View style={styles.ratingBadge}>
            <Star size={11} color={tokens.colors.amberText} fill={tokens.colors.amberText} />
            <Text style={styles.ratingText}>{shop.rating || 4.9}</Text>
          </View>
        </View>

        {/* Description: 12px Regular #6B7280, single-line ellipsis */}
        <Text style={styles.description} numberOfLines={1}>
          {shop.description || 'Pure organic vegetables, greens & unpolished pulses...'}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MapPin size={11} color={tokens.colors.textMuted} strokeWidth={1.75} />
            <Text style={styles.metaText}>0.8 km</Text>
          </View>

          <View style={styles.metaItem}>
            <Clock size={11} color={tokens.colors.primary} strokeWidth={1.75} />
            <Text style={styles.metaTextPrimary}>25-30 mins</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 240, // Card width: 240px per spec
    borderRadius: 16, // rounded-2xl (16px) per spec
    backgroundColor: tokens.colors.white, // background #FFFFFF per spec
    borderWidth: 1,
    borderColor: tokens.colors.surfaceSecondary, // border 1px solid #F3F4F6 per spec
    marginRight: 14,
    overflow: 'hidden', // overflow hidden per spec
  },
  bannerImage: {
    width: '100%',
    height: 110, // Banner Image: 110px height per spec
    resizeMode: 'cover',
  },
  body: {
    padding: 12, // Content Padding: 12px per spec
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: 15, // Title: 15px Bold #111827 per spec
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.textPrimary,
    flex: 1,
    marginRight: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: tokens.colors.amberPill, // Light amber pill (#FEF3C7) per spec
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: tokens.radii.badge,
  },
  ratingText: {
    fontSize: 12, // 12px Bold #D97706 per spec
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.amberText,
  },
  description: {
    fontSize: 12, // Description: 12px Regular #6B7280 per spec
    color: tokens.colors.textMuted,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    color: tokens.colors.textMuted,
    fontWeight: tokens.typography.weights.medium,
  },
  metaTextPrimary: {
    fontSize: 11,
    color: tokens.colors.primary,
    fontWeight: tokens.typography.weights.bold,
  },
});
