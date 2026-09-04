import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Star, MapPin, Clock, ChevronLeft, ShoppingBag } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setCartData } from '../redux/slices/cartSlice';
import client, { getStoredToken } from '../api/client';
import { ProductCard } from '../components/ProductCard';
import { StatusBadge } from '../components/StatusBadge';
import { IconChip } from '../components/IconChip';
import { PrimaryButton } from '../components/PrimaryButton';
import { Colors, Radii, Spacing } from '../theme';

export const ShopDetailScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { shopId } = route.params || {};
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedSubTab, setSelectedSubTab] = useState('Vegetables');
  const [loading, setLoading] = useState(true);

  // Shop categories per master prompt 2.6: Vegetables, Fruits, Groceries
  const shopCategories = ['Vegetables', 'Fruits', 'Groceries', 'Dairy'];

  const sampleShopProducts = [
    { _id: 'sd1', name: 'Tomato', price: 150, discountPrice: 150, unit: 'kg', availableUnits: ['250g', '500g', '1kg'], images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400'], category: 'Vegetables' },
    { _id: 'sd2', name: 'Premium Chakki Atta', price: 250, discountPrice: 250, unit: '5 kg', availableUnits: ['1kg', '5kg'], images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'], category: 'Groceries' },
  ];

  useEffect(() => {
    fetchShopDetails();
  }, [shopId]);

  const fetchShopDetails = async () => {
    try {
      setLoading(true);
      const res = await client.get(`/shops/${shopId}`);
      if (res.data.success) {
        setShop(res.data.shop);
        setProducts(res.data.products || []);
      } else {
        setShop({
          name: 'Shop name',
          description: 'Delivery 1 108 items',
          address: 'Adyar Main Road',
          rating: 4.8,
          distance: '4.8',
          isOpen: true,
          coverImage: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800',
        });
        setProducts(sampleShopProducts);
      }
    } catch (e) {
      setShop({
        name: 'Shop name',
        description: 'Delivery 1 108 items',
        address: 'Adyar Main Road',
        rating: 4.8,
        distance: '4.8',
        isOpen: true,
        coverImage: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800',
      });
      setProducts(sampleShopProducts);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: any, selectedUnit: string, quantity: number) => {
    try {
      const res = await client.post('/cart/add', {
        productId: product._id,
        selectedUnit,
        quantity,
      });
      if (res.data.success) {
        const cartRes = await client.get('/cart');
        if (cartRes.data.success) {
          dispatch(
            setCartData({
              items: cartRes.data.cart.items || [],
              subtotal: cartRes.data.subtotal || 0,
              deliveryFee: cartRes.data.deliveryFee || 0,
            })
          );
        }
      }
    } catch (e: any) {
      // quiet fallback
    }
  };

  const displayList = products.length > 0 ? products : sampleShopProducts;

  if (loading || !shop) {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 20, color: Colors.textSecondary }}>Loading shop details...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 85 }}>
        {/* Header: back arrow, cart icon */}
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={22} color={Colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bagBtn} onPress={() => navigation.navigate('Cart')}>
            <ShoppingBag size={20} color={Colors.textPrimary} strokeWidth={1.75} />
          </TouchableOpacity>
        </View>

        {/* Shop name bold + StatusBadge ("Open" green / "Closed" red) on same row */}
        <View style={styles.shopInfoBox}>
          <View style={styles.titleRow}>
            <Text style={styles.shopName}>{shop.name || 'Shop name'}</Text>
            <StatusBadge isOpen={shop.isOpen !== false} status={shop.isOpen !== false ? 'Open' : 'Closed'} />
          </View>

          {/* Row: distance + star rating */}
          <View style={styles.metaRow}>
            <MapPin size={12} color={Colors.textSecondary} strokeWidth={1.75} />
            <Text style={styles.metaText}>Distance - {shop.distance || '4.8'} km</Text>
            <Star size={12} color={Colors.accentOrange} fill={Colors.accentOrange} style={{ marginLeft: 6 }} />
            <Text style={styles.metaText}>{shop.rating || 4.8}</Text>
          </View>

          {/* Delivery estimate with clock icon */}
          <View style={styles.deliveryEstRow}>
            <Clock size={12} color={Colors.primary} strokeWidth={1.75} />
            <Text style={styles.deliveryEstText}>Delivery estimates</Text>
          </View>
        </View>

        {/* Wide rounded banner image (carousel — show dot indicators) */}
        <View style={styles.bannerContainer}>
          <Image source={{ uri: shop.coverImage }} style={styles.bannerImage} />
          <View style={styles.dotRow}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* "Shop categories" section, horizontal IconChip row (Vegetables, Fruits, Groceries) */}
        <View style={styles.categoriesBox}>
          <Text style={styles.sectionTitle}>Shop categories</Text>
          <Text style={styles.sectionSub}>Delivery 1 108 items</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            {shopCategories.map((cat) => (
              <IconChip
                key={cat}
                label={cat}
                selected={selectedSubTab === cat}
                onPress={() => setSelectedSubTab(cat)}
              />
            ))}
          </ScrollView>
        </View>

        {/* "Products" section title + "See all", horizontal list of small product cards */}
        <View style={styles.productsHeaderRow}>
          <Text style={styles.sectionTitle}>Products</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ShopScreen')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productsGrid}>
          {displayList.map((prod: any) => (
            <View key={prod._id} style={{ width: '48%' }}>
              <ProductCard
                product={prod}
                onAddToCart={handleAddToCart}
                onPressProduct={(p) => navigation.navigate('ProductDetail', { productId: p._id })}
                onBuyNow={(p, unit) => {
                  handleAddToCart(p, unit, 1);
                  navigation.navigate('AddAddress', {
                    intendedProduct: p,
                    intendedUnit: unit,
                    quantity: 1,
                    source: 'buy_now',
                  });
                }}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom: full-width green "Order from this shop" button */}
      <View style={styles.bottomFixedBar}>
        <PrimaryButton
          title="Order from this shop"
          onPress={() => navigation.navigate('Cart')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
    backgroundColor: Colors.surface,
  },
  backBtn: {
    padding: 4,
    marginLeft: -4,
  },
  bagBtn: {
    padding: 4,
  },
  shopInfoBox: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  shopName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  deliveryEstRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryEstText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  bannerContainer: {
    position: 'relative',
    marginVertical: Spacing.sm,
  },
  bannerImage: {
    height: 160,
    width: '100%',
    resizeMode: 'cover',
  },
  dotRow: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 14,
  },
  categoriesBox: {
    paddingHorizontal: Spacing.lg,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
    marginBottom: Spacing.xs,
  },
  chipsRow: {
    marginBottom: Spacing.sm,
  },
  productsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: 4,
    marginBottom: Spacing.xs,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  bottomFixedBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Spacing.lg,
  },
});
