import app from '../src/app.js';
import { connectDB } from '../src/utils/db.js';

// Initialize database connection on cold start
let isInitialized = false;

async function initializeApp() {
  if (!isInitialized) {
    try {
      await connectDB();
      isInitialized = true;
      console.log('Serverless function initialized');
    } catch (error) {
      console.error('Failed to initialize serverless function:', error);
      throw error;
    }
  }
}

// Vercel serverless handler
export default async function handler(req, res) {
  try {
    // Ensure database is connected before handling requests
    await initializeApp();
    
    // Let Express handle the request
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}
