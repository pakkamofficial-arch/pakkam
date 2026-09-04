import { Product, IProduct } from '../models/Product.js';
import { PriceHistory } from '../models/PriceHistory.js';

export interface PriceCalculationResult {
  basePrice: number;
  sellingPrice: number;
  effectiveUnitPrice: number;
  marketPrice: number;
  priceSource: string;
  priceUpdatedAt: Date;
  discountActive: boolean;
  discountAmount: number;
  discountPercentage: number;
}

/**
 * Calculates effective price and active discount based on server time
 */
export const calculateEffectiveProductPrice = (product: IProduct): PriceCalculationResult => {
  const basePrice = product.sellingPrice || product.price || 0;
  const marketPrice = product.marketPrice || basePrice;
  const now = new Date();

  let discountActive = false;
  let discountAmount = 0;
  let discountPercentage = 0;

  if (
    product.discountEnabled &&
    product.discountValue &&
    product.discountValue > 0
  ) {
    const isStartValid = !product.discountStartAt || new Date(product.discountStartAt) <= now;
    const isEndValid = !product.discountEndAt || new Date(product.discountEndAt) >= now;

    if (isStartValid && isEndValid) {
      discountActive = true;
      if (product.discountType === 'FIXED') {
        discountAmount = product.discountValue;
        discountPercentage = Math.round((discountAmount / basePrice) * 100);
      } else {
        // PERCENTAGE
        discountPercentage = product.discountValue;
        discountAmount = Math.round((basePrice * product.discountValue) / 100);
      }
    }
  }

  const effectiveUnitPrice = Math.max(0, basePrice - discountAmount);

  return {
    basePrice,
    sellingPrice: basePrice,
    effectiveUnitPrice,
    marketPrice,
    priceSource: product.priceSource || 'Government Price Monitoring System',
    priceUpdatedAt: product.priceUpdatedAt || new Date(),
    discountActive,
    discountAmount,
    discountPercentage,
  };
};

/**
 * Update product market & selling price and log history
 */
export const updateProductPriceWithHistory = async (
  productId: string,
  newSellingPrice: number,
  newMarketPrice?: number,
  userId?: string,
  userName?: string,
  source?: string,
  reason?: string
) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');

  const previousSellingPrice = product.sellingPrice || product.price;
  product.sellingPrice = newSellingPrice;
  product.price = newSellingPrice;

  if (newMarketPrice !== undefined) {
    product.marketPrice = newMarketPrice;
  }
  if (source) {
    product.priceSource = source;
  }
  product.priceUpdatedAt = new Date();

  await product.save();

  // Log in PriceHistory
  await PriceHistory.create({
    product: product._id,
    productName: product.name,
    marketPrice: product.marketPrice || newSellingPrice,
    sellingPrice: newSellingPrice,
    previousSellingPrice,
    source: product.priceSource,
    region: product.region || 'Madurai',
    changedBy: userId || undefined,
    changedByName: userName || 'Admin',
    reason: reason || 'Price updated',
    recordedAt: new Date(),
  });

  return product;
};
