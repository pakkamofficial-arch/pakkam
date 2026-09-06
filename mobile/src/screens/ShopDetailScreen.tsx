import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  const { shopId } = route.params || {};
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedSubTab, setSelectedSubTab] = useState('Vegetables');
  const [loading, setLoading] = useState(true);

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
      if (shopId) {
        const res = await client.get(`/shops/${shopId}`);
        if (res.data?.success && res.data?.shop) {
          setShop(res.data.shop);
          if (Array.isArray(res.data.products) && res.data.products.length > 0) {
            setProducts(res.data.products);
          } else {
            setProducts(sampleShopProducts);
          }
        }
      } else {
        setShop({
          _id: 'shop-demo',
          name: 'Madurai Fresh Supermarket',
          rating: 4.8,
          distance: 1.2,
          openingTime: '07:00 AM',
          closingTime: '10:00 PM',
          isOpen: true,
          banners: ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'],
        });
        setProducts(sampleShopProducts);
      }
    } catch (e) {
      setShop({
        _id: 'shop-demo',
        name: 'Madurai Fresh Supermarket',
        rating: 4.8,
        distance: 1.2,
        openingTime: '07:00 AM',
        closingTime: '10:00 PM',
        isOpen: true,
        banners: ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'],
      });
      setProducts(sampleShopProducts);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: any, selectedUnit: string, quantity: number) => {
    const token = await getStoredToken();
    if (!token) return;

    try {
      const res = await client.post('/cart/add', {
        productId: product._id,
        selectedUnit,
        quantity,
      });
      if (res.data?.success) {
        const cartRes = await client.get('/cart');
        if (cartRes.data?.success) {
          dispatch(
            setCartData({
              items: cartRes.data.cart.items || [],
              subtotal: cartRes.data.subtotal || 0,
              deliveryFee: cartRes.data.deliveryFee || 0,
              freeDeliveryThreshold: cartRes.data.freeDeliveryThreshold,
              amountNeededForFreeDelivery: cartRes.data.amountNeededForFreeDelivery,
            })
          );
        }
      }
    } catch (e) {}
  };

  if (loading || !shop) {
    return (
      <View style={[styles.container, { paddingTop: Math.max(insets.top + 8, 16) }]}>
        <Text style={{ padding: 20, color: Colors.textSecondary }}>Loading shop details...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, paddingTop: Math.max(insets.top + 8, 16) }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 85 }}>
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ChevronLeft size={22} color={Colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bagBtn} onPress={() => navigation.navigate('Cart')}>
            <ShoppingBag size={20} color={Colors.textPrimary} strokeWidth={1.75} />
          </TouchableOpacity>
        </View>

        <View style={styles.shopInfoBox}>
          <View style={styles.titleRow}>
            <Text style={styles.shopName}>{shop.name || 'Shop name'}</Text>
            <StatusBadge isOpen={shop.isOpen !== false} status={shop.isOpen !== false ? 'Open' : 'Closed'} />
          </View>

          <View style={styles.metaRow}>
            <MapPin size={12} color={Colors.textSecondary} strokeWidth={1.75} />
            <Text style={styles.metaText}>Distance - {shop.distance || '4.8'} km</Text>
            <Star size={12} color={Colors.accentOrange} fill={Colors.accentOrange} style={{ marginLeft: 6 }} />
            <Text style={styles.metaText}>{shop.rating || 4.8}</Text>
          </View>

          <View style={styles.deliveryEstRow}>
            <Clock size={12} color={Colors.primary} strokeWidth={1.75} />
            <Text style={styles.deliveryEstText}>
              Delivery in 15-20 mins • {shop.openingTime || '07:00 AM'} - {shop.closingTime || '10:00 PM'}
            </Text>
          </View>
        </View>

        {shop.banners && shop.banners.length > 0 && (
          <View style={styles.bannerContainer}>
            <Image source={{ uri: shop.banners[0] }} style={styles.bannerImage} resizeMode="cover" />
            <View style={styles.dotRow}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>
        )}

        <View style={styles.categoriesBox}>
          <Text style={styles.sectionTitle}>Shop categories</Text>
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

        <View style={styles.productsHeaderRow}>
          <Text style={styles.sectionTitle}>Products</Text>
        </View>

        <View style={styles.productsGrid}>
          {products.map((prod) => (
            <View key={prod._id} style={{ width: '48%' }}>
              <ProductCard
                product={prod}
                onAddToCart={handleAddToCart}
                onPressProduct={(p) => navigation.navigate('ProductDetail', { productId: p._id })}
                onBuyNow={(p, unit) => {
                  handleAddToCart(p, unit, 1);
                  navigation.navigate('Cart');
                }}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.bottomFixedBar, { paddingBottom: Math.max(insets.bottom, Spacing.lg) }]}>
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
