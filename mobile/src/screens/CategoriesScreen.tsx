import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, ChevronLeft } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setProducts } from '../redux/slices/productSlice';
import { setCartData, addLocalProduct } from '../redux/slices/cartSlice';
import client, { getStoredToken } from '../api/client';
import { ProductCard } from '../components/ProductCard';
import { QuantityStepper } from '../components/QuantityStepper';
import { ProductCardSkeleton } from '../components/Skeleton';
import { Colors, Radii, Spacing } from '../theme';

export const CategoriesScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { products, categories } = useSelector((state: RootState) => state.products);
  const { items: cartItems } = useSelector((state: RootState) => state.cart);
  
  const initialCategoryName = route.params?.categoryName || route.params?.categoryId || 'All';
  const [selectedSubFilter, setSelectedSubFilter] = useState<string>(initialCategoryName);
  const [activeItemQty, setActiveItemQty] = useState<number>(1);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const dynamicChips = ['All', ...Array.from(new Set([
    ...categories.map((c: any) => c.name),
    'Vegetables', 'Fruits', 'Groceries', 'Dairy', 'Spices', 'Snacks'
  ]))];

  useEffect(() => {
    if (route.params?.categoryName) {
      setSelectedSubFilter(route.params.categoryName);
    } else if (route.params?.categoryId) {
      setSelectedSubFilter(route.params.categoryId);
    }
  }, [route.params?.categoryName, route.params?.categoryId]);

  useEffect(() => {
    fetchProducts();
  }, [selectedSubFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      let url = '/products?limit=100';
      if (selectedSubFilter && selectedSubFilter !== 'All') {
        url = `/products?category=${encodeURIComponent(selectedSubFilter)}&limit=100`;
      }
      const res = await client.get(url);
      if (res.data?.success && Array.isArray(res.data?.products)) {
        dispatch(setProducts(res.data.products));
      } else {
        dispatch(setProducts([]));
      }
    } catch (e: any) {
      console.error('[CategoriesScreen] Fetch products error', e);
      setFetchError('Unable to load products. Please check your connection and try again.');
    } finally {
      setLoading(false);
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

  const displayList = products;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top + 8, 16) }]}>
      {/* Header: back arrow, centered category title */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={22} color={Colors.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedSubFilter !== 'All' ? selectedSubFilter : 'Categories'}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Search size={20} color={Colors.textPrimary} strokeWidth={1.75} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayList}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: Spacing.lg }}
        contentContainerStyle={{ paddingBottom: 90 }}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        ListHeaderComponent={
          <View>
            <Text style={styles.repeatedTitle}>{selectedSubFilter !== 'All' ? selectedSubFilter : 'All Products'}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
              {dynamicChips.map((chip) => {
                const isSelected = selectedSubFilter === chip;
                return (
                  <TouchableOpacity
                    key={chip}
                    style={[styles.chip, isSelected && styles.activeChip]}
                    onPress={() => setSelectedSubFilter(chip)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.activeChipText]}>{chip}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingTop: Spacing.md }}>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </View>
          ) : (
            <View style={{ padding: Spacing.xl, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 32, marginBottom: 12 }}>📦</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' }}>
                {fetchError ? 'Unable to Load Products' : 'No Products Found'}
              </Text>
              <Text style={{ fontSize: 12, color: Colors.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: 16 }}>
                {fetchError || `No items found in category "${selectedSubFilter}".`}
              </Text>
              <TouchableOpacity
                onPress={fetchProducts}
                style={{ backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: Radii.pill }}
              >
                <Text style={{ color: Colors.white, fontSize: 13, fontWeight: '700' }}>Retry Loading</Text>
              </TouchableOpacity>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={{ width: '48%' }}>
            <ProductCard
              product={item}
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
        )}
      />

      {/* Sticky bottom bar: quantity stepper on left ("Price per unit" label + stepper) and green ADD button on right */}
      <View style={styles.stickyBottomBar}>
        <View style={styles.stickyLeft}>
          <Text style={styles.pneLabel}>Price per unit</Text>
          <QuantityStepper
            quantity={activeItemQty}
            onIncrement={() => setActiveItemQty(activeItemQty + 1)}
            onDecrement={() => setActiveItemQty(Math.max(1, activeItemQty - 1))}
          />
        </View>

        <TouchableOpacity
          style={styles.stickyAddBtn}
          onPress={() => {
            if (displayList && displayList.length > 0) {
              const activeProd = displayList[0];
              const defaultUnit = activeProd.availableUnits?.[0] || activeProd.unit || '1 kg';
              handleAddToCart(activeProd, defaultUnit, activeItemQty);
            }
            navigation.navigate('Cart');
          }}
          activeOpacity={0.88}
        >
          <Text style={styles.stickyAddBtnText}>VIEW CART</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBar: {
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
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  repeatedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  chipsRow: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  activeChip: {
    backgroundColor: Colors.chipSelected,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  activeChipText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stickyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pneLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  stickyAddBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: Radii.md,
  },
  stickyAddBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
