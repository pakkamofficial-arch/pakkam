import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { User } from '../models/User.js';
import { Shop } from '../models/Shop.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { AppSetting } from '../models/AppSetting.js';
import { Coupon } from '../models/Coupon.js';
import { Address } from '../models/Address.js';
import { MonthlyGroceryList } from '../models/MonthlyGroceryList.js';
import { DeliveryZone } from '../models/DeliveryZone.js';
import { DeliveryPerson } from '../models/DeliveryPerson.js';
import { calculateProductPricing } from '../services/priceSyncService.js';

import dns from 'dns';

dotenv.config();

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const seedDataPath = path.resolve(process.cwd(), 'data/product.seed.json');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pakkam_db';

const seed = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    try {
      await mongoose.connect(MONGODB_URI);
    } catch (primaryErr) {
      console.warn('[Seed] Primary MONGODB_URI failed, connecting to local MongoDB fallback...');
      await mongoose.connect('mongodb://127.0.0.1:27017/pakkam_db');
    }
    console.log('[Seed] Connected.');

    // Safely drop stale/obsolete indexes if present
    try {
      await User.collection.dropIndexes();
      console.log('[Seed] Dropped old indexes on User collection.');
    } catch (e) {
      // Ignore if collection or index doesn't exist yet
    }

    // Clear existing collections (Wipe-and-reseed policy for dev)
    await User.deleteMany({});
    await Shop.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await AppSetting.deleteMany({});
    await Coupon.deleteMany({});
    await Address.deleteMany({});
    await MonthlyGroceryList.deleteMany({});

    // Sync Mongoose indexes with schema definition
    await User.syncIndexes();

    console.log('[Seed] Cleared old collections and synced indexes.');

    // 1. Create Users
    const customerUser = await User.create({
      name: 'Ramesh Kumar',
      email: 'customer@pakkam.test',
      phone: '9876543210',
      password: 'Password123!',
      role: 'CUSTOMER',
      isActive: true,
    });

    const sellerUser = await User.create({
      name: 'Murugan (Seller)',
      email: 'seller@pakkam.test',
      phone: '9876543211',
      password: 'Password123!',
      role: 'SELLER',
      isActive: true,
    });

    const deliveryUser = await User.create({
      name: 'Karthik (Rider)',
      email: 'delivery@pakkam.test',
      phone: '9876543212',
      password: 'Password123!',
      role: 'DELIVERY',
      isActive: true,
    });

    console.log('[Seed] Demo accounts created:');
    console.log(' - Customer: customer@pakkam.test / Password123!');
    console.log(' - Seller: seller@pakkam.test / Password123!');
    console.log(' - Delivery: delivery@pakkam.test / Password123!');

    // 2. Create Default Address for Customer
    await Address.create({
      user: customerUser._id,
      name: 'Ramesh Kumar',
      phone: '9876543210',
      houseFlat: 'Plot No. 42, Flat 2B',
      street: 'Gandhi Main Road',
      area: 'Adyar',
      city: 'Chennai',
      pincode: '600020',
      landmark: 'Near Bus Depot',
      isDefault: true,
      type: 'HOME',
    });

    // 3. Create App Settings (Configurable Delivery Tiers & Order Profit Breakdown Settings)
    await AppSetting.create({
      key: 'delivery_fee_tiers',
      value: {
        tier1Threshold: 299,
        tier1Fee: 30,
        tier2Threshold: 499,
        tier2Fee: 20,
        freeThreshold: 500,
      },
      description: 'Dynamic delivery fee tiers: <299 => 30, 299-499 => 20, >=500 => Free',
    });

    // Order Profit Breakdown Admin Settings (petrol cost per km, avg distance, packaging cost)
    await AppSetting.create({
      key: 'order_profit_settings',
      value: {
        petrolCostPerKm: 6,
        avgDeliveryDistanceKm: 3,
        packagingCostEst: 5,
      },
      description: 'Admin Order Net Profit calculation settings: petrol cost/km, estimated delivery distance, flat packaging cost',
    });

    // 4. Create Coupons
    await Coupon.create([
      {
        code: 'PAKKAM100',
        description: 'Flat ₹100 OFF on orders above ₹500',
        discountType: 'FLAT',
        discountValue: 100,
        minimumOrder: 500,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        code: 'FRESH50',
        description: '20% OFF up to ₹50 on fresh vegetables',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minimumOrder: 200,
        maximumDiscount: 50,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    ]);

    // 5. Create Categories
    const categoriesData = [
      { name: 'Vegetables', slug: 'vegetables', icon: '🥬', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500', order: 1 },
      { name: 'Fruits', slug: 'fruits', icon: '🍎', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500', order: 2 },
      { name: 'Rice & Grains', slug: 'rice-grains', icon: '🍚', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', order: 3 },
      { name: 'Dal & Pulses', slug: 'dal-pulses', icon: '🫘', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500', order: 4 },
      { name: 'Oil & Ghee', slug: 'oil-ghee', icon: '🪔', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500', order: 5 },
      { name: 'Spices & Masala', slug: 'spices', icon: '🌶️', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', order: 6 },
      { name: 'Dairy & Curd', slug: 'dairy', icon: '🥛', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500', order: 7 },
      { name: 'Eggs', slug: 'eggs', icon: '🥚', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500', order: 8 },
      { name: 'Bakery & Bread', slug: 'bakery', icon: '🍞', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500', order: 9 },
      { name: 'Snacks & Biscuits', slug: 'snacks', icon: '🍪', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500', order: 10 },
      { name: 'Beverages & Tea', slug: 'beverages', icon: '🧃', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500', order: 11 },
      { name: 'Cleaning Essentials', slug: 'cleaning', icon: '🧹', image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500', order: 12 },
      { name: 'Personal Care', slug: 'personal-care', icon: '🧴', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500', order: 13 },
      { name: 'Household Needs', slug: 'household', icon: '🏡', image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500', order: 14 },
    ];

    const categories = await Category.insertMany(categoriesData);
    const catMap: Record<string, any> = {};
    categories.forEach((c) => {
      catMap[c.slug] = c;
      catMap[c.name.toLowerCase()] = c;
    });

    // 6. Create Shops
    const shopsData = [
      {
        name: 'Namma Fresh Vegetable Market',
        description: 'Direct farm-fresh vegetables and fruits daily.',
        owner: sellerUser._id,
        phone: '9876543211',
        address: 'No. 12, Canal Bank Road, Adyar, Chennai',
        rating: 4.8,
        reviewCount: 340,
        logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300',
        coverImage: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800',
        isOpen: true,
        deliveryRadius: 5,
        minimumOrder: 100,
        status: 'APPROVED',
      },
      {
        name: 'Sri Lakshmi Provision Stores',
        description: 'All monthly groceries, rice, oil, pulses & spices.',
        owner: sellerUser._id,
        phone: '9876543211',
        address: 'No. 45, LB Road, Thiruvanmiyur, Chennai',
        rating: 4.6,
        reviewCount: 215,
        logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300',
        coverImage: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800',
        isOpen: true,
        deliveryRadius: 7,
        minimumOrder: 150,
        status: 'APPROVED',
      },
    ];

    const shops = await Shop.insertMany(shopsData);
    const shopFresh = shops[0];

    // Link shop to seller user
    sellerUser.shop = shopFresh._id;
    await sellerUser.save();

    // 7. Load 100-Product Starter Dataset from JSON file & Seed using calculateProductPricing
    const rawProductsData: any[] = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));

    const productsToInsert = rawProductsData.map((raw: any) => {
      const pricing = calculateProductPricing({
        purchasePrice: raw.purchasePrice,
        additionalCost: raw.additionalCost,
        sellingPrice: raw.sellingPrice,
        discountPercent: raw.discountPercent,
        minimumSellingPrice: raw.minimumSellingPrice ?? 0,
        targetProfitMargin: raw.targetProfitMargin ?? 0.20,
      });

      // Find matching category by name or fallback to vegetables
      const catKey = String(raw.category || '').toLowerCase();
      const matchedCat = catMap[catKey] || categories.find((c) => c.name.toLowerCase().includes(catKey)) || categories[0];

      return {
        name: raw.name,
        name_en: raw.name,
        name_ta: raw.name_ta || '',
        category: matchedCat._id,
        unit: raw.unit || '1 kg',
        availableUnits: [raw.unit || '1 kg'],
        availableQuantity: raw.stock !== undefined ? raw.stock : 100,
        stockStatus: (raw.stock !== undefined ? raw.stock : 100) > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
        images: [raw.image || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600'],
        shop: shopFresh._id,
        brand: 'Local Fresh',
        isActive: true,
        isAvailable: raw.isAvailable !== undefined ? raw.isAvailable : true,

        // Existing customer price fields (backward compatible)
        price: pricing.sellingPrice,
        sellingPrice: raw.sellingPrice || pricing.sellingPrice,
        marketPrice: raw.mrp || pricing.sellingPrice,
        costPrice: pricing.landedCost,
        effectiveUnitPrice: pricing.finalPrice,

        // Step 1 Pricing & Cost Fields
        purchasePrice: raw.purchasePrice || 0,
        additionalCost: raw.additionalCost || 0,
        landedCost: pricing.landedCost,
        MRP: raw.mrp || raw.sellingPrice,
        discountPercent: raw.discountPercent || 0,
        discountAmount: pricing.discountAmount,
        finalPrice: pricing.finalPrice,
        minimumSellingPrice: raw.minimumSellingPrice ?? 0,
        targetProfitMargin: raw.targetProfitMargin ?? 0.20,
        profitAmount: pricing.profitAmount,
        profitMargin: pricing.profitMargin,
      };
    });

    const seededProducts = await Product.insertMany(productsToInsert);
    console.log(`[Seed] Successfully seeded ${seededProducts.length} products with Step 1 pricing.`);

    console.log('\n[Seed Completed Successfully]');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Failed]', error);
    process.exit(1);
  }
};

seed();
