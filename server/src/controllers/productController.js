import db from '../db.js';
import { validationError } from '../utils/httpError.js';
import { findOrFail } from '../utils/findOrFail.js';
import { getProductDetail } from '../services/productService.js';
import { toIsoUtc } from '../utils/dates.js';

// SKUs must be unique. When updating, ignore the product being edited.
async function ensureSkuIsFree(sku, ignoreProductId = null) {
  const query = db('products').where({ sku });
  if (ignoreProductId) {
    query.whereNot({ id: ignoreProductId });
  }
  const existing = await query.first();
  if (existing) {
    throw validationError({ sku: [`SKU "${sku}" is already used by another product`] });
  }
}

// GET /api/products  (each product includes published_at, or null if never published)
export async function listProducts(req, res) {
  const products = await db('products')
    .leftJoin('passport_snapshots', 'passport_snapshots.product_id', 'products.id')
    .select('products.*', 'passport_snapshots.published_at')
    .orderBy('products.name');

  res.json(products.map((product) => ({ ...product, published_at: toIsoUtc(product.published_at) })));
}

// GET /api/products/:id  → the product with its ordered stages and certificates
export async function getProduct(req, res) {
  const product = await getProductDetail(req.params.id);
  res.json(product);
}

// POST /api/products
export async function createProduct(req, res) {
  await ensureSkuIsFree(req.body.sku);

  const [newId] = await db('products').insert(req.body);
  const product = await findOrFail('products', newId, 'Product');

  res.status(201).json(product); // 201 = Created
}

// PUT /api/products/:id
export async function updateProduct(req, res) {
  const product = await findOrFail('products', req.params.id, 'Product');
  await ensureSkuIsFree(req.body.sku, product.id);

  await db('products').where({ id: product.id }).update(req.body);
  const updated = await findOrFail('products', product.id, 'Product');

  res.json(updated);
}

// DELETE /api/products/:id
// Stages, certificates and the published snapshot are removed too (ON DELETE CASCADE).
export async function deleteProduct(req, res) {
  const product = await findOrFail('products', req.params.id, 'Product');
  await db('products').where({ id: product.id }).del();
  res.status(204).end(); // 204 = success, nothing to send back
}