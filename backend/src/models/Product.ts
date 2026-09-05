import mongoose, { Schema, Document } from 'mongoose';
import { calculateProductPricing } from '../services/priceSyncService.js';

export interface IProduct extends Document {
  name: string;
  slug?: string;
  sku?: string;
  barcode?: string;
  name_en?: string;
  name_ta?: string;
  description: string;
  description_en?: string;
  description_ta?: string;
  category: mongoose.Types.ObjectId;
  subcategory?: string;
  images: string[];
  price: number; // Pakkam selling price
  sellingPrice: number; // Pakkam selling price alias
  marketPrice?: number; // Market reference price
  costPrice?: number; // Sensitive cost price (not exposed to customers)
  priceSource?: string;
  priceUpdatedAt?: Date;
  region?: string;
  unit: string;
  unitType?: string; // kg, gram, litre, ml, piece, packet, etc.
  unitValue?: number; // base unit value e.g. 1
  availableUnits: string[];
  unitMultiplierMap?: Record<string, number>;
  availableQuantity: number; // stock quantity
  minimumOrderQuantity?: number;
  maximumOrderQuantity?: number;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  shop: mongoose.Types.ObjectId;
  brand?: string;
  isActive: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  isFreshToday?: boolean;
  discountPrice?: number;
  discountEnabled?: boolean;
  discountType?: 'PERCENTAGE' | 'FIXED';
  discountValue?: number;
  discountStartAt?: Date;
  discountEndAt?: Date;

  // STEP 1: Advanced Pricing & Cost Fields
  purchasePrice?: number;       // Direct supplier/wholesale acquisition cost (default 0)
  additionalCost?: number;      // Freight, handling, wastage, etc. (default 0)
  landedCost?: number;          // Computed: purchasePrice + additionalCost
  MRP?: number;                 // Maximum Retail Price
  discountPercent?: number;     // Discount percentage (default 0)
  discountAmount?: number;      // Discount amount in ₹ (default 0)
  finalPrice?: number;          // Computed customer price after discount
  minimumSellingPrice?: number; // Floor price threshold (default 0)
  targetProfitMargin?: number;  // Target profit margin decimal, e.g. 0.20 for 20% (default 0.20)
  profitAmount?: number;        // Computed: finalPrice - landedCost
  profitMargin?: number;        // Computed realized profit margin ratio
  isAvailable?: boolean;        // Availability toggle (default true)

  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, trim: true },
    sku: { type: String, trim: true },
    barcode: { type: String, trim: true },
    name_en: { type: String, trim: true },
    name_ta: { type: String, trim: true },
    description: { type: String, default: '' },
    description_en: { type: String, default: '' },
    description_ta: { type: String, default: '' },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: String, default: '' },
    images: [{ type: String, required: true }],
    price: { type: Number, required: true },
    sellingPrice: { type: Number },
    marketPrice: { type: Number },
    costPrice: { type: Number, select: false }, // Internal cost price, not exposed to customers
    priceSource: { type: String, default: 'Government Price Monitoring System' },
    priceUpdatedAt: { type: Date, default: Date.now },
    region: { type: String, default: 'Madurai' },
    unit: { type: String, required: true, default: '1 kg' },
    unitType: { type: String, default: 'kg' },
    unitValue: { type: Number, default: 1 },
    availableUnits: [{ type: String, required: true }],
    unitMultiplierMap: { type: Schema.Types.Mixed, default: {} },
    availableQuantity: { type: Number, required: true, default: 1000 },
    minimumOrderQuantity: { type: Number, default: 1 },
    maximumOrderQuantity: { type: Number, default: 1000 },
    stockStatus: { type: String, enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'], default: 'IN_STOCK' },
    shop: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    brand: { type: String, default: 'Local Fresh' },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isPopular: { type: Boolean, default: false },
    isFreshToday: { type: Boolean, default: false },
    discountPrice: { type: Number },
    discountEnabled: { type: Boolean, default: false },
    discountType: { type: String, enum: ['PERCENTAGE', 'FIXED'], default: 'PERCENTAGE' },
    discountValue: { type: Number, default: 0 },
    discountStartAt: { type: Date },
    discountEndAt: { type: Date },

    // STEP 1: New Pricing & Profit Fields
    purchasePrice: { type: Number, default: 0, min: 0, select: false },
    additionalCost: { type: Number, default: 0, min: 0, select: false },
    landedCost: { type: Number, default: 0, min: 0, select: false },
    MRP: { type: Number },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    discountAmount: { type: Number, default: 0, min: 0 },
    finalPrice: { type: Number, default: 0 },
    minimumSellingPrice: { type: Number, default: 0, min: 0, select: false },
    targetProfitMargin: { type: Number, default: 0.20, min: 0, max: 0.999, select: false },
    profitAmount: { type: Number, default: 0, select: false },
    profitMargin: { type: Number, default: 0, select: false },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProductSchema.pre('save', function (next) {
  const doc: any = this;

  // Validation sanitization for pricing fields
  if (typeof doc.purchasePrice === 'number' && doc.purchasePrice < 0) doc.purchasePrice = 0;
  if (typeof doc.additionalCost === 'number' && doc.additionalCost < 0) doc.additionalCost = 0;
  if (typeof doc.discountPercent === 'number') {
    if (doc.discountPercent < 0) doc.discountPercent = 0;
    if (doc.discountPercent > 100) doc.discountPercent = 100;
  }
  if (typeof doc.targetProfitMargin === 'number') {
    if (doc.targetProfitMargin < 0) doc.targetProfitMargin = 0;
    if (doc.targetProfitMargin >= 1) doc.targetProfitMargin = 0.999;
  }
  if (typeof doc.minimumSellingPrice === 'number' && doc.minimumSellingPrice < 0) doc.minimumSellingPrice = 0;

  // Use centralized calculateProductPricing
  const pricing = calculateProductPricing({
    purchasePrice: doc.purchasePrice,
    additionalCost: doc.additionalCost,
    targetProfitMargin: doc.targetProfitMargin,
    sellingPrice: doc.sellingPrice || doc.price,
    price: doc.price || doc.sellingPrice,
    mrp: doc.MRP || doc.mrp || doc.marketPrice,
    MRP: doc.MRP || doc.mrp || doc.marketPrice,
    marketPrice: doc.marketPrice || doc.MRP || doc.mrp,
    discountPercent: doc.discountPercent,
    discountAmount: doc.discountAmount,
    discountEnabled: doc.discountEnabled,
    discountType: doc.discountType,
    discountValue: doc.discountValue,
    minimumSellingPrice: doc.minimumSellingPrice,
  });

  doc.landedCost = pricing.landedCost;
  doc.costPrice = pricing.landedCost;
  doc.MRP = doc.MRP || doc.mrp || doc.marketPrice || pricing.sellingPrice;
  doc.marketPrice = doc.MRP;
  doc.finalPrice = pricing.finalPrice;
  doc.sellingPrice = pricing.finalPrice;
  doc.price = pricing.finalPrice;
  doc.discountPrice = pricing.finalPrice;
  doc.discountPercent = pricing.discountPercent;
  doc.discountAmount = pricing.discountAmount;
  doc.profitAmount = pricing.profitAmount;
  doc.profitMargin = pricing.profitMargin;

  // Inventory Stock & Availability Synchronization Rule:
  // availableQuantity <= 0 -> stockStatus = OUT_OF_STOCK, isAvailable = false
  const qty = Number(doc.availableQuantity !== undefined ? doc.availableQuantity : 1000);
  if (qty <= 0) {
    doc.availableQuantity = 0;
    doc.stockStatus = 'OUT_OF_STOCK';
    doc.isAvailable = false;
  } else if (qty <= 25) {
    doc.stockStatus = 'LOW_STOCK';
    if (doc.isAvailable === undefined) doc.isAvailable = true;
  } else {
    doc.stockStatus = 'IN_STOCK';
    if (doc.isAvailable === undefined) doc.isAvailable = true;
  }

  if (!doc.slug && doc.name && typeof doc.name === 'string') {
    doc.slug = doc.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }

  next();
});

ProductSchema.index({ name: 'text', name_en: 'text', name_ta: 'text', description: 'text', brand: 'text', sku: 'text', barcode: 'text' });
ProductSchema.index({ category: 1, isActive: 1, region: 1 });
ProductSchema.index({ priceUpdatedAt: -1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
