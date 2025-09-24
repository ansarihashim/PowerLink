import mongoose from 'mongoose';
import { config } from '../config/env.js';

export async function connectMongo() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri, {
    autoIndex: true
  });
  console.log('MongoDB connected');
}
