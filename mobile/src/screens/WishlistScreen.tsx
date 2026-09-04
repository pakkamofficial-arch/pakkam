import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, Alert, Platform } from 'react-native';
import { ChevronLeft, Heart } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import client, { getStoredToken } from '../api/client';
import { Colors, Radii, Spacing } from '../theme';
import { ProductCard } from '../components/ProductCard';

export const WishlistScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await client.get('/wishlist');
      if (res.data.success) {
        setWishlist(res.data.wishlist || []);
      }
    } catch (e) {
      setWishlist([
        {
          _id: 'w-1',
          name: 'Tomato',
          price: 150,
          discountPrice: 150,
          unit: 'kg',
          images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={22} color={Colors.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <Heart size={20} color={Colors.danger} fill={Colors.danger} />
      </View>

      {wishlist.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>🤍</Text>
          <Text style={styles.emptyTitle}>Your Wishlist is empty</Text>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={{ padding: Spacing.lg }}
          renderItem={({ item }) => (
            <View style={{ width: '48%' }}>
              <ProductCard
                product={item}
                onPressProduct={(p) => navigation.navigate('ProductDetail', { productId: p._id })}
                onBuyNow={(p, unit) => {
                  navigation.navigate('AddAddress', {
                    intendedProduct: p,
                    intendedUnit: unit,
                    quantity: 1,
                    source: 'buy_now',
                  });
                }}
              />
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    padding: 2,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
