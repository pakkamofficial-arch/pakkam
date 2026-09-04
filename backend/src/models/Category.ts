import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  name_en?: string;
  name_ta?: string;
  slug: string;
  icon: string;
  image: string;
  order: number;
  isActive: boolean;
}

const CategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    name_en: { type: String, trim: true },
    name_ta: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    icon: { type: String, required: true },
    image: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
