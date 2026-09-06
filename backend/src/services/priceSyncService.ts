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

export interface PricingCalculationResult {
  purchasePrice: number;
  additionalCost: number;
  landedCost: number;
  targetProfitMargin: number;
  recommendedSellingPrice: number;
  sellingPrice: number;
  discountPercent: number;
  discountAmount: number;
  minimumSellingPrice: number;
  finalPrice: number;
  profitAmount: number;
  profitMargin: number;
}

/**
 * Step 1 Centralized Calculation Logic:
 * Computes Landed Cost, Recommended Selling Price, Capped Discount, Final Price, Profit Amount & Realized Profit Margin.
 */
export const calculateProductPricing = (product: {
  purchasePrice?: number;
  additionalCost?: number;
  targetProfitMargin?: number;
  sellingPrice?: number;
  price?: number;
  mrp?: number;
  MRP?: number;
  marketPrice?: number;
  discountPercent?: number;
  discountAmount?: number;
  discountEnabled?: boolean;
  discountType?: string;
  discountValue?: number;
  minimumSellingPrice?: number;
}): PricingCalculationResult => {
  const purchasePrice = Math.max(0, Number(product.purchasePrice || 0));
  const additionalCost = Math.max(0, Number(product.additionalCost || 0));
  const landedCost = purchasePrice + additionalCost;

  let targetMargin = Number(product.targetProfitMargin !== undefined ? product.targetProfitMargin : 0.20);
  if (isNaN(targetMargin) || targetMargin < 0) targetMargin = 0;
  if (targetMargin >= 1) targetMargin = 0.999;

  const recommendedSellingPrice = (1 - targetMargin) > 0 ? (landedCost / (1 - targetMargin)) : landedCost;

  let mrp = Math.max(0, Number(product.MRP ?? product.mrp ?? product.marketPrice ?? 0));
  let discountPercent = Math.max(0, Math.min(100, Number(product.discountPercent || 0)));

  if (!discountPercent && product.discountEnabled && product.discountValue && product.discountType === 'PERCENTAGE') {
    discountPercent = Math.max(0, Math.min(100, Number(product.discountValue)));
  }

  let finalPrice = 0;
  let discountAmount = 0;

  if (mrp > 0) {
    if (discountPercent > 0) {
      discountAmount = (mrp * discountPercent) / 100;
      finalPrice = mrp - discountAmount;
    } else if (product.sellingPrice !== undefined || product.price !== undefined) {
      const inputSelling = Number(product.sellingPrice ?? product.price ?? mrp);
      finalPrice = Math.min(mrp, Math.max(0, inputSelling));
      discountAmount = mrp - finalPrice;
      discountPercent = mrp > 0 ? (discountAmount / mrp) * 100 : 0;
    } else {
      finalPrice = Math.min(mrp, recommendedSellingPrice);
      discountAmount = mrp - finalPrice;
      discountPercent = mrp > 0 ? (discountAmount / mrp) * 100 : 0;
    }
  } else {
    // If no MRP provided, base selling price is sellingPrice/price or recommended
    const inputSelling = Number(product.sellingPrice ?? product.price ?? recommendedSellingPrice ?? 0);
    finalPrice = Math.max(0, inputSelling);
    mrp = finalPrice;
    if (discountPercent > 0) {
      discountAmount = (mrp * discountPercent) / 100;
      finalPrice = Math.max(0, mrp - discountAmount);
    }
  }

  const minSellingPrice = Math.max(0, Number(product.minimumSellingPrice || 0));
  if (minSellingPrice > 0 && finalPrice < minSellingPrice) {
    finalPrice = Math.min(mrp > 0 ? mrp : minSellingPrice, minSellingPrice);
    discountAmount = Math.max(0, mrp - finalPrice);
  }

  // Final MRP ceiling enforcement
  if (mrp > 0 && finalPrice > mrp) {
    finalPrice = mrp;
    discountAmount = 0;
  }

  finalPrice = Math.round(finalPrice);
  discountAmount = Math.round(discountAmount);

  const profitAmount = finalPrice - landedCost;
  const profitMargin = finalPrice > 0 ? (profitAmount / finalPrice) : 0;

  return {
    purchasePrice,
    additionalCost,
    landedCost,
    targetProfitMargin: targetMargin,
    recommendedSellingPrice: Math.round(recommendedSellingPrice),
    sellingPrice: finalPrice,
    discountPercent,
    discountAmount,
    minimumSellingPrice: minSellingPrice,
    finalPrice,
    profitAmount,
    profitMargin,
  };
};

/**
 * Calculates effective price and active discount based on server time (Customer API backward compatibility)
 */
export const calculateEffectiveProductPrice = (product: IProduct | any): PriceCalculationResult => {
  const mrp = Number(product.MRP ?? product.mrp ?? product.marketPrice ?? product.sellingPrice ?? product.price ?? 0);
  const basePrice = Number(product.finalPrice ?? product.sellingPrice ?? product.price ?? mrp);
  const marketPrice = mrp > 0 ? mrp : basePrice;
  const now = new Date();

  let discountActive = false;
  let discountAmount = Number(product.discountAmount || 0);
  let discountPercentage = Number(product.discountPercent || 0);

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
        discountAmount = Number(product.discountValue);
        discountPercentage = marketPrice > 0 ? Math.round((discountAmount / marketPrice) * 100) : 0;
      } else {
        discountPercentage = Number(product.discountValue);
        discountAmount = Math.round((marketPrice * product.discountValue) / 100);
      }
    }
  } else if (discountPercentage > 0 || (marketPrice > basePrice)) {
    discountActive = true;
    if (discountPercentage <= 0 && marketPrice > 0) {
      discountPercentage = Math.round(((marketPrice - basePrice) / marketPrice) * 100);
    }
    discountAmount = Math.max(0, marketPrice - basePrice);
  }

  const roundedBase = Math.round(basePrice);
  const roundedMarket = Math.round(marketPrice);
  const roundedDiscount = Math.round(discountAmount);

  return {
    basePrice: roundedBase,
    sellingPrice: roundedBase,
    effectiveUnitPrice: roundedBase,
    marketPrice: roundedMarket,
    priceSource: product.priceSource || 'Government Price Monitoring System',
    priceUpdatedAt: product.priceUpdatedAt || new Date(),
    discountActive,
    discountAmount: roundedDiscount,
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
