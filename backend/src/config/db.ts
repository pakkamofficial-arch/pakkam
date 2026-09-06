import mongoose from 'mongoose';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const options: mongoose.ConnectOptions = {
  maxPoolSize: 50,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.error('[MongoDB Error] MONGODB_URI environment variable is not defined.');
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoUri, options);

    console.log(`[MongoDB Connected] Host: ${conn.connection.host}`);
    console.log(`[MongoDB Connected] Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('[MongoDB Connection Error]', error);
    process.exit(1);
  }
};