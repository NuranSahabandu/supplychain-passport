import db from '../db.js';
import { notFound, validationError } from '../utils/httpError.js';

// Find one product by id, or throw a 404 if it doesn't exist.
async function findProductOrFail(id) {
  // An id like "abc" can never match a product, so treat it as "not found"
  if (!Number.isInteger(Number(id))) {
    throw notFound('Product not found');
  }

  const product = await db('products').where({ id: Number(id) }).first();
  if (!product) {
    throw notFound('Product not found');
  }
  return product;
}

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

// GET /api/products
export async function listProducts(req, res) {
  const products = await db('products').orderBy('name');
  res.json(products);
}

// GET /api/products/:id
export async function getProduct(req, res) {
  const product = await findProductOrFail(req.params.id);
  res.json(product);
}

// POST /api/products
export async function createProduct(req, res) {
  await ensureSkuIsFree(req.body.sku);

  const [newId] = await db('products').insert(req.body);
  const product = await findProductOrFail(newId);

  res.status(201).json(product); // 201 = Created
}

// PUT /api/products/:id
export async function updateProduct(req, res) {
  const product = await findProductOrFail(req.params.id);
  await ensureSkuIsFree(req.body.sku, product.id);

  await db('products').where({ id: product.id }).update(req.body);
  const updated = await findProductOrFail(product.id);

  res.json(updated);
}

// DELETE /api/products/:id
// Stages, certificates and the published snapshot are removed too (ON DELETE CASCADE).
export async function deleteProduct(req, res) {
  const product = await findProductOrFail(req.params.id);
  await db('products').where({ id: product.id }).del();
  res.status(204).end(); // 204 = success, nothing to send back
}