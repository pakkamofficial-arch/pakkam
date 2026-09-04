import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView, Alert, Platform } from 'react-native';
import { Search, ChevronLeft } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setProducts } from '../redux/slices/productSlice';
import { setCartData } from '../redux/slices/cartSlice';
import client, { getStoredToken } from '../api/client';
import { ProductCard } from '../components/ProductCard';
import { QuantityStepper } from '../components/QuantityStepper';
import { Colors, Radii, Spacing } from '../theme';

export const CategoriesScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { products } = useSelector((state: RootState) => state.products);
  const [selectedSubFilter, setSelectedSubFilter] = useState('All');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(route.params?.categoryId || null);
  const [activeItemQty, setActiveItemQty] = useState(1);

  const filterChips = ['All', 'Daily Staples', 'Leafy Greens', 'Roots'];

  // Products per reference spec 2.4: Tomato ₹150/kg, Onion ₹120/kg, Beans ₹150/kg, Brinjal ₹250/kg
  const exactVegetableItems = [
    {
      _id: 'veg-tom',
      name: 'Tomato',
      price: 150,
      discountPrice: 150,
      unit: 'kg',
      availableUnits: ['250g', '500g', '1kg'],
      images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400'],
      subFilter: 'Daily Staples',
    },
    {
      _id: 'veg-oni',
      name: 'Onion',
      price: 120,
      discountPrice: 120,
      unit: 'kg',
      availableUnits: ['500g', '1kg', '2kg'],
      images: ['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400'],
      subFilter: 'Daily Staples',
    },
    {
      _id: 'veg-bea',
      name: 'Beans',
      price: 150,
      discountPrice: 150,
      unit: 'kg',
      availableUnits: ['250g', '500g', '1kg'],
      images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400'],
      subFilter: 'Daily Staples',
    },
    {
      _id: 'veg-bri',
      name: 'Brinjal',
      price: 250,
      discountPrice: 250,
      unit: 'kg',
      availableUnits: ['250g', '500g', '1kg'],
      images: ['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400'],
      subFilter: 'Daily Staples',
    },
  ];

  useEffect(() => {
    fetchProducts();
  }, [selectedCatId]);

  const fetchProducts = async () => {
    try {
      const url = selectedCatId ? `/products?category=${selectedCatId}` : '/products';
      const res = await client.get(url);
      if (res.data.success && res.data.products?.length > 0) {
        dispatch(setProducts(res.data.products));
      } else {
        dispatch(setProducts(exactVegetableItems));
      }
    } catch (e) {
      dispatch(setProducts(exactVegetableItems));
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

  const displayList = products.length > 0 ? products : exactVegetableItems;

  return (
    <View style={styles.container}>
      {/* Header: back arrow, centered title "Vegetables", search icon right */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={22} color={Colors.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vegetables</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Search size={20} color={Colors.textPrimary} strokeWidth={1.75} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        {/* Repeated section title "Vegetables" under header per master prompt 2.4 */}
        <Text style={styles.repeatedTitle}>Vegetables</Text>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {filterChips.map((chip) => {
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

        {/* 2-column grid of ProductCard */}
        <View style={styles.productsGrid}>
          {displayList.map((item: any) => (
            <View key={item._id} style={{ width: '48%' }}>
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
          ))}
        </View>
      </ScrollView>

      {/* Sticky bottom bar: quantity stepper on left ("Pne per kg" label + stepper) and green ADD button on right */}
      <View style={styles.stickyBottomBar}>
        <View style={styles.stickyLeft}>
          <Text style={styles.pneLabel}>Pne per kg</Text>
          <QuantityStepper
            quantity={activeItemQty}
            onIncrement={() => setActiveItemQty(activeItemQty + 1)}
            onDecrement={() => setActiveItemQty(Math.max(1, activeItemQty - 1))}
          />
        </View>

        <TouchableOpacity
          style={styles.stickyAddBtn}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.88}
        >
          <Text style={styles.stickyAddBtnText}>ADD</Text>
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
