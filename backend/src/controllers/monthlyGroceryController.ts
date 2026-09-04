import { Response } from 'express';
import { MonthlyGroceryList } from '../models/MonthlyGroceryList.js';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';
import { AuthRequest } from '../middleware/auth.js';
import { getUnitMultiplier } from './cartController.js';

// Predefined Family Size Starter Templates (No AI required)
export const FAMILY_TEMPLATES = [
  {
    familySize: 'Family of 2',
    description: 'Ideal monthly starter list for 2 people',
    items: [
      { name: 'Ponni Rice', quantity: 5, unit: '1 kg' },
      { name: 'Toor Dal', quantity: 1, unit: '1 kg' },
      { name: 'Sunflower Oil', quantity: 2, unit: '1 L' },
      { name: 'White Sugar', quantity: 1, unit: '1 kg' },
      { name: 'Crystal Salt', quantity: 1, unit: '1 kg' },
      { name: 'Aashirvaad Atta', quantity: 2, unit: '1 kg' },
      { name: 'Farm Fresh Milk', quantity: 15, unit: '1 L' },
      { name: 'Farm Eggs Pack', quantity: 1, unit: '1 pc' },
    ],
  },
  {
    familySize: 'Family of 4',
    description: 'Ideal monthly starter list for 4 people',
    items: [
      { name: 'Ponni Rice', quantity: 10, unit: '1 kg' },
      { name: 'Toor Dal', quantity: 2, unit: '1 kg' },
      { name: 'Sunflower Oil', quantity: 3, unit: '1 L' },
      { name: 'White Sugar', quantity: 2, unit: '1 kg' },
      { name: 'Crystal Salt', quantity: 2, unit: '1 kg' },
      { name: 'Aashirvaad Atta', quantity: 5, unit: '1 kg' },
      { name: 'Moong Dal', quantity: 1, unit: '1 kg' },
      { name: 'Farm Fresh Milk', quantity: 30, unit: '1 L' },
      { name: 'Farm Eggs Pack', quantity: 2, unit: '1 pc' },
      { name: 'Red Chilli Powder', quantity: 1, unit: '250 g' },
      { name: 'Turmeric Powder', quantity: 1, unit: '250 g' },
    ],
  },
  {
    familySize: 'Family of 6',
    description: 'Ideal monthly starter list for 6 people',
    items: [
      { name: 'Ponni Rice', quantity: 15, unit: '1 kg' },
      { name: 'Toor Dal', quantity: 3, unit: '1 kg' },
      { name: 'Sunflower Oil', quantity: 5, unit: '1 L' },
      { name: 'White Sugar', quantity: 3, unit: '1 kg' },
      { name: 'Crystal Salt', quantity: 3, unit: '1 kg' },
      { name: 'Aashirvaad Atta', quantity: 10, unit: '1 kg' },
      { name: 'Moong Dal', quantity: 2, unit: '1 kg' },
      { name: 'Urad Dal', quantity: 2, unit: '1 kg' },
      { name: 'Farm Fresh Milk', quantity: 45, unit: '1 L' },
      { name: 'Farm Eggs Pack', quantity: 3, unit: '1 pc' },
      { name: 'Tea Powder', quantity: 2, unit: '500 g' },
    ],
  },
];

export const getTemplates = async (req: AuthRequest, res: Response) => {
  res.json({ success: true, templates: FAMILY_TEMPLATES });
};

export const getMonthlyLists = async (req: AuthRequest, res: Response) => {
  try {
    const lists = await MonthlyGroceryList.find({ user: req.user?._id }).sort({ updatedAt: -1 });
    res.json({ success: true, count: lists.length, lists });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMonthlyListById = async (req: AuthRequest, res: Response) => {
  try {
    const list = await MonthlyGroceryList.findOne({ _id: req.params.id, user: req.user?._id }).populate({
      path: 'items.product',
      populate: { path: 'shop category' },
    });

    if (!list) {
      return res.status(404).json({ success: false, message: 'Monthly grocery list not found' });
    }

    res.json({ success: true, list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMonthlyList = async (req: AuthRequest, res: Response) => {
  try {
    const { name, month, familySize } = req.body;
    let itemsToInsert: any[] = [];

    // If template selected, match products in DB
    if (familySize && familySize !== 'Custom') {
      const template = FAMILY_TEMPLATES.find((t) => t.familySize === familySize);
      if (template) {
        for (const tItem of template.items) {
          const product = await Product.findOne({
            name: { $regex: tItem.name, $options: 'i' },
            isActive: true,
          });

          if (product) {
            itemsToInsert.push({
              product: product._id,
              name: product.name,
              quantity: tItem.quantity,
              unit: tItem.unit || product.unit,
              priceAtCreation: product.discountPrice || product.price,
              isAvailable: product.stockStatus !== 'OUT_OF_STOCK',
            });
          }
        }
      }
    }

    const estimatedTotal = itemsToInsert.reduce((sum, item) => sum + item.priceAtCreation * item.quantity, 0);

    const list = await MonthlyGroceryList.create({
      user: req.user?._id,
      name: name || `${month || 'Monthly'} Grocery List`,
      month: month || 'Current Month',
      familySize: familySize || 'Custom',
      items: itemsToInsert,
      estimatedTotal,
    });

    res.status(201).json({ success: true, list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMonthlyList = async (req: AuthRequest, res: Response) => {
  try {
    const { name, month, items } = req.body;
    const list = await MonthlyGroceryList.findOne({ _id: req.params.id, user: req.user?._id });

    if (!list) {
      return res.status(404).json({ success: false, message: 'Monthly grocery list not found' });
    }

    if (name) list.name = name;
    if (month) list.month = month;
    if (items) {
      list.items = items;
      list.estimatedTotal = items.reduce((sum: number, item: any) => sum + (item.priceAtCreation || 0) * item.quantity, 0);
    }

    await list.save();
    res.json({ success: true, list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addItemToMonthlyList = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity = 1, unit } = req.body;
    const list = await MonthlyGroceryList.findOne({ _id: req.params.id, user: req.user?._id });

    if (!list) {
      return res.status(404).json({ success: false, message: 'Monthly grocery list not found' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const itemPrice = product.discountPrice || product.price;
    const selectedUnit = unit || product.unit;

    const existingIndex = list.items.findIndex((item) => item.product.toString() === productId);
    if (existingIndex > -1) {
      list.items[existingIndex].quantity += Number(quantity);
    } else {
      list.items.push({
        product: product._id,
        name: product.name,
        quantity: Number(quantity),
        unit: selectedUnit,
        priceAtCreation: itemPrice,
        isAvailable: product.stockStatus !== 'OUT_OF_STOCK',
      });
    }

    list.estimatedTotal = list.items.reduce((sum, item) => sum + item.priceAtCreation * item.quantity, 0);
    await list.save();

    res.json({ success: true, list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const duplicateMonthlyList = async (req: AuthRequest, res: Response) => {
  try {
    const originalList = await MonthlyGroceryList.findOne({ _id: req.params.id, user: req.user?._id });
    if (!originalList) {
      return res.status(404).json({ success: false, message: 'Original list not found' });
    }

    const { newName, newMonth } = req.body;

    const newList = await MonthlyGroceryList.create({
      user: req.user?._id,
      name: newName || `Copy of ${originalList.name}`,
      month: newMonth || originalList.month,
      familySize: originalList.familySize,
      items: originalList.items,
      estimatedTotal: originalList.estimatedTotal,
    });

    res.status(201).json({ success: true, list: newList });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addAllToCart = async (req: AuthRequest, res: Response) => {
  try {
    const list = await MonthlyGroceryList.findOne({ _id: req.params.id, user: req.user?._id });
    if (!list) {
      return res.status(404).json({ success: false, message: 'Monthly list not found' });
    }

    let cart = await Cart.findOne({ user: req.user?._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user?._id, items: [] });
    }

    let addedCount = 0;
    let unavailableCount = 0;
    const unavailableItems: string[] = [];

    for (const item of list.items) {
      const product = await Product.findById(item.product);
      if (product && product.isActive && product.stockStatus !== 'OUT_OF_STOCK') {
        const selectedUnit = item.unit || product.unit;
        const unitMultiplier = getUnitMultiplier(selectedUnit);
        const itemPrice = product.discountPrice || product.price;

        const existingIndex = cart.items.findIndex(
          (ci) => ci.product.toString() === item.product.toString() && ci.selectedUnit === selectedUnit
        );

        if (existingIndex > -1) {
          cart.items[existingIndex].quantity += item.quantity;
        } else {
          cart.items.push({
            product: product._id,
            shop: product.shop,
            selectedUnit,
            unitMultiplier,
            quantity: item.quantity,
            price: itemPrice,
            discountPrice: product.discountPrice,
          });
        }
        addedCount++;
      } else {
        unavailableCount++;
        unavailableItems.push(item.name);
      }
    }

    await cart.save();

    let message = `Successfully added ${addedCount} items to your cart!`;
    if (unavailableCount > 0) {
      message += ` (${unavailableCount} items currently unavailable: ${unavailableItems.join(', ')})`;
    }

    res.json({
      success: true,
      message,
      addedCount,
      unavailableCount,
      unavailableItems,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMonthlyList = async (req: AuthRequest, res: Response) => {
  try {
    const list = await MonthlyGroceryList.findOneAndDelete({ _id: req.params.id, user: req.user?._id });
    if (!list) {
      return res.status(404).json({ success: false, message: 'List not found' });
    }
    res.json({ success: true, message: 'Monthly list deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
