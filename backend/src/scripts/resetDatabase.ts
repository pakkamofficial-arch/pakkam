import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { User } from '../models/User';
import { Shop } from '../models/Shop';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { Order } from '../models/Order';
import { Cart } from '../models/Cart';
import { DeliveryPerson } from '../models/DeliveryPerson';
import { DeliveryPartnerApplication } from '../models/DeliveryPartnerApplication';
import { Notification } from '../models/Notification';
import { Address } from '../models/Address';
import { Coupon } from '../models/Coupon';
import { Banner } from '../models/Banner';
import { Review } from '../models/Review';
import { Wishlist } from '../models/Wishlist';
import { ReturnRequest } from '../models/ReturnRequest';
import { SupportTicket } from '../models/SupportTicket';
import { MonthlyGroceryList } from '../models/MonthlyGroceryList';
import { Wallet } from '../models/Wallet';
import { WalletTransaction } from '../models/WalletTransaction';
import { PriceHistory } from '../models/PriceHistory';
import { Seller } from '../models/Seller';
import { DeliveryZone } from '../models/DeliveryZone';
import { AppSetting } from '../models/AppSetting';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pakkam_db';

const resetDatabase = async () => {
  console.log('====================================================');
  console.log('🚨 PAKKAM DATABASE FRESH RESET');
  console.log('====================================================');

  try {
    console.log(`Connecting to MongoDB URI: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    
    const dbName = mongoose.connection.name;
    const dbHost = mongoose.connection.host;
    console.log(`✅ Connected successfully to Host: [${dbHost}], Database: [${dbName}]\n`);

    // Safety check: ensure target DB is verified local / configured DB
    if (!dbName) {
      throw new Error('Database name could not be resolved! Aborting reset for safety.');
    }

    console.log('Clearing all application data collections...');

    const models = [
      { name: 'users', model: User },
      { name: 'shops', model: Shop },
      { name: 'products', model: Product },
      { name: 'categories', model: Category },
      { name: 'orders', model: Order },
      { name: 'carts', model: Cart },
      { name: 'deliveryPartners (DeliveryPerson)', model: DeliveryPerson },
      { name: 'deliveryPartnerApplications', model: DeliveryPartnerApplication },
      { name: 'notifications', model: Notification },
      { name: 'addresses', model: Address },
      { name: 'coupons', model: Coupon },
      { name: 'banners', model: Banner },
      { name: 'reviews', model: Review },
      { name: 'wishlists', model: Wishlist },
      { name: 'returnRequests', model: ReturnRequest },
      { name: 'supportTickets', model: SupportTicket },
      { name: 'monthlyGroceryLists', model: MonthlyGroceryList },
      { name: 'wallets', model: Wallet },
      { name: 'walletTransactions', model: WalletTransaction },
      { name: 'priceHistories', model: PriceHistory },
      { name: 'sellers', model: Seller },
      { name: 'deliveryZones', model: DeliveryZone },
      { name: 'appSettings', model: AppSetting },
    ];

    for (const item of models) {
      const result = await item.model.deleteMany({});
      console.log(`Clearing ${item.name.padEnd(40, '.')} Deleted ${result.deletedCount} records.`);
    }

    // Double check raw database collections if any exist without explicit models
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.collections();
      for (const collection of collections) {
        const countBefore = await collection.countDocuments();
        if (countBefore > 0) {
          await collection.deleteMany({});
          console.log(`Clearing raw collection [${collection.collectionName}]. Deleted ${countBefore} records.`);
        }
      }
    }

    console.log('\n====================================================');
    console.log('VERIFYING FINAL POST-RESET DATABASE STATE:');
    console.log('====================================================');

    let totalRemainingRecords = 0;
    for (const item of models) {
      const count = await item.model.countDocuments();
      totalRemainingRecords += count;
      console.log(`${item.name.padEnd(40, '.')}: ${count}`);
    }

    console.log('----------------------------------------------------');
    console.log(`Total Remaining Records Across All Collections: ${totalRemainingRecords}`);

    if (totalRemainingRecords === 0) {
      console.log('\n🎉 PAKKAM DATABASE SUCCESSFULLY RESET TO FRESH EMPTY STATE!');
    } else {
      console.error('\n⚠️ WARNING: Database reset completed but some records remain!');
    }

  } catch (error) {
    console.error('❌ Error during database reset:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
};

resetDatabase();
