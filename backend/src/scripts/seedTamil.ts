import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../models/Product.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pakkam_db';

const tamilNameMap = [
  { english: 'Tomato', tamil: 'தக்காளி' },
  { english: 'Onion', tamil: 'வெங்காயம்' },
  { english: 'Potato', tamil: 'உருளைக்கிழங்கு' },
  { english: 'Carrot', tamil: 'கேரட்' },
  { english: 'Beetroot', tamil: 'பீட்ரூட்' },
  { english: 'Brinjal', tamil: 'கத்திரிக்காய்' },
  { english: 'Ladies Finger', tamil: 'வெண்டைக்காய்' },
  { english: 'Beans', tamil: 'பீன்ஸ்' },
  { english: 'Cabbage', tamil: 'முட்டைக்கோஸ்' },
  { english: 'Cauliflower', tamil: 'காலிஃப்ளவர்' },
  { english: 'Curd', tamil: 'தயிர்' },
  { english: 'Milk', tamil: 'பால்' },
  { english: 'Paneer', tamil: 'பன்னீர்' },
  { english: 'Ghee', tamil: 'நெய்' },
  { english: 'Butter', tamil: 'வெண்ணெய்' },
  { english: 'Rice', tamil: 'அரிசி' },
  { english: 'Wheat', tamil: 'கோதுமை' },
  { english: 'Toor Dal', tamil: 'துவரம் பருப்பு' },
  { english: 'Moong Dal', tamil: 'பாசிப் பருப்பு' },
  { english: 'Urad Dal', tamil: 'உளுந்தம் பருப்பு' },
  { english: 'Oil', tamil: 'எண்ணெய்' },
  { english: 'Sugar', tamil: 'சர்க்கரை' },
  { english: 'Salt', tamil: 'உப்பு' },
  { english: 'Turmeric', tamil: 'மஞ்சள்' },
  { english: 'Ginger', tamil: 'இஞ்சி' },
  { english: 'Garlic', tamil: 'பூண்டு' },
  { english: 'Banana', tamil: 'வாழைப்பழம்' },
  { english: 'Apple', tamil: 'ஆப்பிள்' },
  { english: 'Mango', tamil: 'மாம்பழம்' },
  { english: 'Orange', tamil: 'ஆரஞ்சு' },
];

async function seedTamilNames() {
  try {
    console.log('[Seed Tamil] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed Tamil] Connected.');

    let updatedCount = 0;
    for (const item of tamilNameMap) {
      const res = await Product.updateMany(
        { name: { $regex: item.english, $options: 'i' } },
        { $set: { name_ta: item.tamil, name_en: item.english } }
      );
      if (res.modifiedCount > 0) {
        updatedCount += res.modifiedCount;
        console.log(`   ✓ Updated ${res.modifiedCount} products matching "${item.english}" with Tamil name "${item.tamil}"`);
      }
    }

    console.log(`\n🎉 TAMIL NAMES SEEDED SUCCESSFULLY! Total products updated: ${updatedCount}`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('[Seed Tamil] Error:', err);
    process.exit(1);
  }
}

seedTamilNames();
