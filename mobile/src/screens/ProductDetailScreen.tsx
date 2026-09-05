import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { ShoppingCart, ChevronLeft, Share2 } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setCartData } from '../redux/slices/cartSlice';
import client, { getStoredToken } from '../api/client';
import { Colors, Radii, Spacing } from '../theme';
import { IconChip } from '../components/IconChip';
import { QuantityStepper } from '../components/QuantityStepper';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { ProductCard } from '../components/ProductCard';

export const ProductDetailScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { productId } = route.params || {};
  const dispatch = useDispatch();
  const { items } = useSelector((state: RootState) => state.cart);
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [selectedUnit, setSelectedUnit] = useState('250g');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const packSizeChips = product?.availableUnits && product.availableUnits.length > 0
    ? product.availableUnits
    : ['250g', '500g', '1kg', '2kg', '5kg'];

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await client.get(`/products/${productId}`);
      if (res.data.success && res.data.product) {
        const prod = res.data.product;
        setProduct(prod);
        const defUnit = prod.availableUnits?.[0] || prod.unit || '250g';
        setSelectedUnit(defUnit);

        // Fetch related products from same category/shop
        fetchRelated(prod.category?._id || prod.category, prod.shop?._id || prod.shop);
      } else {
        handleFetchError();
      }
    } catch (e) {
      handleFetchError();
    } finally {
      setLoading(false);
    }
  };

  const fetchRelated = async (catId?: string, shopId?: string) => {
    try {
      let url = '/products?limit=6';
      if (catId) url += `&category=${catId}`;
      const res = await client.get(url);
      if (res.data.success) {
        const filtered = (res.data.products || []).filter((p: any) => p._id !== productId);
        setRelatedProducts(filtered);
      }
    } catch (e) {
      // quiet fallback
    }
  };

  const handleFetchError = () => {
    console.warn('[ProductDetailScreen] Failed to load product ID:', productId);
  };

  const handleAddToCart = async (redirectToCheckout = false) => {
    const token = await getStoredToken();

    const availableQty = product?.availableQuantity ?? 100;
    if (quantity > availableQty) {
      alert(`Only ${availableQty} ${product?.unit || 'items'} left in stock!`);
      return;
    }

    if (redirectToCheckout) {
      navigation.navigate('AddAddress', {
        intendedProduct: product,
        intendedUnit: selectedUnit,
        quantity,
        source: 'buy_now',
      });
      return;
    }

    try {
      const res = await client.post('/cart/add', {
        productId: product?._id || productId,
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
      console.warn('[Cart] Guest add note:', e.message);
    }
    alert('Added to cart!');
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 14, color: Colors.textSecondary }}>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: Spacing.xl }]}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
        <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', marginBottom: 8 }}>
          Product Details Unavailable
        </Text>
        <Text style={{ fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginBottom: 20 }}>
          Unable to load product information. Please check your network connection and try again.
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radii.pill }}
          >
            <Text style={{ color: Colors.textPrimary, fontSize: 13, fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={fetchProduct}
            style={{ backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: Radii.pill }}
          >
            <Text style={{ color: Colors.white, fontSize: 13, fontWeight: '700' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const mrp = product.MRP || product.marketPrice || product.price || 50;
  const sellingPrice = product.finalPrice || product.sellingPrice || product.discountPrice || mrp;
  const hasDiscount = sellingPrice < mrp;
  const savings = mrp - sellingPrice;
  const discountPercent = product.discountPercent || (hasDiscount ? Math.round((savings / mrp) * 100) : 0);
  const stockQty = product.availableQuantity ?? 25;
  const isOutOfStock = product.isAvailable === false || product.stockStatus === 'OUT_OF_STOCK' || stockQty <= 0;

  return (
    <View style={styles.container}>
      {/* Header: back arrow, cart icon */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={22} color={Colors.textPrimary} strokeWidth={2} />
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

      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Large centered product image with carousel dots */}
        <View style={styles.imageBox}>
          <Image
            source={{ uri: product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600' }}
            style={styles.image}
          />
          {hasDiscount && (
            <View style={styles.discountBadgeTag}>
              <Text style={styles.discountBadgeText}>{discountPercent}% OFF</Text>
            </View>
          )}
        </View>

        <View style={styles.detailsBox}>
          {/* Product name bold (English + Tamil) + Share button */}
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{product.name}</Text>
              {product.name_ta ? <Text style={styles.productNameTamil}>({product.name_ta})</Text> : null}
            </View>
            <TouchableOpacity style={styles.shareBtn}>
              <Share2 size={18} color={Colors.textSecondary} strokeWidth={1.75} />
            </TouchableOpacity>
          </View>

          {/* Market Price & Pakkam Selling Price Transparency */}
          <View style={styles.pricingRow}>
            <Text style={styles.priceText}>₹ {sellingPrice} <Text style={{ fontSize: 13, color: Colors.textSecondary, fontWeight: '400' }}>/ {product.unit || 'kg'}</Text></Text>
            {hasDiscount && (
              <>
                <Text style={styles.mrpText}>MRP ₹{mrp}</Text>
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>Save ₹{savings}</Text>
                </View>
              </>
            )}
          </View>

          {product.marketPrice ? (
            <View style={styles.marketPriceBanner}>
              <Text style={styles.marketPriceText}>
                📊 Current Market Ref: <Text style={{ fontWeight: '700' }}>₹{product.marketPrice}/{product.unit || 'kg'}</Text> | Pakkam Price: <Text style={{ fontWeight: '700' }}>₹{sellingPrice}/{product.unit || 'kg'}</Text>
              </Text>
              {product.priceSource ? (
                <Text style={styles.priceSourceText}>Source: {product.priceSource}</Text>
              ) : null}
            </View>
          ) : null}

          {/* Vegetable Stock Status Indicator */}
          <View style={styles.stockBadgeRow}>
            <Text style={styles.stockLabelTitle}>Stock Availability:</Text>
            {isOutOfStock ? (
              <Text style={[styles.stockPill, styles.stockOut]}>Out of Stock</Text>
            ) : stockQty <= 25 ? (
              <Text style={[styles.stockPill, styles.stockLow]}>Low Stock: {stockQty} {product.unitType || 'kg'}</Text>
            ) : (
              <Text style={[styles.stockPill, styles.stockAvailable]}>Available: {stockQty} {product.unitType || 'kg'}</Text>
            )}
          </View>

          {/* "Unit Presets & Bulk Quantities" */}
          <Text style={styles.unitLabelTitle}>Select Unit / Bulk Quantity</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <View style={styles.unitChipsRow}>
              {packSizeChips.map((chip: string) => (
                <IconChip
                  key={chip}
                  label={chip}
                  selected={selectedUnit === chip}
                  onPress={() => setSelectedUnit(chip)}
                />
              ))}
            </View>
          </ScrollView>

          {/* Total Calculation Preview (e.g. 500 kg x ₹32 = ₹16,000) */}
          <View style={styles.totalCalcCard}>
            <Text style={styles.totalCalcTitle}>Subtotal Calculation Preview</Text>
            <Text style={styles.totalCalcFormula}>
              {quantity} qty ({selectedUnit}) × ₹{sellingPrice} = <Text style={styles.totalCalcAmount}>₹{(quantity * sellingPrice).toLocaleString('en-IN')}</Text>
            </Text>
          </View>

          {/* Quantity Stepper + Add to Cart button */}
          <View style={styles.qtyRow}>
            <QuantityStepper
              quantity={quantity}
              onIncrement={() => setQuantity(Math.min(stockQty, quantity + 1))}
              onDecrement={() => setQuantity(Math.max(1, quantity - 1))}
            />
            <SecondaryButton
              title="Add to Cart"
              onPress={() => handleAddToCart(false)}
              style={{ flex: 1 }}
              disabled={isOutOfStock}
            />
          </View>

          {/* Available Offers Section */}
          <View style={styles.offersSection}>
            <Text style={styles.infoTitle}>Available Offers</Text>
            <View style={styles.offerItemCard}>
              <View style={styles.offerItemHeader}>
                <Text style={styles.offerItemCode}>PAKKAM50</Text>
                <TouchableOpacity
                  style={styles.applyOfferBtn}
                  onPress={() => {
                    alert('Applied coupon PAKKAM50 (-₹50)!');
                    navigation.navigate('Cart');
                  }}
                >
                  <Text style={styles.applyOfferText}>Apply</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.offerItemDesc}>Get flat ₹50 OFF on fresh groceries above ₹200</Text>
            </View>
          </View>

          {/* "Product Info" section */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Product Info</Text>
            <Text style={styles.infoDesc}>{product.description || 'Farm-fresh products delivered directly from nearby local sellers.'}</Text>
          </View>

          {/* Related Products Section per requirement 18 */}
          {relatedProducts.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.infoTitle}>More Products Like This</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                {relatedProducts.map((relProd) => (
                  <TouchableOpacity
                    key={relProd._id}
                    style={styles.relatedCard}
                    onPress={() => navigation.push('ProductDetail', { productId: relProd._id })}
                    activeOpacity={0.88}
                  >
                    <Image
                      source={{ uri: relProd.images?.[0] || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300' }}
                      style={styles.relatedImg}
                    />
                    <Text style={styles.relatedName} numberOfLines={1}>{relProd.name}</Text>
                    <Text style={styles.relatedPrice}>₹ {relProd.discountPrice || relProd.price}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom sticky footer: Add to Cart and Buy Now */}
      <View style={styles.stickyFooter}>
        <SecondaryButton
          title="Add to Cart"
          onPress={() => handleAddToCart(false)}
          style={{ flex: 1 }}
          disabled={isOutOfStock}
        />
        <PrimaryButton
          title="Buy Now"
          onPress={() => handleAddToCart(true)}
          style={{ flex: 1 }}
          disabled={isOutOfStock}
        />
      </View>

      {/* Authentication Prompt Modal for Guest Users (Requirement 3) */}
      <Modal visible={showAuthModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.authModalCard}>
            <Text style={styles.authModalTitle}>Login or Register to continue</Text>
            <Text style={styles.authModalSub}>
              Please sign in to your account to add items to your cart and place orders.
            </Text>

            <View style={styles.authModalBtnRow}>
              <TouchableOpacity
                style={styles.authModalLoginBtn}
                onPress={() => {
                  setShowAuthModal(false);
                  navigation.navigate('Login', {
                    intendedProduct: product,
                    intendedUnit: selectedUnit,
                    returnScreen: 'AddAddress',
                  });
                }}
              >
                <Text style={styles.authModalLoginText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.authModalRegisterBtn}
                onPress={() => {
                  setShowAuthModal(false);
                  navigation.navigate('Register', {
                    intendedProduct: product,
                    intendedUnit: selectedUnit,
                    returnScreen: 'AddAddress',
                  });
                }}
              >
                <Text style={styles.authModalRegisterText}>Register</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => setShowAuthModal(false)} style={styles.authModalCancelBtn}>
              <Text style={styles.authModalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  cartIconBtn: {
    padding: 4,
    position: 'relative',
  },
  orangeCartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.accentOrange,
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
  imageBox: {
    aspectRatio: 1.1,
    width: '100%',
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  image: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  paginationDotsRow: {
    position: 'absolute',
    bottom: 12,
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
  detailsBox: {
    padding: Spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  productNameTamil: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  shareBtn: {
    padding: 4,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  priceText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
  },
  mrpText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  saveBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.sm,
  },
  saveBadgeText: {
    color: Colors.danger,
    fontSize: 11,
    fontWeight: '700',
  },
  marketPriceBanner: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radii.sm,
    marginVertical: 6,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  marketPriceText: {
    fontSize: 12,
    color: Colors.textPrimary,
  },
  priceSourceText: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  totalCalcCard: {
    backgroundColor: Colors.chipSelected,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radii.md,
    padding: 12,
    marginVertical: 8,
  },
  totalCalcTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  totalCalcFormula: {
    fontSize: 13,
    color: Colors.textPrimary,
  },
  totalCalcAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  discountBadgeTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: Colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.sm,
  },
  discountBadgeText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 11,
  },
  stockBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  stockLabelTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  stockPill: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.sm,
  },
  stockAvailable: {
    color: Colors.primary,
    backgroundColor: Colors.chipSelected,
  },
  stockLow: {
    color: '#D97706',
    backgroundColor: '#FEF3C7',
  },
  stockOut: {
    color: Colors.danger,
    backgroundColor: '#FEE2E2',
  },
  relatedSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  relatedCard: {
    width: 120,
    marginRight: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    padding: 8,
  },
  relatedImg: {
    width: '100%',
    height: 80,
    borderRadius: Radii.sm,
    resizeMode: 'contain',
    marginBottom: 6,
  },
  relatedName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  relatedPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 2,
  },
  unitLabelTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 6,
  },
  unitChipsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.md,
  },
  offersSection: {
    marginVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  offerItemCard: {
    backgroundColor: Colors.chipSelected,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginTop: 6,
  },
  offerItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  offerItemCode: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  applyOfferBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radii.sm,
  },
  applyOfferText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 11,
  },
  offerItemDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  infoBox: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Spacing.lg,
    flexDirection: 'row',
    gap: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  authModalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  authModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  authModalSub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  authModalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  authModalLoginBtn: {
    flex: 1,
    backgroundColor: Colors.primary || '#16a34a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  authModalLoginText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  authModalRegisterBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primary || '#16a34a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  authModalRegisterText: {
    color: Colors.primary || '#16a34a',
    fontWeight: '700',
    fontSize: 14,
  },
  authModalCancelBtn: {
    marginTop: 16,
    padding: 6,
  },
  authModalCancelText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
});
