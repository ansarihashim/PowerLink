import mongoose from 'mongoose';

let isConnected = false;

/**
 * Connect to MongoDB with connection caching for serverless
 * This prevents creating new connections on every request
 */
export async function connectDB() {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    mongoose.set('strictQuery', true);
    
    const db = await mongoose.connect(mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 10000, // Close sockets after 10s of inactivity
    });

    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Export the original connection function for backward compatibility
export { connectDB as connectMongo };
