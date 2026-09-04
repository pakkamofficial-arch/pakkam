import mongoose, { Schema, Document } from 'mongoose';

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
  },
  { timestamps: true }
);

ProductSchema.pre('save', function (next) {
  const doc: any = this;
  if (!doc.sellingPrice) {
    doc.sellingPrice = doc.price;
  } else if (doc.sellingPrice !== doc.price) {
    doc.price = doc.sellingPrice;
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
