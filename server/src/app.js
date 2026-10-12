import express from 'express';
import db from './db.js';

const app = express();

// Turn incoming JSON request bodies into req.body
app.use(express.json());

// Health check: proves the server is running and can reach MySQL
app.get('/api/health', async (req, res) => {
  await db.raw('SELECT 1');
  res.json({ status: 'ok', database: 'connected' });
});

export default app;