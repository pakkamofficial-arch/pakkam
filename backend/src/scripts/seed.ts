import mongoose from 'mongoose';
import dotenv from 'dotenv';
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

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pakkam_db';

const seed = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected.');

    // Safely drop stale/obsolete indexes (e.g. legacy username_1 index) if present
    try {
      await User.collection.dropIndexes();
      console.log('[Seed] Dropped old indexes on User collection.');
    } catch (e) {
      // Ignore if collection or index doesn't exist yet
    }

    // Clear existing collections
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

    // 3. Create App Settings (Configurable Delivery Fees)
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

    // 5. Create 14 Categories
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
    categories.forEach((c) => (catMap[c.slug] = c));

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
      {
        name: 'Green Basket Organic Store',
        description: 'Pure organic vegetables, greens & unpolished pulses.',
        owner: sellerUser._id,
        phone: '9876543211',
        address: 'No. 8, Besant Avenue, Besant Nagar, Chennai',
        rating: 4.9,
        reviewCount: 180,
        logo: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=300',
        coverImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
        isOpen: true,
        deliveryRadius: 6,
        minimumOrder: 200,
        status: 'APPROVED',
      },
      {
        name: 'Daily Needs Superette',
        description: 'Milk, bread, snacks, cleaning products & household items.',
        owner: sellerUser._id,
        phone: '9876543211',
        address: 'No. 19, First Main Road, RA Puram, Chennai',
        rating: 4.5,
        reviewCount: 150,
        logo: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300',
        coverImage: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800',
        isOpen: true,
        deliveryRadius: 5,
        minimumOrder: 80,
        status: 'APPROVED',
      },
    ];

    const shops = await Shop.insertMany(shopsData);
    const shopFresh = shops[0];
    const shopLakshmi = shops[1];
    const shopGreen = shops[2];
    const shopDaily = shops[3];

    // Link shop to seller user
    sellerUser.shop = shopFresh._id;
    await sellerUser.save();

    // 7. Create 50+ Realistic Products
    const productsData = [
      // VEGETABLES
      {
        name: 'Country Tomato (நாட்டு தக்காளி)',
        description: 'Juicy, farm fresh country tomatoes packed with flavor.',
        category: catMap['vegetables']._id,
        images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600'],
        price: 40,
        discountPrice: 32,
        unit: '1 kg',
        availableUnits: ['250 g', '500 g', '1 kg', '2 kg', '5 kg'],
        shop: shopFresh._id,
        isFreshToday: true,
        isPopular: true,
      },
      {
        name: 'Red Onion (வெங்காயம்)',
        description: 'Crisp medium red onions direct from Nashik farms.',
        category: catMap['vegetables']._id,
        images: ['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?w=600'],
        price: 35,
        discountPrice: 28,
        unit: '1 kg',
        availableUnits: ['500 g', '1 kg', '2 kg', '5 kg'],
        shop: shopFresh._id,
        isFreshToday: true,
        isPopular: true,
      },
      {
        name: 'Fresh Potato (உருளைக்கிழங்கு)',
        description: 'Smooth skin Hassan potatoes, ideal for fry & curry.',
        category: catMap['vegetables']._id,
        images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600'],
        price: 38,
        discountPrice: 30,
        unit: '1 kg',
        availableUnits: ['500 g', '1 kg', '2 kg', '5 kg'],
        shop: shopFresh._id,
        isPopular: true,
      },
      {
        name: 'Ooty Carrot (கேரட்)',
        description: 'Sweet, crunch orange carrots fresh from Ooty hills.',
        category: catMap['vegetables']._id,
        images: ['https://images.unsplash.com/photo-1598170845058-12ef4a457939?w=600'],
        price: 60,
        discountPrice: 48,
        unit: '1 kg',
        availableUnits: ['250 g', '500 g', '1 kg', '2 kg'],
        shop: shopFresh._id,
        isFreshToday: true,
      },
      {
        name: 'Green Beans (பீன்ஸ்)',
        description: 'Tender tender French green beans.',
        category: catMap['vegetables']._id,
        images: ['https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=600'],
        price: 75,
        discountPrice: 65,
        unit: '1 kg',
        availableUnits: ['250 g', '500 g', '1 kg'],
        shop: shopFresh._id,
        isFreshToday: true,
      },
      {
        name: 'Purple Brinjal (கத்தரிக்காய்)',
        description: 'Fresh purple brinjal suitable for Ennai Kathirikai.',
        category: catMap['vegetables']._id,
        images: ['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600'],
        price: 45,
        discountPrice: 36,
        unit: '1 kg',
        availableUnits: ['250 g', '500 g', '1 kg'],
        shop: shopFresh._id,
      },
      {
        name: 'Fresh Coriander Bunch (கொத்தமல்லி)',
        description: 'Aromatic green coriander leaves bunch.',
        category: catMap['vegetables']._id,
        images: ['https://images.unsplash.com/photo-1588879460405-5dd74b097b6a?w=600'],
        price: 15,
        discountPrice: 12,
        unit: '1 piece',
        availableUnits: ['1 piece', '2 pieces'],
        shop: shopFresh._id,
        isFreshToday: true,
      },
      {
        name: 'Ladies Finger / Okra (வெண்டைக்காய்)',
        description: 'Tender green ladies finger for Sambar & fry.',
        category: catMap['vegetables']._id,
        images: ['https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=600'],
        price: 40,
        discountPrice: 32,
        unit: '1 kg',
        availableUnits: ['250 g', '500 g', '1 kg'],
        shop: shopGreen._id,
        isFreshToday: true,
      },
      {
        name: 'Green Chilli (பச்சை மிளகாய்)',
        description: 'Spicy green chillies.',
        category: catMap['vegetables']._id,
        images: ['https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600'],
        price: 25,
        discountPrice: 20,
        unit: '250 g',
        availableUnits: ['100 g', '250 g', '500 g'],
        shop: shopFresh._id,
      },

      // FRUITS
      {
        name: 'Robusta Banana (வாழைப்பழம்)',
        description: 'Sweet yellow Cavendish bananas.',
        category: catMap['fruits']._id,
        images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600'],
        price: 50,
        discountPrice: 42,
        unit: '1 kg',
        availableUnits: ['500 g', '1 kg', '2 kg'],
        shop: shopFresh._id,
        isPopular: true,
      },
      {
        name: 'Washington Red Apple (ஆப்பிள்)',
        description: 'Crisp, sweet imported red apples.',
        category: catMap['fruits']._id,
        images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600'],
        price: 180,
        discountPrice: 155,
        unit: '1 kg',
        availableUnits: ['500 g', '1 kg', '2 kg'],
        shop: shopFresh._id,
      },
      {
        name: 'Pomegranate (மாதுளை)',
        description: 'Rich ruby red sweet pomegranate seeds.',
        category: catMap['fruits']._id,
        images: ['https://images.unsplash.com/photo-1541345023926-55d6e0853f4b?w=600'],
        price: 160,
        discountPrice: 140,
        unit: '1 kg',
        availableUnits: ['500 g', '1 kg'],
        shop: shopGreen._id,
      },
      {
        name: 'Papaya (பப்பாளி)',
        description: 'Ripe sweet honey papaya.',
        category: catMap['fruits']._id,
        images: ['https://images.unsplash.com/photo-1517260739337-6799d239ce83?w=600'],
        price: 45,
        discountPrice: 38,
        unit: '1 kg',
        availableUnits: ['1 kg', '2 kg'],
        shop: shopFresh._id,
      },

      // RICE & GRAINS
      {
        name: 'Ponni Boiled Rice (பொன்னி அரிசி)',
        description: 'Premium aged Tanjore Ponni rice for daily meals.',
        category: catMap['rice-grains']._id,
        images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600'],
        price: 65,
        discountPrice: 58,
        unit: '1 kg',
        availableUnits: ['1 kg', '5 kg', '10 kg', '25 kg'],
        shop: shopLakshmi._id,
        isPopular: true,
      },
      {
        name: 'Idli Rice (இட்லி அரிசி)',
        description: 'Selected Salem idli rice for soft, fluffy idlis & crisp dosas.',
        category: catMap['rice-grains']._id,
        images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600'],
        price: 52,
        discountPrice: 46,
        unit: '1 kg',
        availableUnits: ['1 kg', '5 kg', '10 kg'],
        shop: shopLakshmi._id,
      },
      {
        name: 'Aashirvaad Whole Wheat Atta (கோோதுமை மாவு)',
        description: '100% pure MP Sharbati wheat atta for soft rotis.',
        category: catMap['rice-grains']._id,
        images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600'],
        price: 70,
        discountPrice: 62,
        unit: '1 kg',
        availableUnits: ['1 kg', '5 kg', '10 kg'],
        shop: shopLakshmi._id,
        isPopular: true,
      },

      // DAL & PULSES
      {
        name: 'Premium Toor Dal (துவரம் பருப்பு)',
        description: 'Unpolished protein-rich yellow Toor Dal for Sambar.',
        category: catMap['dal-pulses']._id,
        images: ['https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600'],
        price: 155,
        discountPrice: 138,
        unit: '1 kg',
        availableUnits: ['500 g', '1 kg', '2 kg', '5 kg'],
        shop: shopLakshmi._id,
        isPopular: true,
      },
      {
        name: 'Split Urad Dal (உளுத்தம் பருப்பு)',
        description: 'Cleaned white urad dal for Idli/Dosa batter.',
        category: catMap['dal-pulses']._id,
        images: ['https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600'],
        price: 140,
        discountPrice: 125,
        unit: '1 kg',
        availableUnits: ['500 g', '1 kg', '2 kg'],
        shop: shopLakshmi._id,
      },
      {
        name: 'Yellow Moong Dal (பாசிப் பருப்பு)',
        description: 'Quick cooking yellow split moong dal for Kitchari & Payasam.',
        category: catMap['dal-pulses']._id,
        images: ['https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600'],
        price: 130,
        discountPrice: 115,
        unit: '1 kg',
        availableUnits: ['500 g', '1 kg', '2 kg'],
        shop: shopLakshmi._id,
      },

      // OIL & GHEE
      {
        name: 'Gold Winner Sunflower Oil (சூரியகாந்தி எண்ணெய்)',
        description: 'Refined sunflower oil with Vitamin A & D.',
        category: catMap['oil-ghee']._id,
        images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600'],
        price: 145,
        discountPrice: 130,
        unit: '1 L',
        availableUnits: ['500 ml', '1 L', '2 L', '5 L'],
        shop: shopLakshmi._id,
        isPopular: true,
      },
      {
        name: 'Idhayam Gingelly / Sesame Oil (நல்லெண்ணெய்)',
        description: 'Traditional cold pressed sesame oil for healthy cooking.',
        category: catMap['oil-ghee']._id,
        images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600'],
        price: 240,
        discountPrice: 220,
        unit: '1 L',
        availableUnits: ['500 ml', '1 L'],
        shop: shopLakshmi._id,
      },
      {
        name: 'GRB Cow Ghee (நெய்)',
        description: 'Pure aromatic cow ghee with rich granulations.',
        category: catMap['oil-ghee']._id,
        images: ['https://images.unsplash.com/photo-1589927986077-a0978b71977e?w=600'],
        price: 320,
        discountPrice: 295,
        unit: '500 ml',
        availableUnits: ['200 ml', '500 ml', '1 L'],
        shop: shopLakshmi._id,
      },

      // SPICES & MASALA
      {
        name: 'Aachi Chilli Powder (மிளகாய் தூள்)',
        description: 'Hot red chilli powder for rich spicy curries.',
        category: catMap['spices']._id,
        images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600'],
        price: 65,
        discountPrice: 58,
        unit: '250 g',
        availableUnits: ['100 g', '250 g', '500 g'],
        shop: shopLakshmi._id,
      },
      {
        name: 'Aachi Turmeric Powder (மஞ்சள் தூள்)',
        description: 'Pure Erode turmeric powder with high curcumin content.',
        category: catMap['spices']._id,
        images: ['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600'],
        price: 45,
        discountPrice: 38,
        unit: '250 g',
        availableUnits: ['100 g', '250 g', '500 g'],
        shop: shopLakshmi._id,
      },
      {
        name: 'Tata Crystal Salt (கல் உப்பு)',
        description: 'Iodized solar evaporated natural crystal salt.',
        category: catMap['spices']._id,
        images: ['https://images.unsplash.com/photo-1518110165387-74f777583b27?w=600'],
        price: 20,
        discountPrice: 16,
        unit: '1 kg',
        availableUnits: ['1 kg'],
        shop: shopLakshmi._id,
      },
      {
        name: 'White Sugar (சர்க்கரை)',
        description: 'Pure refined crystal white sugar.',
        category: catMap['spices']._id,
        images: ['https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=600'],
        price: 46,
        discountPrice: 42,
        unit: '1 kg',
        availableUnits: ['1 kg', '2 kg', '5 kg'],
        shop: shopLakshmi._id,
        isPopular: true,
      },

      // DAIRY & EGGS
      {
        name: 'Aavin Full Cream Milk (பால்)',
        description: 'Pasteurized homogenized orange Aavin milk packet.',
        category: catMap['dairy']._id,
        images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600'],
        price: 30,
        discountPrice: 30,
        unit: '500 ml',
        availableUnits: ['500 ml', '1 L'],
        shop: shopDaily._id,
        isPopular: true,
      },
      {
        name: 'Hatsun Fresh Curd (தயிர்)',
        description: 'Thick, creamy set curd.',
        category: catMap['dairy']._id,
        images: ['https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=600'],
        price: 35,
        discountPrice: 32,
        unit: '500 g',
        availableUnits: ['200 g', '500 g', '1 kg'],
        shop: shopDaily._id,
      },
      {
        name: 'Farm Fresh White Eggs (முட்டை)',
        description: 'Nutritious farm fresh protein white eggs pack of 6.',
        category: catMap['eggs']._id,
        images: ['https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600'],
        price: 42,
        discountPrice: 38,
        unit: '1 piece',
        availableUnits: ['1 piece', '6 pieces', '30 pieces'],
        shop: shopDaily._id,
        isPopular: true,
      },

      // BAKERY & SNACKS
      {
        name: 'Modern Sandwich White Bread',
        description: 'Soft sliced white bread for breakfast.',
        category: catMap['bakery']._id,
        images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600'],
        price: 40,
        discountPrice: 36,
        unit: '1 piece',
        availableUnits: ['1 piece'],
        shop: shopDaily._id,
      },
      {
        name: 'Britannia Good Day Butter Biscuits',
        description: 'Crunchy butter cashew cookies.',
        category: catMap['snacks']._id,
        images: ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600'],
        price: 30,
        discountPrice: 28,
        unit: '1 piece',
        availableUnits: ['1 piece'],
        shop: shopDaily._id,
      },

      // BEVERAGES
      {
        name: '3 Roses Dust Tea Powder',
        description: 'Strong color and rich taste South Indian tea.',
        category: catMap['beverages']._id,
        images: ['https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600'],
        price: 160,
        discountPrice: 145,
        unit: '500 g',
        availableUnits: ['250 g', '500 g'],
        shop: shopLakshmi._id,
      },
      {
        name: 'Narasu’s Udhayam Filter Coffee Powder',
        description: '80% Coffee 20% Chicory traditional South Indian filter coffee.',
        category: catMap['beverages']._id,
        images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600'],
        price: 135,
        discountPrice: 120,
        unit: '500 g',
        availableUnits: ['250 g', '500 g'],
        shop: shopLakshmi._id,
      },

      // CLEANING & HOUSEHOLD
      {
        name: 'Vim Lemon Dishwash Gel',
        description: 'Powerful lemon degreasing dishwashing gel.',
        category: catMap['cleaning']._id,
        images: ['https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600'],
        price: 110,
        discountPrice: 98,
        unit: '500 ml',
        availableUnits: ['250 ml', '500 ml', '1 L'],
        shop: shopDaily._id,
      },
      {
        name: 'Surf Excel Easy Wash Detergent Powder',
        description: 'Removes tough stains effortlessly.',
        category: catMap['cleaning']._id,
        images: ['https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600'],
        price: 140,
        discountPrice: 126,
        unit: '1 kg',
        availableUnits: ['1 kg', '2 kg'],
        shop: shopDaily._id,
      },
    ];

    const insertedProducts = await Product.insertMany(productsData);
    console.log(`[Seed] Successfully inserted ${insertedProducts.length} products!`);

    // 8. Create Initial Monthly Grocery List for Demo Customer
    const ponniRice = insertedProducts.find((p) => p.name.includes('Ponni Boiled Rice'));
    const toorDal = insertedProducts.find((p) => p.name.includes('Toor Dal'));
    const sunflowerOil = insertedProducts.find((p) => p.name.includes('Sunflower Oil'));
    const sugar = insertedProducts.find((p) => p.name.includes('White Sugar'));
    const tomato = insertedProducts.find((p) => p.name.includes('Country Tomato'));

    const monthlyItems: any[] = [];
    if (ponniRice) monthlyItems.push({ product: ponniRice._id, name: ponniRice.name, quantity: 10, unit: '1 kg', priceAtCreation: ponniRice.discountPrice || ponniRice.price, isAvailable: true });
    if (toorDal) monthlyItems.push({ product: toorDal._id, name: toorDal.name, quantity: 2, unit: '1 kg', priceAtCreation: toorDal.discountPrice || toorDal.price, isAvailable: true });
    if (sunflowerOil) monthlyItems.push({ product: sunflowerOil._id, name: sunflowerOil.name, quantity: 3, unit: '1 L', priceAtCreation: sunflowerOil.discountPrice || sunflowerOil.price, isAvailable: true });
    if (sugar) monthlyItems.push({ product: sugar._id, name: sugar.name, quantity: 2, unit: '1 kg', priceAtCreation: sugar.discountPrice || sugar.price, isAvailable: true });
    if (tomato) monthlyItems.push({ product: tomato._id, name: tomato.name, quantity: 3, unit: '1 kg', priceAtCreation: tomato.discountPrice || tomato.price, isAvailable: true });

    const totalEst = monthlyItems.reduce((sum, item) => sum + item.priceAtCreation * item.quantity, 0);

    await MonthlyGroceryList.create({
      user: customerUser._id,
      name: 'September Monthly Grocery',
      month: 'September 2026',
      familySize: 'Family of 4',
      items: monthlyItems,
      estimatedTotal: totalEst,
    });

    // 8. Create Delivery Zones
    const zoneAnnaNagar = await DeliveryZone.create({
      name: 'Anna Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincodes: ['600040', '600101', '600020'],
      active: true,
      latitude: 13.0878,
      longitude: 80.217,
    });

    const zoneGuindy = await DeliveryZone.create({
      name: 'Guindy',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincodes: ['600032', '600022'],
      active: true,
      latitude: 13.0067,
      longitude: 80.2206,
    });

    const zoneTNagar = await DeliveryZone.create({
      name: 'T Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincodes: ['600017', '600018'],
      active: true,
      latitude: 13.0418,
      longitude: 80.2341,
    });

    const zoneVelachery = await DeliveryZone.create({
      name: 'Velachery',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincodes: ['600042', '600096'],
      active: true,
      latitude: 12.9815,
      longitude: 80.218,
    });

    console.log('[Seed] Delivery Zones created (Anna Nagar, Guindy, T Nagar, Velachery).');

    // 9. Create Delivery Persons
    const deliveryBoy1 = await DeliveryPerson.create({
      user: deliveryUser._id,
      name: 'Arun (Delivery Partner)',
      mobile: '9876543212',
      email: 'delivery@pakkam.test',
      vehicleType: 'BIKE',
      vehicleNumber: 'TN 01 AB 1234',
      status: 'AVAILABLE',
      active: true,
      servicePincodes: ['600040', '600101', '600020'],
      serviceZones: [zoneAnnaNagar._id],
      maxActiveOrders: 5,
      currentActiveOrders: 1,
    });

    const deliveryUser2 = await User.create({
      name: 'Kumar (Rider 2)',
      email: 'kumar.delivery@pakkam.test',
      phone: '9876543215',
      password: 'Password123!',
      role: 'DELIVERY',
      isActive: true,
    });

    const deliveryBoy2 = await DeliveryPerson.create({
      user: deliveryUser2._id,
      name: 'Kumar',
      mobile: '9876543215',
      email: 'kumar.delivery@pakkam.test',
      vehicleType: 'SCOOTER',
      vehicleNumber: 'TN 09 CD 5678',
      status: 'AVAILABLE',
      active: true,
      servicePincodes: ['600040', '600032'],
      serviceZones: [zoneAnnaNagar._id, zoneGuindy._id],
      maxActiveOrders: 5,
      currentActiveOrders: 2,
    });

    const deliveryUser3 = await User.create({
      name: 'Raj (Rider 3)',
      email: 'raj.delivery@pakkam.test',
      phone: '9876543216',
      password: 'Password123!',
      role: 'DELIVERY',
      isActive: true,
    });

    const deliveryBoy3 = await DeliveryPerson.create({
      user: deliveryUser3._id,
      name: 'Raj',
      mobile: '9876543216',
      email: 'raj.delivery@pakkam.test',
      vehicleType: 'BIKE',
      vehicleNumber: 'TN 07 EF 9012',
      status: 'AVAILABLE',
      active: true,
      servicePincodes: ['600017', '600042'],
      serviceZones: [zoneTNagar._id, zoneVelachery._id],
      maxActiveOrders: 5,
      currentActiveOrders: 3,
    });

    console.log('[Seed] Delivery Partners created (Arun, Kumar, Raj).');
    console.log('[Seed] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seed();
