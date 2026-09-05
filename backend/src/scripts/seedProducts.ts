import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import dns from 'dns';
import { User } from '../models/User.js';
import { Shop } from '../models/Shop.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { calculateProductPricing } from '../services/priceSyncService.js';

import { validateAndFixProductSeedJson } from './validateProductSeedJson.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pakkam_db';

// Category icon map helper
const CATEGORY_ICONS: Record<string, string> = {
  vegetables: '🥬',
  fruits: '🍎',
  groceries: '🌾',
  grocery: '🌾',
  'rice & grains': '🍚',
  flours: '🌾',
  pulses: '🫘',
  spices: '🌶️',
  dairy: '🥛',
  eggs: '🥚',
  bakery: '🍞',
  snacks: '🍿',
  beverages: '🧃',
  cleaning: '🧹',
  'personal care': '🧴',
  'household essentials': '🏡',
  household: '🏡',
};

export const seedProductsOnly = async (shouldCloseConnection = false) => {
  try {
    console.log('[SeedProducts] Validating product seed JSON...');
    validateAndFixProductSeedJson();

    if (mongoose.connection.readyState !== 1) {
      console.log('[SeedProducts] Connecting to MongoDB...');
      try {
        await mongoose.connect(MONGODB_URI);
      } catch (primaryErr) {
        console.warn('[SeedProducts] Primary MONGODB_URI failed, falling back to local MongoDB mongodb://127.0.0.1:27017/pakkam_db');
        await mongoose.connect('mongodb://127.0.0.1:27017/pakkam_db');
      }
      console.log('[SeedProducts] Connected.');
    }

    // 1. Locate product seed JSON file (prioritize backend/data/product.seed.json)
    const candidatePaths = [
      path.resolve(process.cwd(), 'data/product.seed.json'),
      path.resolve(process.cwd(), 'src/data/products.seed.json'),
      path.resolve(process.cwd(), 'data/products.seed.json'),
    ];

    let seedFilePath = '';
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        seedFilePath = p;
        break;
      }
    }

    if (!seedFilePath) {
      throw new Error(`Product seed file not found in paths: ${candidatePaths.join(', ')}`);
    }

    console.log(`[SeedProducts] Reading seed file from: ${seedFilePath}`);
    const rawData = fs.readFileSync(seedFilePath, 'utf-8');
    const rawProducts: any[] = JSON.parse(rawData);

    if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
      throw new Error('[SeedProducts] Invalid or empty product array in seed JSON');
    }

    console.log(`[SeedProducts] Found ${rawProducts.length} product records to process.`);

    // 2. Get or create default seller shop
    let sellerUser = await User.findOne({ role: 'SELLER' });
    if (!sellerUser) {
      sellerUser = await User.create({
        name: 'Murugan (Seller)',
        email: 'seller@pakkam.test',
        phone: '9876543211',
        password: 'Password123!',
        role: 'SELLER',
        isActive: true,
      });
    }

    let defaultShop = await Shop.findOne({ owner: sellerUser._id });
    if (!defaultShop) {
      defaultShop = await Shop.create({
        name: 'Namma Fresh Vegetable Market',
        description: 'Direct farm-fresh vegetables and groceries daily.',
        owner: sellerUser._id,
        phone: '9876543211',
        address: 'No. 12, Canal Bank Road, Adyar, Chennai',
        rating: 4.8,
        reviewCount: 340,
        isOpen: true,
        deliveryRadius: 5,
        minimumOrder: 100,
        status: 'APPROVED',
      });
      sellerUser.shop = defaultShop._id;
      await sellerUser.save();
    }

    // 3. Ensure all categories from seed JSON exist in Category collection
    const categoryNameMap = new Map<string, any>();
    const existingCats = await Category.find({});
    for (const c of existingCats) {
      categoryNameMap.set(c.name.toLowerCase().trim(), c);
      categoryNameMap.set(c.slug.toLowerCase().trim(), c);
    }

    let catOrder = existingCats.length + 1;

    for (const p of rawProducts) {
      let catName = (p.category || 'Vegetables').trim();
      // Normalize 'Grocery' to 'Groceries'
      if (catName.toLowerCase() === 'grocery') catName = 'Groceries';

      const normKey = catName.toLowerCase();
      if (!categoryNameMap.has(normKey)) {
        const slug = normKey.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const icon = CATEGORY_ICONS[normKey] || '🛒';
        const newCat = await Category.create({
          name: catName,
          slug,
          icon,
          image: `https://images.unsplash.com/photo-1542838132-92c53300491e?w=500`,
          order: catOrder++,
          isActive: true,
        });
        categoryNameMap.set(normKey, newCat);
        categoryNameMap.set(slug, newCat);
        console.log(`[SeedProducts] Auto-created Category: ${catName} (${slug})`);
      }
    }

    // 4. Upsert Products idempotently (matching by slug / name+unit)
    let insertedCount = 0;
    let updatedCount = 0;

    for (const raw of rawProducts) {
      let catName = (raw.category || 'Vegetables').trim();
      if (catName.toLowerCase() === 'grocery') catName = 'Groceries';
      const catObj = categoryNameMap.get(catName.toLowerCase()) || categoryNameMap.get('vegetables');

      const pricing = calculateProductPricing({
        purchasePrice: raw.purchasePrice || 0,
        additionalCost: raw.additionalCost || 0,
        mrp: raw.mrp || raw.MRP || 0,
        sellingPrice: raw.sellingPrice || raw.price || 0,
        discountPercent: raw.discountPercent || 0,
        minimumSellingPrice: raw.minimumSellingPrice ?? 0,
        targetProfitMargin: raw.targetProfitMargin ?? 0.20,
      });

      const prodName = String(raw.name || '').trim();
      const prodUnit = String(raw.unit || '1 kg').trim();
      const slug = (prodName + '-' + prodUnit)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const imgUrl = raw.image && raw.image.startsWith('http')
        ? raw.image
        : 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600';

      const updatePayload = {
        name: prodName,
        name_en: prodName,
        slug,
        category: catObj._id,
        unit: prodUnit,
        availableUnits: [prodUnit],
        availableQuantity: raw.stock !== undefined ? raw.stock : 100,
        stockStatus: (raw.stock !== undefined ? raw.stock : 100) > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
        images: [imgUrl],
        shop: defaultShop._id,
        brand: raw.brand || 'Local Fresh',
        isActive: true,
        isAvailable: (raw.stock !== undefined ? raw.stock : 100) > 0 && (raw.isAvailable !== undefined ? raw.isAvailable : true),

        // Customer prices
        price: pricing.finalPrice,
        sellingPrice: pricing.finalPrice,
        marketPrice: raw.mrp || pricing.finalPrice,
        costPrice: pricing.landedCost,

        // Financial fields
        purchasePrice: raw.purchasePrice || 0,
        additionalCost: raw.additionalCost || 0,
        landedCost: pricing.landedCost,
        MRP: raw.mrp || pricing.finalPrice,
        discountPercent: pricing.discountPercent,
        discountAmount: pricing.discountAmount,
        finalPrice: pricing.finalPrice,
        minimumSellingPrice: raw.minimumSellingPrice ?? 0,
        targetProfitMargin: raw.targetProfitMargin ?? 0.20,
        profitAmount: pricing.profitAmount,
        profitMargin: pricing.profitMargin,
      };

      const existingProd = await Product.findOne({ slug });
      if (existingProd) {
        await Product.updateOne({ _id: existingProd._id }, { $set: updatePayload });
        updatedCount++;
      } else {
        await Product.create({ ...updatePayload, slug });
        insertedCount++;
      }
    }

    console.log(`[SeedProducts Completed] Inserted: ${insertedCount}, Updated: ${updatedCount}, Total Processed: ${rawProducts.length}`);
  } catch (error) {
    console.error('[SeedProducts Failed]', error);
    throw error;
  }
};

// Execute if run directly
if (process.argv[1] && process.argv[1].includes('seedProducts')) {
  seedProductsOnly()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
