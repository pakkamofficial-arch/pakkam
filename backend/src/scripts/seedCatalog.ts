import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/db';
import { Category } from '../models/Category';
import { Shop } from '../models/Shop';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { PriceHistory } from '../models/PriceHistory';

dotenv.config();

const categoriesData = [
  { name: 'Vegetables', name_en: 'Vegetables', name_ta: 'காய்கறிகள்', slug: 'vegetables', icon: '🥬', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500', order: 1 },
  { name: 'Leafy Vegetables', name_en: 'Leafy Vegetables', name_ta: 'கீரை வகைகள்', slug: 'leafy-vegetables', icon: '🌿', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500', order: 2 },
  { name: 'Fruits', name_en: 'Fruits', name_ta: 'பழங்கள்', slug: 'fruits', icon: '🍎', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500', order: 3 },
  { name: 'Rice', name_en: 'Rice', name_ta: 'அரிசி', slug: 'rice', icon: '🌾', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500', order: 4 },
  { name: 'Dals & Pulses', name_en: 'Dals & Pulses', name_ta: 'பருப்பு வகைகள்', slug: 'dals-pulses', icon: '🫘', image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=500', order: 5 },
  { name: 'Flour & Grains', name_en: 'Flour & Grains', name_ta: 'மாவு மற்றும் தானியங்கள்', slug: 'flour-grains', icon: '🌾', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500', order: 6 },
  { name: 'Oils', name_en: 'Oils', name_ta: 'எண்ணெய் வகைகள்', slug: 'oils', icon: '🛢️', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500', order: 7 },
  { name: 'Spices', name_en: 'Spices', name_ta: 'மசாலா வகைகள்', slug: 'spices', icon: '🌶️', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500', order: 8 },
  { name: 'Sugar & Sweeteners', name_en: 'Sugar & Sweeteners', name_ta: 'சர்க்கரை மற்றும் உப்பு', slug: 'sugar-salt', icon: '🧂', image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=500', order: 9 },
  { name: 'Breakfast', name_en: 'Breakfast', name_ta: 'காலை உணவு', slug: 'breakfast', icon: '🍞', image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=500', order: 10 },
  { name: 'Beverages', name_en: 'Beverages', name_ta: 'பானங்கள்', slug: 'beverages', icon: '🧃', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500', order: 11 },
  { name: 'Dairy', name_en: 'Dairy', name_ta: 'பால் பொருட்கள்', slug: 'dairy', icon: '🥛', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500', order: 12 },
  { name: 'Snacks', name_en: 'Snacks', name_ta: 'சிற்றுண்டி', slug: 'snacks', icon: '🍿', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500', order: 13 },
  { name: 'Household Cleaning', name_en: 'Household Cleaning', name_ta: 'வீட்டு சுத்தம்', slug: 'household-cleaning', icon: '🧹', image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=500', order: 14 },
  { name: 'Personal Care', name_en: 'Personal Care', name_ta: 'சுய பராமரிப்பு', slug: 'personal-care', icon: '🧴', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500', order: 15 },
  { name: 'Home Essentials', name_en: 'Home Essentials', name_ta: 'வீட்டு தேவைகள்', slug: 'home-essentials', icon: '🏠', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', order: 16 },
  { name: 'Baby Care', name_en: 'Baby Care', name_ta: 'குழந்தை பராமரிப்பு', slug: 'baby-care', icon: '👶', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500', order: 17 },
  { name: 'Pet Care', name_en: 'Pet Care', name_ta: 'செல்லப்பிராணி பராமரிப்பு', slug: 'pet-care', icon: '🐾', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500', order: 18 },
];

const catalogSeed = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting PAKKAM Catalog & Price Seed...');

    // 1. Ensure Default Shop & Owner User exists
    let owner = await User.findOne({ $or: [{ email: 'admin@pakkam.com' }, { phone: '9876543210' }] });
    if (!owner) {
      owner = await User.create({
        name: 'Pakkam Admin Store',
        phone: '9876543210',
        email: 'admin@pakkam.com',
        role: 'ADMIN',
      });
    }

    let shop = await Shop.findOne({ name: 'Pakkam Wholesale & Fresh Superstore' });
    if (!shop) {
      shop = await Shop.create({
        name: 'Pakkam Wholesale & Fresh Superstore',
        description: 'Fresh vegetables, fruits, groceries and household essentials',
        owner: owner._id,
        phone: '9876543210',
        address: 'Main Market Road, Madurai',
        rating: 4.9,
        reviewCount: 340,
        isOpen: true,
      });
    }

    // 2. Upsert Categories
    const categoryMap: Record<string, any> = {};
    for (const cat of categoriesData) {
      let createdCat = await Category.findOne({ slug: cat.slug });
      if (!createdCat) {
        createdCat = await Category.create(cat);
      }
      categoryMap[cat.slug] = createdCat;
    }

    // 3. Products List with realistic market prices & Pakkam selling prices
    const productsData = [
      // VEGETABLES
      { name: 'Tomato', name_en: 'Tomato', name_ta: 'தக்காளி (Thakkali)', slug: 'tomato', categorySlug: 'vegetables', marketPrice: 30, sellingPrice: 32, unit: '1 kg', unitType: 'kg', availableUnits: ['250g', '500g', '1kg', '2kg', '5kg', '10kg', '25kg', '50kg', '100kg', '250kg', '500kg', '1000kg'], availableQuantity: 5000, isFreshToday: true, isPopular: true, images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500'], brand: 'Madurai Fresh' },
      { name: 'Onion Big', name_en: 'Onion Big', name_ta: 'பெரிய வெங்காயம் (Vengayam)', slug: 'onion-big', categorySlug: 'vegetables', marketPrice: 28, sellingPrice: 30, unit: '1 kg', unitType: 'kg', availableUnits: ['500g', '1kg', '2kg', '5kg', '10kg', '25kg', '50kg', '100kg', '500kg', '1000kg'], availableQuantity: 10000, isFreshToday: true, isPopular: true, images: ['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500'], brand: 'Madurai Fresh' },
      { name: 'Small Onion', name_en: 'Small Onion', name_ta: 'சின்ன வெங்காயம் (Chinna Vengayam)', slug: 'small-onion', categorySlug: 'vegetables', marketPrice: 55, sellingPrice: 58, unit: '1 kg', unitType: 'kg', availableUnits: ['250g', '500g', '1kg', '2kg', '5kg', '10kg'], availableQuantity: 2000, isFreshToday: true, isPopular: true, images: ['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500'], brand: 'Local Farm' },
      { name: 'Potato', name_en: 'Potato', name_ta: 'உருளைக்கிழங்கு (Urulaikilangu)', slug: 'potato', categorySlug: 'vegetables', marketPrice: 35, sellingPrice: 38, unit: '1 kg', unitType: 'kg', availableUnits: ['500g', '1kg', '2kg', '5kg', '10kg', '50kg', '100kg'], availableQuantity: 4000, isPopular: true, images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500'], brand: 'Hill Fresh' },
      { name: 'Carrot', name_en: 'Carrot', name_ta: 'கேரட் (Carrot)', slug: 'carrot', categorySlug: 'vegetables', marketPrice: 45, sellingPrice: 48, unit: '1 kg', unitType: 'kg', availableUnits: ['250g', '500g', '1kg', '2kg', '5kg'], availableQuantity: 1500, isFreshToday: true, images: ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500'], brand: 'Ooty Fresh' },
      { name: 'Brinjal', name_en: 'Brinjal', name_ta: 'கத்தரிக்காய் (Kathirikai)', slug: 'brinjal', categorySlug: 'vegetables', marketPrice: 38, sellingPrice: 40, unit: '1 kg', unitType: 'kg', availableUnits: ['250g', '500g', '1kg', '2kg', '5kg'], availableQuantity: 1200, isFreshToday: true, images: ['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500'], brand: 'Local Fresh' },
      { name: 'Ladies Finger', name_en: 'Ladies Finger', name_ta: 'வெண்டைக்காய் (Vendaikkai)', slug: 'ladies-finger', categorySlug: 'vegetables', marketPrice: 42, sellingPrice: 45, unit: '1 kg', unitType: 'kg', availableUnits: ['250g', '500g', '1kg', '2kg'], availableQuantity: 800, isFreshToday: true, images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'], brand: 'Local Fresh' },
      { name: 'Beans', name_en: 'Beans', name_ta: 'பீன்ஸ் (Beans)', slug: 'beans', categorySlug: 'vegetables', marketPrice: 65, sellingPrice: 70, unit: '1 kg', unitType: 'kg', availableUnits: ['250g', '500g', '1kg', '2kg'], availableQuantity: 900, isFreshToday: true, images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500'], brand: 'Hill Fresh' },

      // LEAFY VEGETABLES
      { name: 'Coriander Leaves', name_en: 'Coriander Leaves', name_ta: 'கொத்தமல்லி (Kothamalli)', slug: 'coriander-leaves', categorySlug: 'leafy-vegetables', marketPrice: 18, sellingPrice: 20, unit: '1 bunch', unitType: 'bunch', availableUnits: ['1 bunch', '2 bunch', '5 bunch'], availableQuantity: 500, isFreshToday: true, images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500'], brand: 'Fresh Green' },
      { name: 'Mint Leaves', name_en: 'Mint Leaves', name_ta: 'புதினா (Pudhina)', slug: 'mint-leaves', categorySlug: 'leafy-vegetables', marketPrice: 12, sellingPrice: 15, unit: '1 bunch', unitType: 'bunch', availableUnits: ['1 bunch', '2 bunch', '5 bunch'], availableQuantity: 400, isFreshToday: true, images: ['https://images.unsplash.com/photo-1608683684947-f584e27f6a73?w=500'], brand: 'Fresh Green' },
      { name: 'Spinach / Palak', name_en: 'Spinach', name_ta: 'பாலக் கீரை (Palak Keerai)', slug: 'spinach', categorySlug: 'leafy-vegetables', marketPrice: 22, sellingPrice: 25, unit: '1 bunch', unitType: 'bunch', availableUnits: ['1 bunch', '2 bunch'], availableQuantity: 300, isFreshToday: true, images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500'], brand: 'Fresh Green' },

      // FRUITS
      { name: 'Banana Nendran / Robusta', name_en: 'Banana', name_ta: 'வாழைப்பழம் (Vazhaipazham)', slug: 'banana', categorySlug: 'fruits', marketPrice: 40, sellingPrice: 45, unit: '1 kg', unitType: 'kg', availableUnits: ['500g', '1kg', '2kg', '5kg'], availableQuantity: 1500, isFreshToday: true, isPopular: true, images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500'], brand: 'Farm Fresh' },
      { name: 'Apple Shimla', name_en: 'Apple Shimla', name_ta: 'ஆப்பிள் (Apple)', slug: 'apple-shimla', categorySlug: 'fruits', marketPrice: 160, sellingPrice: 175, unit: '1 kg', unitType: 'kg', availableUnits: ['500g', '1kg', '2kg', '5kg'], availableQuantity: 1000, isPopular: true, images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500'], brand: 'Shimla Fresh' },
      { name: 'Orange Nagpur', name_en: 'Orange', name_ta: 'ஆரஞ்சு (Orange)', slug: 'orange', categorySlug: 'fruits', marketPrice: 75, sellingPrice: 80, unit: '1 kg', unitType: 'kg', availableUnits: ['1kg', '2kg', '5kg'], availableQuantity: 1200, images: ['https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=500'], brand: 'Nagpur Orchards' },

      // RICE
      { name: 'Ponni Boiled Rice', name_en: 'Ponni Boiled Rice', name_ta: 'பொன்னி புழுங்கல் அரிசி (Ponni Arisi)', slug: 'ponni-boiled-rice', categorySlug: 'rice', marketPrice: 62, sellingPrice: 65, unit: '1 kg', unitType: 'kg', availableUnits: ['1kg', '5kg', '10kg', '25kg', '50kg', '100kg', '500kg', '1000kg'], availableQuantity: 20000, isPopular: true, images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500'], brand: 'Pakkam Premium' },
      { name: 'Raw Rice / Pacha Arisi', name_en: 'Raw Rice', name_ta: 'பச்சை அரிசி (Pacha Arisi)', slug: 'raw-rice', categorySlug: 'rice', marketPrice: 58, sellingPrice: 60, unit: '1 kg', unitType: 'kg', availableUnits: ['1kg', '5kg', '10kg', '25kg', '50kg', '100kg'], availableQuantity: 15000, images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500'], brand: 'Pakkam Premium' },
      { name: 'Seeraga Samba Rice', name_en: 'Seeraga Samba Rice', name_ta: 'சீரக சம்பா அரிசி (Seeraga Samba)', slug: 'seeraga-samba-rice', categorySlug: 'rice', marketPrice: 125, sellingPrice: 135, unit: '1 kg', unitType: 'kg', availableUnits: ['1kg', '5kg', '10kg', '25kg'], availableQuantity: 5000, isPopular: true, images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500'], brand: 'Traditional Heritage' },

      // DALS & PULSES
      { name: 'Toor Dal', name_en: 'Toor Dal', name_ta: 'துவரம் பருப்பு (Thuvaram Paruppu)', slug: 'toor-dal', categorySlug: 'dals-pulses', marketPrice: 148, sellingPrice: 155, unit: '1 kg', unitType: 'kg', availableUnits: ['500g', '1kg', '2kg', '5kg', '10kg', '25kg', '50kg'], availableQuantity: 8000, isPopular: true, images: ['https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=500'], brand: 'Pakkam Essentials' },
      { name: 'Urad Dal Gundu', name_en: 'Urad Dal Gundu', name_ta: 'உளுந்தம் பருப்பு (Ulundhu)', slug: 'urad-dal', categorySlug: 'dals-pulses', marketPrice: 135, sellingPrice: 140, unit: '1 kg', unitType: 'kg', availableUnits: ['500g', '1kg', '2kg', '5kg', '10kg', '25kg'], availableQuantity: 6000, isPopular: true, images: ['https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=500'], brand: 'Pakkam Essentials' },
      { name: 'Moong Dal', name_en: 'Moong Dal', name_ta: 'பாசிப் பருப்பு (Pasi Paruppu)', slug: 'moong-dal', categorySlug: 'dals-pulses', marketPrice: 115, sellingPrice: 120, unit: '1 kg', unitType: 'kg', availableUnits: ['500g', '1kg', '2kg', '5kg', '10kg'], availableQuantity: 4000, images: ['https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=500'], brand: 'Pakkam Essentials' },

      // OILS
      { name: 'Sunflower Oil 1L', name_en: 'Sunflower Oil', name_ta: 'சூரியகாந்தி எண்ணெய் (Sunflower Oil)', slug: 'sunflower-oil', categorySlug: 'oils', marketPrice: 135, sellingPrice: 142, unit: '1 l', unitType: 'litre', availableUnits: ['1l', '2l', '5l', '15l'], availableQuantity: 5000, isPopular: true, images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500'], brand: 'Sun Pure' },
      { name: 'Groundnut Oil Chekku 1L', name_en: 'Groundnut Oil', name_ta: 'கடலை எண்ணெய் (Kadalai Ennai)', slug: 'groundnut-oil', categorySlug: 'oils', marketPrice: 185, sellingPrice: 195, unit: '1 l', unitType: 'litre', availableUnits: ['1l', '2l', '5l'], availableQuantity: 3000, isPopular: true, images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500'], brand: 'Traditional Cold Pressed' },

      // DAIRY
      { name: 'Fresh Milk 500ml', name_en: 'Fresh Milk', name_ta: 'பால் (Paal)', slug: 'fresh-milk', categorySlug: 'dairy', marketPrice: 28, sellingPrice: 30, unit: '500 ml', unitType: 'ml', availableUnits: ['500ml', '1l'], availableQuantity: 1000, isFreshToday: true, isPopular: true, images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500'], brand: 'Aavin / Local Farm' },
      { name: 'Curd / Yogurt 500g', name_en: 'Curd', name_ta: 'தயிர் (Thayir)', slug: 'curd', categorySlug: 'dairy', marketPrice: 32, sellingPrice: 35, unit: '500 g', unitType: 'gram', availableUnits: ['500g', '1kg'], availableQuantity: 800, isFreshToday: true, images: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500'], brand: 'Fresh Dairy' },
    ];

    for (const prodData of productsData) {
      const cat = categoryMap[prodData.categorySlug];
      if (!cat) continue;

      const productPayload = {
        name: prodData.name,
        name_en: prodData.name_en,
        name_ta: prodData.name_ta,
        slug: prodData.slug,
        description: `${prodData.name} - Fresh and high quality available at Pakkam market prices.`,
        category: cat._id,
        shop: shop._id,
        images: prodData.images,
        price: prodData.sellingPrice,
        sellingPrice: prodData.sellingPrice,
        marketPrice: prodData.marketPrice,
        costPrice: Math.round(prodData.marketPrice * 0.85),
        priceSource: 'Government Price Monitoring System / AGMARKNET',
        priceUpdatedAt: new Date(),
        region: 'Madurai',
        unit: prodData.unit,
        unitType: prodData.unitType,
        unitValue: 1,
        availableUnits: prodData.availableUnits,
        availableQuantity: prodData.availableQuantity,
        minimumOrderQuantity: 1,
        maximumOrderQuantity: 1000,
        stockStatus: 'IN_STOCK',
        brand: prodData.brand,
        isActive: true,
        isFeatured: true,
        isPopular: prodData.isPopular || false,
        isFreshToday: prodData.isFreshToday || false,
      };

      const existingProd = await Product.findOne({ slug: prodData.slug });
      if (!existingProd) {
        const createdProd = await Product.create(productPayload);
        // Log Initial Price History
        await PriceHistory.create({
          product: createdProd._id,
          productName: createdProd.name,
          marketPrice: createdProd.marketPrice,
          sellingPrice: createdProd.sellingPrice,
          source: createdProd.priceSource,
          region: createdProd.region,
          changedByName: 'Catalog Seed Script',
          reason: 'Initial catalog creation',
          recordedAt: new Date(),
        });
      } else {
        await Product.findByIdAndUpdate(existingProd._id, productPayload);
      }
    }

    console.log('✅ Catalog Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding catalog:', error);
    process.exit(1);
  }
};

catalogSeed();
