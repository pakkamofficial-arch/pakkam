import { AppSetting } from '../models/AppSetting.js';
import { Product } from '../models/Product.js';

export interface OrderProfitBreakdown {
  orderRevenue: number;
  productLandedCost: number;
  discountGiven: number;
  petrolCost: number;
  paymentGatewayFee: number;
  packagingCost: number;
  netOrderProfit: number;
  profitMargin: number;
}

export const calculateOrderNetProfit = async (order: any): Promise<OrderProfitBreakdown> => {
  // Fetch Admin Order Profit Settings
  let petrolCostPerKm = 6;
  let avgDeliveryDistanceKm = 3;
  let packagingCostEst = 5;

  try {
    const profitSetting = await AppSetting.findOne({ key: 'order_profit_settings' });
    if (profitSetting && profitSetting.value) {
      petrolCostPerKm = Number(profitSetting.value.petrolCostPerKm ?? 6);
      avgDeliveryDistanceKm = Number(profitSetting.value.avgDeliveryDistanceKm ?? 3);
      packagingCostEst = Number(profitSetting.value.packagingCostEst ?? 5);
    }
  } catch (e) {
    // Fallback to default values
  }

  const orderRevenue = Number(order.total || 0);

  let productLandedCost = 0;
  let itemsDiscount = 0;

  if (Array.isArray(order.items)) {
    for (const item of order.items) {
      const qty = Number(item.quantity || 1);
      let prod = item.product || {};

      let landedCost = Number(
        prod.landedCost ??
        (prod.purchasePrice !== undefined || prod.additionalCost !== undefined
          ? Number(prod.purchasePrice || 0) + Number(prod.additionalCost || 0)
          : undefined) ??
        prod.costPrice
      );

      if (isNaN(landedCost) || landedCost <= 0) {
        const productId = prod._id || (typeof item.product === 'string' || typeof item.product === 'object' ? item.product : null);
        if (productId) {
          try {
            const fetchedProd = await Product.findById(productId).select('+landedCost +purchasePrice +additionalCost +costPrice');
            if (fetchedProd) {
              const pPrice = Number(fetchedProd.purchasePrice || 0);
              const aCost = Number(fetchedProd.additionalCost || 0);
              const calcLanded = pPrice + aCost;
              landedCost = fetchedProd.landedCost ? Number(fetchedProd.landedCost) : (calcLanded > 0 ? calcLanded : Number(fetchedProd.costPrice || 0));
            }
          } catch (err) {
            // silent catch
          }
        }
      }

      if (isNaN(landedCost) || landedCost < 0) landedCost = 0;
      productLandedCost += landedCost * qty;

      const itemDisc = Number(prod.discountAmount || 0);
      itemsDiscount += itemDisc * qty;
    }
  }

  const discountGiven = itemsDiscount + Number(order.discount || 0);

  // Delivery/Petrol Cost = petrolCostPerKm * distance
  const distance = Number(order.deliveryDistanceKm || avgDeliveryDistanceKm || 3);
  const petrolCost = petrolCostPerKm * distance;

  // Payment Gateway Fee = ~2% if online paid
  const isPaidOnline = order.paymentStatus === 'PAID' || order.paymentMethod === 'ONLINE' || order.paymentMethod === 'RAZORPAY' || order.paymentMethod === 'UPI' || order.paymentMethod === 'CARD';
  const paymentGatewayFee = isPaidOnline ? Math.round(orderRevenue * 0.02 * 100) / 100 : 0;

  const packagingCost = packagingCostEst;

  const netOrderProfit = Math.round((orderRevenue - productLandedCost - petrolCost - paymentGatewayFee - packagingCost) * 100) / 100;
  const profitMargin = orderRevenue > 0 ? Math.round((netOrderProfit / orderRevenue) * 10000) / 10000 : 0;

  return {
    orderRevenue,
    productLandedCost: Math.round(productLandedCost * 100) / 100,
    discountGiven,
    petrolCost,
    paymentGatewayFee,
    packagingCost,
    netOrderProfit,
    profitMargin,
  };
};
