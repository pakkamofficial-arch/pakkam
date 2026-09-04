import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, Search } from 'lucide-react-native';
import client from '../api/client';
import { ProductCard } from '../components/ProductCard';
import { useDispatch } from 'react-redux';
import { setCartData } from '../redux/slices/cartSlice';
import { Colors, Radii, Spacing } from '../theme';

export const SearchScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length > 1) {
      handleSearch();
    } else {
      setProducts([]);
      setShops([]);
    }
  }, [query]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const prodRes = await client.get(`/products?search=${encodeURIComponent(query)}`);
      if (prodRes.data.success) {
        setProducts(prodRes.data.products || []);
      }
      const shopRes = await client.get(`/shops?search=${encodeURIComponent(query)}`);
      if (shopRes.data.success) {
        setShops(shopRes.data.shops || []);
      }
    } catch (e) {
      console.error(e);
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
      alert('Failed to add item');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={22} color={Colors.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.inputWrapper}>
          <Search size={18} color={Colors.textSecondary} strokeWidth={1.75} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tomato, தக்காளி, rice, அரிசி..."
            placeholderTextColor={Colors.textPlaceholder}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>
      </View>

      {shops.length > 0 && (
        <View style={styles.shopsSection}>
          <Text style={styles.sectionTitle}>Shops Found ({shops.length})</Text>
          {shops.map((s) => (
            <TouchableOpacity
              key={s._id}
              style={styles.shopRow}
              onPress={() => navigation.navigate('ShopDetail', { shopId: s._id })}
            >
              <Text style={styles.shopName}>🏪 {s.name}</Text>
              <Text style={styles.shopRating}>⭐ {s.rating}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {products.length > 0 ? (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={{ padding: 16 }}
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
      ) : query.length > 1 && !loading ? (
        <View style={styles.emptyBox}>
          <Text style={{ fontSize: 40 }}>🔍</Text>
          <Text style={styles.emptyTitle}>No matching products or shops found</Text>
          <Text style={styles.emptySub}>Try searching for "Tomato", "Rice", "Oil", "Milk"</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  backBtn: {
    padding: 4,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radii.input,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  shopsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  shopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  shopName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16a34a',
  },
  shopRating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#d97706',
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
});
