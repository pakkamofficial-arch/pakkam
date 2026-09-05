import mongoose from 'mongoose';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

export const connectDB = async () => {
  try {
    try {
      const conn = await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pakkam_db'
      );
      console.log(`[MongoDB Connected] Host: ${conn.connection.host}`);
    } catch (primaryErr) {
      console.warn('[MongoDB Warning] Primary MONGODB_URI failed, connecting to local MongoDB fallback...');
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/pakkam_db');
      console.log(`[MongoDB Connected Local Fallback] Host: ${conn.connection.host}`);
    }
  } catch (error) {
    console.error(`[MongoDB Connection Error]`, error);
    process.exit(1);
  }
};