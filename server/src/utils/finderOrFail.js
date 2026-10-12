import db from '../db.js';
import { notFound } from './httpError.js';

// Find one row by id in any table, or throw a 404 if it doesn't exist.
// Example: await findOrFail('products', req.params.id, 'Product')
export async function findOrFail(table, id, label) {
  // An id like "abc" can never match a row, so treat it as "not found"
  if (!Number.isInteger(Number(id))) {
    throw notFound(`${label} not found`);
  }

  const row = await db(table).where({ id: Number(id) }).first();
  if (!row) {
    throw notFound(`${label} not found`);
  }
  return row;
}