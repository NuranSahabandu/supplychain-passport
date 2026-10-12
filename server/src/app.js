import express from 'express';
import db from './db.js';
import productRoutes from './routes/productRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Turn incoming JSON request bodies into req.body
app.use(express.json());

// Health check: proves the server is running and can reach MySQL
app.get('/api/health', async (req, res) => {
  await db.raw('SELECT 1');
  res.json({ status: 'ok', database: 'connected' });
});

// Feature routes
app.use('/api/products', productRoutes);
app.use('/api/suppliers', supplierRoutes);

// These two must come LAST: they catch whatever the routes above didn't handle
app.use(notFoundHandler);
app.use(errorHandler);

export default app;