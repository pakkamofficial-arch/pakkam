import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { MapPin, ChevronDown, Search, Mic, ArrowRight, Star } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import {
  setProducts,
  setCategories,
  setFreshTodayProducts,
  setPopularProducts,
} from '../redux/slices/productSlice';
import { setShops } from '../redux/slices/shopSlice';
import { setCartData } from '../redux/slices/cartSlice';
import client, { getStoredToken } from '../api/client';
import { ProductCard } from '../components/ProductCard';
import { Colors, Radii, Spacing } from '../theme';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { defaultAddress } = useSelector((state: RootState) => state.address);
  const { products, categories, freshTodayProducts, popularProducts } = useSelector(
    (state: RootState) => state.products
  );
  const { shops } = useSelector((state: RootState) => state.shops);
  const { items } = useSelector((state: RootState) => state.cart);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setRefreshing(true);
      const catRes = await client.get('/categories');
      if (catRes.data.success) dispatch(setCategories(catRes.data.categories));

      const freshRes = await client.get('/products?isFreshToday=true&limit=10');
      if (freshRes.data.success && freshRes.data.products && freshRes.data.products.length > 0) {
        dispatch(setFreshTodayProducts(freshRes.data.products));
      } else {
        const fallbackProdRes = await client.get('/products?limit=10');
        if (fallbackProdRes.data.success) {
          dispatch(setFreshTodayProducts(fallbackProdRes.data.products));
        }
      }

      const allProdRes = await client.get('/products?limit=50');
      if (allProdRes.data.success) dispatch(setProducts(allProdRes.data.products));

      const popRes = await client.get('/products?isPopular=true&limit=10');
      if (popRes.data.success && popRes.data.products && popRes.data.products.length > 0) {
        dispatch(setPopularProducts(popRes.data.products));
      } else if (allProdRes.data.success) {
        dispatch(setPopularProducts(allProdRes.data.products.slice(0, 10)));
      }

      const shopRes = await client.get('/shops');
      if (shopRes.data.success) dispatch(setShops(shopRes.data.shops));

      const token = await getStoredToken();
      if (token) {
        try {
          const cartRes = await client.get('/cart');
          if (cartRes.data.success) {
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
        } catch (cartErr) {
          // ignore cart fetch error if unauthenticated
        }
      }
    } catch (e) {
      console.error('Home load error', e);
    } finally {
      setRefreshing(false);
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
              freeDeliveryThreshold: cartRes.data.freeDeliveryThreshold,
              amountNeededForFreeDelivery: cartRes.data.amountNeededForFreeDelivery,
            })
          );
        }
      }
    } catch (e: any) {
      // quiet fallback
    }
  };

  // Dynamic Category strip from categories Redux state or fallback list
  const categoryIconMap: Record<string, string> = {
    vegetables: '🥬',
    fruits: '🍎',
    groceries: '🌾',
    grocery: '🌾',
    dairy: '🥛',
    spices: '🌶️',
    snacks: '🍿',
    beverages: '🧃',
  };

  const dynamicCategories = categories && categories.length > 0
    ? categories.map((c: any) => ({
        id: c._id || c.name,
        name: c.name,
        icon: c.icon || categoryIconMap[c.name.toLowerCase()] || '🛒',
      }))
    : [
        { id: 'cat-veg', name: 'Vegetables', icon: '🥬' },
        { id: 'cat-fruit', name: 'Fruits', icon: '🍎' },
        { id: 'cat-groc', name: 'Groceries', icon: '🌾' },
        { id: 'cat-dairy', name: 'Dairy', icon: '🥛' },
        { id: 'cat-spices', name: 'Spices', icon: '🌶️' },
        { id: 'cat-snack', name: 'Snacks', icon: '🍿' },
      ];

  // Helper to filter products by category name
  const getProductsForCategory = (catName: string) => {
    const cleanCat = catName.toLowerCase();
    return products.filter((p: any) => {
      const pCatName = (p.category?.name || p.category || '').toLowerCase();
      if (cleanCat === 'groceries' || cleanCat === 'grocery') {
        return pCatName.includes('groc');
      }
      return pCatName.includes(cleanCat);
    });
  };

  const sectionCategoryNames = ['Vegetables', 'Fruits', 'Groceries', 'Spices', 'Dairy', 'Snacks'];

  const fallbackShops = [
    {
      _id: 's-1',
      name: 'Nearby Shops',
      rating: 4.8,
      coverImage: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500',
    },
    {
      _id: 's-2',
      name: 'Fresh Today',
      rating: 4.9,
      coverImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500',
    },
  ];

  const displayShops = shops.length > 0 ? shops : fallbackShops;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadHomeData} colors={[Colors.primary]} />}
      >
        {/* Header: Location row + Sign In button (if guest) or User Welcome (if authenticated) */}
        <View style={styles.headerBoxRow}>
          <View style={{ flex: 1 }}>
            {isAuthenticated && user?.name ? (
              <Text style={styles.userWelcomeText}>Welcome, {user.name}</Text>
            ) : null}
            <TouchableOpacity
              style={styles.locationSubheadingRow}
              onPress={() => navigation.navigate('LocationSelect')}
              activeOpacity={0.8}
            >
              <MapPin size={14} color={Colors.textSecondary} strokeWidth={1.75} />
              <Text style={styles.locationSubheadingText}>
                Delivery location at {defaultAddress?.city || 'India'}
              </Text>
              <ChevronDown size={14} color={Colors.textSecondary} strokeWidth={1.75} />
            </TouchableOpacity>
          </View>

          {!isAuthenticated && (
            <TouchableOpacity
              style={styles.signInHeaderBtn}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.85}
            >
              <Text style={styles.signInHeaderBtnText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search bar */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Search')}
        >
          <Search size={18} color={Colors.textSecondary} strokeWidth={1.75} />
          <Text style={styles.searchPlaceholder}>Search vegetables, groceries & shops</Text>
          <Mic size={18} color={Colors.primary} strokeWidth={2} />
        </TouchableOpacity>

        {/* Dynamic Horizontal Top Category Strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.circleCategoriesRow}>
          {dynamicCategories.map((cat: any) => (
            <TouchableOpacity
              key={cat.id || cat.name}
              style={styles.circleCatItem}
              onPress={() => navigation.navigate('Categories', { categoryName: cat.name, categoryId: cat.id })}
            >
              <View style={styles.circleIconBg}>
                <Text style={styles.circleEmoji}>{cat.icon}</Text>
              </View>
              <Text style={styles.circleCatLabel} numberOfLines={1}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* "Nearby Shops" section */}
        <View style={styles.sectionHeaderBetween}>
          <Text style={styles.sectionTitle}>Nearby Shops</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ShopDetail', { shopId: 'shop-muru' })}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal scroll of shop cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shopsHorizontalRail}>
          {displayShops.map((shop: any) => (
            <TouchableOpacity
              key={shop._id}
              style={styles.shopCardItem}
              onPress={() => navigation.navigate('ShopDetail', { shopId: shop._id })}
              activeOpacity={0.88}
            >
              <Image source={{ uri: shop.coverImage || shop.logo }} style={styles.shopImage} />
              <Text style={styles.shopCardName} numberOfLines={1}>{shop.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Home Delivery Promise Banner */}
        <View style={styles.promiseBanner}>
          <Text style={styles.promiseTitle}>Fresh groceries at your doorstep</Text>
          <Text style={styles.promiseSub}>Order now and get your items delivered within 1–2 hours.</Text>
          <View style={styles.promiseFeatureRow}>
            <Text style={styles.promiseBadge}>🥬 Fresh vegetables</Text>
            <Text style={styles.promiseBadge}>🛒 Daily groceries</Text>
            <Text style={styles.promiseBadge}>🚚 1-2 Hr Delivery</Text>
          </View>
          <View style={styles.promiseActionRow}>
            <TouchableOpacity
              style={styles.promisePrimaryBtn}
              onPress={() => navigation.navigate('Categories', { categoryName: 'Vegetables' })}
            >
              <Text style={styles.promisePrimaryBtnText}>View Products</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.promiseSecondaryBtn}
              onPress={() => navigation.navigate('Categories', { categoryName: 'Groceries' })}
            >
              <Text style={styles.promiseSecondaryBtnText}>Shop Nearby</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category-Wise Product Sections with Horizontal Rails */}
        {sectionCategoryNames.map((catName) => {
          const catProducts = getProductsForCategory(catName);
          if (catProducts.length === 0) return null;

          return (
            <View key={catName} style={{ marginBottom: Spacing.md }}>
              <View style={styles.sectionHeaderBetween}>
                <Text style={styles.sectionTitle}>{catName}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Categories', { categoryName: catName })}>
                  <Text style={styles.seeAllText}>See All ({catProducts.length})</Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: Spacing.lg }}>
                {catProducts.slice(0, 15).map((prod: any) => (
                  <View key={prod._id} style={{ width: 170, marginRight: 12 }}>
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
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>

      {/* Floating Cart Badge */}
      {items.length > 0 && (
        <TouchableOpacity
          style={styles.floatingCart}
          onPress={() => navigation.navigate('Cart')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={styles.cartCountBadge}>
              <Text style={styles.cartCountText}>{items.length}</Text>
            </View>
            <Text style={styles.floatingCartText}>View Cart</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={styles.floatingCartText}>Proceed</Text>
            <ArrowRight size={16} color={Colors.white} strokeWidth={2} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  userWelcomeText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  signInHeaderBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radii.pill,
  },
  signInHeaderBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  locationSubheadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationSubheadingText: {
    fontSize: 14,
    color: Colors.textSecondary, // in gray per master prompt 2.3
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderRadius: Radii.input,
    gap: Spacing.xs,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPlaceholder,
  },
  circleCategoriesRow: {
    paddingLeft: Spacing.lg,
    marginBottom: Spacing.md,
  },
  circleCatItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 60,
  },
  circleIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28, // category icons in circles per master prompt 2.3
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  circleEmoji: {
    fontSize: 24,
  },
  circleCatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary, // "See all" link (right, green) per master prompt 2.3
  },
  shopsHorizontalRail: {
    paddingLeft: Spacing.lg,
    marginBottom: Spacing.md,
  },
  promiseBanner: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radii.lg,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    padding: Spacing.md,
  },
  promiseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  promiseSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  promiseFeatureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  promiseBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
    backgroundColor: Colors.chipSelected,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.sm,
  },
  promiseActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  promisePrimaryBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    borderRadius: Radii.sm,
    alignItems: 'center',
  },
  promisePrimaryBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  promiseSecondaryBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 8,
    borderRadius: Radii.sm,
    alignItems: 'center',
  },
  promiseSecondaryBtnText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  shopCardItem: {
    width: 140,
    marginRight: 14,
  },
  shopImage: {
    width: 140,
    height: 100,
    borderRadius: Radii.md,
    resizeMode: 'cover',
    marginBottom: 4,
  },
  shopCardName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
  },
  floatingCart: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartCountBadge: {
    backgroundColor: Colors.surface,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartCountText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 11,
  },
  floatingCartText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
