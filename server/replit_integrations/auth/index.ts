// Load environment variables
import 'dotenv/config';

import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;

import { setupAuth } from "./replitAuth";
import { registerAuthRoutes as registerRoutes } from "./routes";
import { authStorage, type IAuthStorage } from "./storage";


const app = express();
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test DB connection
pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL'))
  .catch(err => console.error('❌ DB connection error:', err));

// Example route
app.get('/', (req, res) => {
  res.send('Donor-Connect server is running!');
});

// Start Replit Auth
setupAuth(app);

// Register routes
registerRoutes(app);   // ✅ fixed

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
