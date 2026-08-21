import dotenv from 'dotenv';
import app from './app.js';
import { startScheduler } from './utils/scheduler.js';
import { seedDefaultDropdowns } from './utils/seeder.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
  await seedDefaultDropdowns();
  startScheduler();
});
