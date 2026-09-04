import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput } from 'react-native';
import { ChevronLeft, Search, ShoppingCart, ZoomIn } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setCartData } from '../redux/slices/cartSlice';
import client from '../api/client';
import { ProductCard } from '../components/ProductCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { Colors, Radii, Spacing } from '../theme';

export const ShopScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch();
  const { items } = useSelector((state: RootState) => state.cart);
  const [searchQuery, setSearchQuery] = useState('');

  // Products per reference spec 2.5: Potato, Carrot, Green Chilli, Coriander
  const shopProducts = [
    {
      _id: 'sp-pot',
      name: 'Potato',
      price: 250,
      discountPrice: 250,
      unit: 'kg',
      availableUnits: ['500g', '1kg', '2kg'],
      images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400'],
    },
    {
      _id: 'sp-car',
      name: 'Carrot',
      price: 250,
      discountPrice: 250,
      unit: 'kg',
      availableUnits: ['250g', '500g', '1kg'],
      images: ['https://images.unsplash.com/photo-1598170845058-12ef4a457939?w=400'],
    },
    {
      _id: 'sp-chi',
      name: 'Green Chilli',
      price: 250,
      discountPrice: 250,
      unit: 'kg',
      availableUnits: ['100g', '250g'],
      images: ['https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400'],
    },
    {
      _id: 'sp-cor',
      name: 'Coriander',
      price: 150,
      discountPrice: 150,
      unit: 'kg',
      availableUnits: ['1 bunch', '2 bunch'],
      images: ['https://images.unsplash.com/photo-1588879460618-9249e7d947d1?w=400'],
    },
  ];

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

  const filtered = shopProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header: back arrow, zoom icon, cart icon with orange badge count per master prompt 2.5 */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={22} color={Colors.textPrimary} strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.navRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Search')}>
            <ZoomIn size={20} color={Colors.textPrimary} strokeWidth={1.75} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.cartIconBtn} onPress={() => navigation.navigate('Cart')}>
            <ShoppingCart size={20} color={Colors.textPrimary} strokeWidth={1.75} />
            {items.length > 0 && (
              <View style={styles.orangeCartBadge}>
                <Text style={styles.cartBadgeText}>{items.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar "Search vegetas & shops..." */}
      <View style={styles.searchFieldBox}>
        <Search size={16} color={Colors.textMuted} strokeWidth={1.75} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search vegetas, & shops..."
          placeholderTextColor={Colors.textPlaceholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* 2-column grid of ProductCards (Potato, Carrot, Green Chilli, Coriander) */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 90 }}
        renderItem={({ item }) => (
          <View style={{ width: '48%' }}>
            <ProductCard
              product={item}
              onAddToCart={handleAddToCart}
              onPressProduct={(p) => navigation.navigate('ProductDetail', { productId: p._id })}
              onBuyNow={(p, unit) => {
                handleAddToCart(p, unit, 1);
                navigation.navigate('Checkout');
              }}
            />
          </View>
        )}
      />

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
  iconBtn: {
    padding: 4,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cartIconBtn: {
    padding: 4,
    position: 'relative',
  },
  orangeCartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.accentOrange, // orange badge count per master prompt 2.5
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '700',
  },
  searchFieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.input,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  columnWrapper: {
    justifyContent: 'space-between',
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
