import { Response } from 'express';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { AppSetting } from '../models/AppSetting.js';
import { AuthRequest } from '../middleware/auth.js';
import { calculateEffectiveProductPrice } from '../services/priceSyncService.js';

// Helper multiplier function for preset & custom units
export const getUnitMultiplier = (unit: string): number => {
  if (!unit) return 1;
  const clean = unit.trim().toLowerCase();

  // Presets
  if (clean === '250 g' || clean === '250g') return 0.25;
  if (clean === '500 g' || clean === '500g') return 0.5;
  if (clean === '1 kg' || clean === '1kg') return 1;
  if (clean === '2 kg' || clean === '2kg') return 2;
  if (clean === '5 kg' || clean === '5kg') return 5;
  if (clean === '10 kg' || clean === '10kg') return 10;
  if (clean === '25 kg' || clean === '25kg') return 25;
  if (clean === '50 kg' || clean === '50kg') return 50;
  if (clean === '100 kg' || clean === '100kg') return 100;
  if (clean === '250 kg' || clean === '250kg') return 250;
  if (clean === '500 kg' || clean === '500kg') return 500;
  if (clean === '1000 kg' || clean === '1000kg') return 1000;

  if (clean === '500 ml' || clean === '500ml') return 0.5;
  if (clean === '1 l' || clean === '1 litre' || clean === '1litre' || clean === '1l') return 1;
  if (clean === '2 l' || clean === '2 litre' || clean === '2litre' || clean === '2l') return 2;
  if (clean === '1 piece' || clean === '1pc' || clean === '1 pc') return 1;

  // Generic regex matching for numeric values in custom strings
  const matchKg = clean.match(/^([\d.]+)\s*kg$/);
  if (matchKg) return parseFloat(matchKg[1]);

  const matchG = clean.match(/^([\d.]+)\s*g(?:ram)?s?$/);
  if (matchG) return parseFloat(matchG[1]) / 1000;

  const matchMl = clean.match(/^([\d.]+)\s*ml$/);
  if (matchMl) return parseFloat(matchMl[1]) / 1000;

  const matchL = clean.match(/^([\d.]+)\s*(?:l|litre|liter)s?$/);
  if (matchL) return parseFloat(matchL[1]);

  const matchNum = clean.match(/^([\d.]+)/);
  if (matchNum) return parseFloat(matchNum[1]);

  return 1;
};

export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    let cart = await Cart.findOne({ user: req.user?._id }).populate({
      path: 'items.product',
      populate: { path: 'shop category' },
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user?._id, items: [] });
    }

    // Dynamic delivery fee logic from AppSetting or defaults
    const deliverySetting = await AppSetting.findOne({ key: 'delivery_fee_tiers' });
    const tiers = deliverySetting?.value || {
      tier1Threshold: 299,
      tier1Fee: 30,
      tier2Threshold: 499,
      tier2Fee: 20,
      freeThreshold: 500,
    };

    let subtotal = 0;
    let priceChanged = false;
    let priceChangeMessages: string[] = [];

    cart.items.forEach((item: any) => {
      const prod = item.product;
      let effectivePrice = item.price;

      if (prod) {
        const priceInfo = calculateEffectiveProductPrice(prod);
        effectivePrice = priceInfo.effectiveUnitPrice;

        if (item.price !== effectivePrice) {
          priceChanged = true;
          priceChangeMessages.push(
            `Price updated for ${prod.name}: was ₹${item.price}, now ₹${effectivePrice}`
          );
          item.price = effectivePrice;
        }
      }

      const unitMultiplier = item.unitMultiplier || getUnitMultiplier(item.selectedUnit);
      // Safe monetary calculation using integer paise internally
      const itemSubtotalPaise = Math.round(effectivePrice * 100) * unitMultiplier * item.quantity;
      subtotal += itemSubtotalPaise / 100;
    });

    if (priceChanged) {
      await cart.save();
    }

    let deliveryFee = 0;
    if (subtotal > 0) {
      if (subtotal < tiers.tier1Threshold) {
        deliveryFee = tiers.tier1Fee;
      } else if (subtotal <= tiers.tier2Threshold) {
        deliveryFee = tiers.tier2Fee;
      } else {
        deliveryFee = 0; // Free
      }
    }

    res.json({
      success: true,
      cart,
      subtotal: Math.round(subtotal),
      deliveryFee,
      freeDeliveryThreshold: tiers.freeThreshold,
      amountNeededForFreeDelivery: Math.max(0, tiers.freeThreshold - subtotal),
      priceChanged,
      priceChangeMessages,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, selectedUnit, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not available' });
    }

    const unitToUse = selectedUnit || product.unit;
    const unitMultiplier = getUnitMultiplier(unitToUse);

    const priceInfo = calculateEffectiveProductPrice(product);
    const itemPrice = priceInfo.effectiveUnitPrice;

    let cart = await Cart.findOne({ user: req.user?._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user?._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.selectedUnit === unitToUse
    );

    const newQuantity = existingIndex > -1 ? cart.items[existingIndex].quantity + Number(quantity) : Number(quantity);
    const requestedTotalUnits = unitMultiplier * newQuantity;

    if (product.availableQuantity !== undefined && requestedTotalUnits > product.availableQuantity) {
      const unitLabel = product.unitType || 'unit(s)';
      return res.status(400).json({
        success: false,
        message: `Only ${product.availableQuantity} ${unitLabel} is currently available.`,
      });
    }

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity = newQuantity;
      cart.items[existingIndex].price = itemPrice;
      cart.items[existingIndex].unitMultiplier = unitMultiplier;
    } else {
      cart.items.push({
        product: product._id,
        shop: product.shop,
        selectedUnit: unitToUse,
        unitMultiplier,
        quantity: Number(quantity),
        price: itemPrice,
        discountPrice: priceInfo.discountActive ? priceInfo.effectiveUnitPrice : undefined,
      });
    }

    await cart.save();
    res.json({ success: true, message: 'Item added to cart', cart });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const { itemId, quantity, selectedUnit } = req.body;

    const cart = await Cart.findOne({ user: req.user?._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex((item) => item._id?.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
      if (selectedUnit) {
        cart.items[itemIndex].selectedUnit = selectedUnit;
        cart.items[itemIndex].unitMultiplier = getUnitMultiplier(selectedUnit);
      }
    }

    await cart.save();
    res.json({ success: true, message: 'Cart updated', cart });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user?._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item._id?.toString() !== itemId);
    await cart.save();

    res.json({ success: true, message: 'Item removed from cart', cart });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const cart = await Cart.findOne({ user: req.user?._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
