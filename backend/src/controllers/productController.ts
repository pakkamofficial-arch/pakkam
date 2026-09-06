import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { PriceHistory } from '../models/PriceHistory.js';
import { AuthRequest } from '../middleware/auth.js';
import { calculateEffectiveProductPrice, updateProductPriceWithHistory } from '../services/priceSyncService.js';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { search, category, shop, isFreshToday, isPopular, page = 1, limit = 50 } = req.query;
    let query: any = { isActive: true };

    if (search) {
      const searchStr = String(search).trim();
      query.$or = [
        { name: { $regex: searchStr, $options: 'i' } },
        { name_en: { $regex: searchStr, $options: 'i' } },
        { name_ta: { $regex: searchStr, $options: 'i' } },
        { description: { $regex: searchStr, $options: 'i' } },
        { brand: { $regex: searchStr, $options: 'i' } },
        { sku: { $regex: searchStr, $options: 'i' } },
        { barcode: { $regex: searchStr, $options: 'i' } },
      ];
    }

    if (category) {
      let catStr = String(category).trim();
      if (catStr.toLowerCase() === 'grocery') catStr = 'Groceries';
      if (mongoose.Types.ObjectId.isValid(catStr)) {
        query.category = catStr;
      } else {
        const slug = catStr.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const matchedCats = await Category.find({
          $or: [
            { name: { $regex: `^${catStr}`, $options: 'i' } },
            { name: { $regex: catStr, $options: 'i' } },
            { slug: slug },
          ],
        });
        if (matchedCats && matchedCats.length > 0) {
          query.category = { $in: matchedCats.map((c) => c._id) };
        } else {
          query.category = null;
        }
      }
    }

    if (shop) {
      query.shop = shop;
    }

    if (isFreshToday === 'true') {
      query.isFreshToday = true;
    }

    if (isPopular === 'true') {
      query.isPopular = true;
    }

    const rawProducts = await Product.find(query)
      .populate('category')
      .populate('shop', 'name rating openingTime closingTime isOpen')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Product.countDocuments(query);

    const products = rawProducts.map((p) => {
      const pObj: any = p.toObject();
      const priceInfo = calculateEffectiveProductPrice(p);
      return {
        ...pObj,
        price: priceInfo.basePrice,
        sellingPrice: priceInfo.sellingPrice,
        effectiveUnitPrice: priceInfo.effectiveUnitPrice,
        mrp: pObj.MRP || pObj.marketPrice || priceInfo.marketPrice || priceInfo.sellingPrice,
        discountPrice: priceInfo.discountActive ? priceInfo.effectiveUnitPrice : undefined,
        discountPercent: pObj.discountPercent || priceInfo.discountPercentage || 0,
        stock: pObj.availableQuantity,
        image: (pObj.images && pObj.images.length > 0) ? pObj.images[0] : '',
        isAvailable: pObj.isAvailable !== undefined ? pObj.isAvailable : true,
        marketPrice: priceInfo.marketPrice,
        priceSource: priceInfo.priceSource,
        priceUpdatedAt: priceInfo.priceUpdatedAt,
        discountActive: priceInfo.discountActive,
        discountAmount: priceInfo.discountAmount,
        discountPercentage: priceInfo.discountPercentage,
      };
    });

    res.json({
      success: true,
      count: products.length,
      total,
      products,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = await Product.findById(req.params.id)
      .populate('category')
      .populate('shop', 'name phone address rating isOpen logo coverImage');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const pObj: any = product.toObject();
    const priceInfo = calculateEffectiveProductPrice(product);

    res.json({
      success: true,
      product: {
        ...pObj,
        price: priceInfo.basePrice,
        sellingPrice: priceInfo.sellingPrice,
        effectiveUnitPrice: priceInfo.effectiveUnitPrice,
        mrp: pObj.MRP || pObj.marketPrice || priceInfo.marketPrice || priceInfo.sellingPrice,
        discountPrice: priceInfo.discountActive ? priceInfo.effectiveUnitPrice : undefined,
        discountPercent: pObj.discountPercent || priceInfo.discountPercentage || 0,
        stock: pObj.availableQuantity,
        image: (pObj.images && pObj.images.length > 0) ? pObj.images[0] : '',
        isAvailable: pObj.isAvailable !== undefined ? pObj.isAvailable : true,
        marketPrice: priceInfo.marketPrice,
        priceSource: priceInfo.priceSource,
        priceUpdatedAt: priceInfo.priceUpdatedAt,
        discountActive: priceInfo.discountActive,
        discountAmount: priceInfo.discountAmount,
        discountPercentage: priceInfo.discountPercentage,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    Object.assign(product, req.body);
    await product.save();

    res.json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProductPrice = async (req: AuthRequest, res: Response) => {
  try {
    const { sellingPrice, marketPrice, source, reason } = req.body;
    if (sellingPrice === undefined || Number(sellingPrice) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid selling price is required' });
    }

    const updatedProduct = await updateProductPriceWithHistory(
      req.params.id,
      Number(sellingPrice),
      marketPrice !== undefined ? Number(marketPrice) : undefined,
      req.user?._id?.toString(),
      req.user?.name || 'Admin',
      source,
      reason
    );

    res.json({
      success: true,
      message: 'Product price updated successfully',
      product: updatedProduct,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPriceHistory = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    let query: any = {};
    if (productId) query.product = productId;

    const history = await PriceHistory.find(query)
      .sort({ recordedAt: -1 })
      .limit(100);

    res.json({ success: true, count: history.length, history });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product removed' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
