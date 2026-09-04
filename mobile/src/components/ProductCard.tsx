import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Radii, Shadow } from '../theme';
import { QuantityStepper } from './QuantityStepper';
import { getProductName } from '../utils/languageHelper';
import { SecondaryButton } from './SecondaryButton';
import { PrimaryButton } from './PrimaryButton';

interface ProductCardProps {
  product: any;
  onAddToCart?: (product: any, selectedUnit: string, quantity: number) => void;
  onPressProduct?: (product: any) => void;
  onBuyNow?: (product: any, selectedUnit: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onPressProduct,
  onBuyNow,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<string>(
    product.availableUnits?.[0] || product.unit || 'kg'
  );
  const [quantity, setQuantity] = useState<number>(0);
  const [showToast, setShowToast] = useState<boolean>(false);

  const price = product.discountPrice || product.price || 150;
  const productName = getProductName(product, 'en');

  // Compute Offer Tag badge if any per spec section 3
  const discountPercent = product.price && product.discountPrice && product.price > product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;
  const offerTagText = product.offerTag || (discountPercent ? `${discountPercent}% OFF` : null);

  const handleAddInitial = () => {
    const nextQty = Math.max(1, quantity + 1);
    setQuantity(nextQty);
    if (onAddToCart) onAddToCart(product, selectedUnit, nextQty);
    
    // Brief toast feedback
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  };

  const handleBuyNowPress = () => {
    const nextQty = quantity > 0 ? quantity : 1;
    if (onBuyNow) {
      onBuyNow(product, selectedUnit);
    } else if (onAddToCart) {
      onAddToCart(product, selectedUnit, nextQty);
    }
  };

  const handleIncrement = () => {
    const nextQty = quantity + 1;
    setQuantity(nextQty);
    if (onAddToCart) onAddToCart(product, selectedUnit, nextQty);
  };

  const handleDecrement = () => {
    const nextQty = Math.max(0, quantity - 1);
    setQuantity(nextQty);
    if (onAddToCart) onAddToCart(product, selectedUnit, nextQty);
  };

  return (
    <View style={styles.card}>
      {/* Top-left Offer Tag Badge per spec section 3 */}
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
          source={{
            uri:
              product.images && product.images.length > 0
                ? product.images[0]
                : 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400',
          }}
          style={styles.image}
        />
      </TouchableOpacity>

      <View style={styles.contentBox}>
        <TouchableOpacity onPress={() => onPressProduct && onPressProduct(product)}>
          <Text style={styles.productName} numberOfLines={1}>
            {productName || 'Product'}
          </Text>
        </TouchableOpacity>

        <View style={styles.priceRow}>
          <Text style={styles.priceText}>
            ₹{price} <Text style={styles.unitText}>/ {selectedUnit}</Text>
          </Text>
        </View>

        {/* Two-button row at bottom of card per spec section 2: Add to Cart + Buy Now */}
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

        {quantity > 0 && (
          <QuantityStepper
            quantity={quantity}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            style={styles.stepperAlign}
          />
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
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
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
