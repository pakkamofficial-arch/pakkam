import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { Colors, Radii, Shadow } from '../theme';
import { QuantityStepper } from './QuantityStepper';
import { getProductName } from '../utils/languageHelper';

interface ProductCardProps {
  product: any;
  onAddToCart?: (product: any, selectedUnit: string, quantity: number) => void;
  onPressProduct?: (product: any) => void;
  onBuyNow?: (product: any, selectedUnit: string) => void;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80';

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onPressProduct,
  onBuyNow,
}) => {
  const { items: cartItems } = useSelector((state: RootState) => state.cart);
  const [selectedUnit, setSelectedUnit] = useState<string>(
    product.availableUnits?.[0] || product.unit || '1 kg'
  );
  const [imgError, setImgError] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);

  // Derive quantity from cart state automatically
  const cartItem = cartItems.find((item: any) => {
    const pId = typeof item.product === 'object' ? item.product?._id : item.product;
    return pId === product._id;
  });
  const currentCartQuantity = cartItem ? cartItem.quantity : 0;

  const productName = getProductName(product, 'en') || product.name || 'Fresh Item';
  const mrp = product.mrp || product.MRP || product.marketPrice || product.price || 0;
  const sellingPrice = product.sellingPrice || product.finalPrice || product.discountPrice || product.price || 0;
  const hasDiscount = mrp > sellingPrice;
  const discountPercent = product.discountPercent || (hasDiscount && mrp > 0 ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0);
  const offerTagText = discountPercent > 0 ? `${discountPercent}% OFF` : null;

  const availableStock = product.availableQuantity !== undefined ? product.availableQuantity : (product.stock !== undefined ? product.stock : 100);
  const isOutOfStock = product.isAvailable === false || product.stockStatus === 'OUT_OF_STOCK' || availableStock <= 0;

  const handleAddInitial = () => {
    if (isOutOfStock) return;
    const nextQty = 1;
    if (onAddToCart) onAddToCart(product, selectedUnit, nextQty);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  };

  const handleBuyNowPress = () => {
    if (isOutOfStock) return;
    const nextQty = currentCartQuantity > 0 ? currentCartQuantity : 1;
    if (onBuyNow) {
      onBuyNow(product, selectedUnit);
    } else if (onAddToCart) {
      onAddToCart(product, selectedUnit, nextQty);
    }
  };

  const handleIncrement = () => {
    if (isOutOfStock) return;
    if (currentCartQuantity >= availableStock) {
      return;
    }
    const nextQty = currentCartQuantity + 1;
    if (onAddToCart) onAddToCart(product, selectedUnit, nextQty);
  };

  const handleDecrement = () => {
    const nextQty = Math.max(0, currentCartQuantity - 1);
    if (onAddToCart) onAddToCart(product, selectedUnit, nextQty);
  };

  const rawImage = (product.images && product.images.length > 0 ? product.images[0] : product.image) || FALLBACK_IMAGE;
  const imageUrl = imgError ? FALLBACK_IMAGE : rawImage;

  return (
    <View style={styles.card}>
      {/* Top-left Offer Tag Badge */}
      {offerTagText && (
        <View style={styles.offerBadge}>
          <Text style={styles.offerBadgeText}>{offerTagText}</Text>
        </View>
      )}

      {/* Brief Added Toast */}
      {showToast && (
        <View style={styles.toastBox}>
          <Text style={styles.toastText}>Added to cart!</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={() => onPressProduct && onPressProduct(product)}
        activeOpacity={0.85}
        style={styles.imageWrap}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          onError={() => setImgError(true)}
        />
      </TouchableOpacity>

      <View style={styles.contentBox}>
        <TouchableOpacity onPress={() => onPressProduct && onPressProduct(product)}>
          <Text style={styles.productName} numberOfLines={1}>
            {productName}
          </Text>
        </TouchableOpacity>

        <View style={styles.priceRow}>
          <Text style={styles.priceText}>
            ₹{sellingPrice} <Text style={styles.unitText}>/ {selectedUnit}</Text>
          </Text>
          {hasDiscount && mrp > sellingPrice && (
            <Text style={styles.mrpStrikethrough}>
              ₹{mrp}
            </Text>
          )}
        </View>

        {isOutOfStock ? (
          <View style={styles.outOfStockBox}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        ) : currentCartQuantity > 0 ? (
          <QuantityStepper
            quantity={currentCartQuantity}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            style={styles.stepperAlign}
          />
        ) : (
          <View style={styles.dualBtnRow}>
            <TouchableOpacity
              style={styles.cardOutlineBtn}
              onPress={handleAddInitial}
              activeOpacity={0.85}
            >
              <Text style={styles.cardOutlineBtnText}>Add</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cardSolidBtn}
              onPress={handleBuyNowPress}
              activeOpacity={0.85}
            >
              <Text style={styles.cardSolidBtnText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    ...Shadow.card,
  },
  offerBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.accentOrange, // Orange badge top-left corner per spec section 3
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.sm,
    zIndex: 10,
  },
  offerBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  toastBox: {
    position: 'absolute',
    top: 36,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(46, 125, 50, 0.95)',
    paddingVertical: 4,
    borderRadius: Radii.sm,
    alignItems: 'center',
    zIndex: 11,
  },
  toastText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  imageWrap: {
    aspectRatio: 1.1,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '85%',
    height: '85%',
    resizeMode: 'contain',
  },
  contentBox: {
    padding: 10,
    position: 'relative',
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  priceRow: {
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  mrpStrikethrough: {
    fontSize: 11,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  outOfStockBox: {
    height: 32,
    backgroundColor: '#FEE2E2',
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  outOfStockText: {
    color: '#B91C1C',
    fontSize: 11,
    fontWeight: '800',
  },
  unitText: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  dualBtnRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  cardOutlineBtn: {
    flex: 1,
    height: 32,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  cardOutlineBtnText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  cardSolidBtn: {
    flex: 1,
    height: 32,
    backgroundColor: Colors.primary,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSolidBtnText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  stepperAlign: {
    marginTop: 6,
    alignSelf: 'center',
  },
});
