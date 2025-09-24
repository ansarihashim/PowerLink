import app from './app.js';
import { connectMongo } from './db/mongoose.js';
import { config } from './config/env.js';

(async () => {
  try {
    await connectMongo();
    app.listen(config.port, () => console.log(`API listening on :${config.port}`));
  } catch (e) {
    console.error('Failed to start server', e);
    process.exit(1);
  }
})();
