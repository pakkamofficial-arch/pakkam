import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, ChevronDown, Search, ArrowRight } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import {
  setProducts,
  setCategories,
  setFreshTodayProducts,
  setPopularProducts,
} from '../redux/slices/productSlice';
import { setCartData, addLocalProduct } from '../redux/slices/cartSlice';
import client, { getStoredToken } from '../api/client';
import { ProductCard } from '../components/ProductCard';
import { Colors, Radii, Spacing } from '../theme';

const CATEGORY_ITEMS = [
  { id: 'cat-veg', name: 'Vegetables', image: require('../../assets/images/vegetables.png') },
  { id: 'cat-fruit', name: 'Fruits', image: require('../../assets/images/fruits.png') },
  { id: 'cat-groc', name: 'Groceries', image: require('../../assets/images/groceries.png') },
  { id: 'cat-spices', name: 'Spices', image: require('../../assets/images/spices.png') },
  { id: 'cat-pcare', name: 'Personal Care', image: require('../../assets/images/personal-care.png') },
  { id: 'cat-house', name: 'Household', image: require('../../assets/images/household.png') },
  { id: 'cat-dairy', name: 'Dairy & Eggs', image: require('../../assets/images/dairy-eggs.png') },
  { id: 'cat-snack', name: 'Snacks', image: require('../../assets/images/snacks.png') },
  { id: 'cat-bev', name: 'Beverages', image: require('../../assets/images/beverages.png') },
  { id: 'cat-rte', name: 'Ready to Eat', image: require('../../assets/images/ready-to-eat.png') },
];

const HOME_CATEGORY_SECTIONS = [
  'Fruits',
  'Vegetables',
  'Groceries',
  'Spices',
  'Personal Care',
  'Household',
  'Dairy & Eggs',
  'Snacks',
  'Beverages',
  'Ready to Eat',
];

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { defaultAddress } = useSelector((state: RootState) => state.address);
  const { products } = useSelector((state: RootState) => state.products);
  const { items } = useSelector((state: RootState) => state.cart);

  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    setRefreshing(true);
    setFetchError(null);
    let loadedProductsList: any[] = [];

    try {
      const allProdRes = await client.get('/products?limit=100');
      if (allProdRes.data?.success && Array.isArray(allProdRes.data?.products)) {
        loadedProductsList = allProdRes.data.products;
        dispatch(setProducts(loadedProductsList));
      } else {
        setFetchError('Unable to load products. Please check your connection and try again.');
      }
    } catch (e: any) {
      console.error('[HomeScreen API Error] Failed to fetch /products:', e.message);
      setFetchError('Connection error. Tap to retry loading products.');
    }

    try {
      const [catRes, freshRes, popRes] = await Promise.allSettled([
        client.get('/categories'),
        client.get('/products?isFreshToday=true&limit=10'),
        client.get('/products?isPopular=true&limit=10'),
      ]);

      if (catRes.status === 'fulfilled' && catRes.value.data?.success) {
        dispatch(setCategories(catRes.value.data.categories || []));
      }
      if (freshRes.status === 'fulfilled' && freshRes.value.data?.success && freshRes.value.data.products?.length > 0) {
        dispatch(setFreshTodayProducts(freshRes.value.data.products));
      } else if (loadedProductsList.length > 0) {
        dispatch(setFreshTodayProducts(loadedProductsList.slice(0, 10)));
      }
      if (popRes.status === 'fulfilled' && popRes.value.data?.success && popRes.value.data.products?.length > 0) {
        dispatch(setPopularProducts(popRes.value.data.products));
      } else if (loadedProductsList.length > 0) {
        dispatch(setPopularProducts(loadedProductsList.slice(10, 20)));
      }
    } catch (secErr) {
      // quiet fallback
    }

    try {
      const token = await getStoredToken();
      if (token) {
        const cartRes = await client.get('/cart');
        if (cartRes.data?.success && cartRes.data?.cart) {
          dispatch(
            setCartData({
              items: Array.isArray(cartRes.data.cart.items) ? cartRes.data.cart.items : [],
              subtotal: cartRes.data.subtotal || 0,
              deliveryFee: cartRes.data.deliveryFee || 0,
              freeDeliveryThreshold: cartRes.data.freeDeliveryThreshold,
              amountNeededForFreeDelivery: cartRes.data.amountNeededForFreeDelivery,
            })
          );
        }
      }
    } catch (cartErr) {
      // quiet fallback
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddToCart = async (product: any, selectedUnit: string, quantity: number) => {
    dispatch(addLocalProduct({ product, selectedUnit, quantity }));
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
    } catch (e: any) {
      // quiet fallback
    }
  };

  const matchCategory = (prodCat: any, targetCategory: string) => {
    const pCatName = (
      typeof prodCat === 'object' && prodCat?.name
        ? prodCat.name
        : String(prodCat || '')
    ).toLowerCase().trim();
    
    const target = targetCategory.toLowerCase().trim();

    if (pCatName === target) return true;

    if (target === 'vegetables') return pCatName.includes('veg');
    if (target === 'fruits') return pCatName.includes('fruit');
    if (target === 'groceries') {
      return (
        pCatName.includes('groc') ||
        pCatName.includes('rice') ||
        pCatName.includes('flour') ||
        pCatName.includes('dal') ||
        pCatName.includes('oil') ||
        pCatName.includes('grain')
      );
    }
    if (target === 'spices') return pCatName.includes('spice') || pCatName.includes('masala');
    if (target === 'personal care') return pCatName.includes('personal') || pCatName.includes('care');
    if (target === 'household') return pCatName.includes('house');
    if (target === 'dairy & eggs') return pCatName.includes('dairy') || pCatName.includes('egg') || pCatName.includes('milk');
    if (target === 'snacks') return pCatName.includes('snack') || pCatName.includes('biscuit') || pCatName.includes('chips');
    if (target === 'beverages') return pCatName.includes('bev') || pCatName.includes('drink') || pCatName.includes('tea') || pCatName.includes('coffee');
    if (target === 'ready to eat') return pCatName.includes('ready') || pCatName.includes('instant') || pCatName.includes('noodle');

    return pCatName.includes(target);
  };

  const getProductsForCategory = (catName: string) => {
    return products.filter((p: any) => matchCategory(p.category, catName));
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top + 8, 16) }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadHomeData} colors={[Colors.primary]} />}
        contentContainerStyle={{ paddingBottom: items.length > 0 ? 80 : 30 }}
      >
        {/* 1. Delivery Location Header */}
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

        {/* 2. Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Search')}
        >
          <Search size={18} color={Colors.textSecondary} strokeWidth={1.75} />
          <Text style={styles.searchPlaceholder}>Search vegetables, groceries & items</Text>
        </TouchableOpacity>

        {/* Error Retry Banner */}
        {fetchError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>⚠️ {fetchError}</Text>
            <TouchableOpacity onPress={loadHomeData} style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* 3. Horizontal Category Icon Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryIconsRow}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
        >
          {CATEGORY_ITEMS.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryIconItem}
              onPress={() => navigation.navigate('Categories', { categoryName: cat.name })}
              activeOpacity={0.8}
            >
              <View style={styles.categoryIconCircle}>
                <Image source={cat.image} style={styles.categoryIconImage} />
              </View>
              <Text style={styles.categoryIconLabel} numberOfLines={1}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 4. Promotional Banner */}
        <View style={styles.promiseBanner}>
          <Text style={styles.promiseTitle}>Fresh groceries at your doorstep</Text>
          <Text style={styles.promiseSub}>Order now and get your items delivered within 1–2 hours.</Text>
          <View style={styles.promiseFeatureRow}>
            <Text style={styles.promiseBadge}>🥬 Fresh vegetables</Text>
            <Text style={styles.promiseBadge}>🛒 Daily groceries</Text>
            <Text style={styles.promiseBadge}>🚚 1–2 Hr Delivery</Text>
          </View>
          <View style={styles.promiseActionRow}>
            <TouchableOpacity
              style={styles.promisePrimaryBtn}
              onPress={() => navigation.navigate('Categories', { categoryName: 'Vegetables' })}
              activeOpacity={0.85}
            >
              <Text style={styles.promisePrimaryBtnText}>View Products</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.promiseSecondaryBtn}
              onPress={() => navigation.navigate('Categories', { categoryName: 'Groceries' })}
              activeOpacity={0.85}
            >
              <Text style={styles.promiseSecondaryBtnText}>Shop Nearby</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5-14. Category Product Sections */}
        {HOME_CATEGORY_SECTIONS.map((catName) => {
          const matchingProducts = getProductsForCategory(catName);
          if (matchingProducts.length === 0) return null;

          const totalCount = matchingProducts.length;
          const displayedProducts = matchingProducts.slice(0, 2);

          return (
            <View key={catName} style={styles.categorySection}>
              <View style={styles.sectionHeaderBetween}>
                <Text style={styles.sectionTitle}>{catName}</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Categories', { categoryName: catName })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.seeAllText}>See All ({totalCount})</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.productGridRow}>
                {displayedProducts.map((prod: any) => (
                  <View key={prod._id} style={styles.productGridCol}>
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
            </View>
          );
        })}
      </ScrollView>

      {/* Floating Cart Bar */}
      {items.length > 0 && (
        <TouchableOpacity
          style={styles.floatingCart}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.9}
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
    color: Colors.textSecondary,
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
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    marginHorizontal: Spacing.lg,
    borderRadius: Radii.md,
    marginBottom: 12,
    alignItems: 'center',
  },
  errorBannerText: {
    fontSize: 12,
    color: '#991B1B',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryIconsRow: {
    marginBottom: Spacing.md,
  },
  categoryIconItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 64,
  },
  categoryIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  categoryIconImage: {
    width: 36,
    height: 36,
  },
  categoryIconLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  promiseBanner: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Radii.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
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
  categorySection: {
    marginBottom: Spacing.md,
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
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
    color: Colors.primary,
  },
  productGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  productGridCol: {
    width: '48%',
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

