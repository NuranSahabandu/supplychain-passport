import db from '../db.js';
import { HttpError } from '../utils/httpError.js';
import { findOrFail } from '../utils/findOrFail.js';

// How many supply-chain stages point to this supplier.
async function countStagesUsingSupplier(supplierId) {
  const { count } = await db('supply_chain_stages')
    .where({ supplier_id: supplierId })
    .count({ count: '*' })
    .first();
  return Number(count);
}

// GET /api/suppliers
// stage_count is worked out inside the same query (one subquery per row),
// so we don't run an extra query for every supplier.
export async function listSuppliers(req, res) {
  const stageCount = db('supply_chain_stages')
    .count('*')
    .where('supply_chain_stages.supplier_id', db.ref('suppliers.id'))
    .as('stage_count');

  const suppliers = await db('suppliers').select('suppliers.*', stageCount).orderBy('name');
  res.json(suppliers);
}

// GET /api/suppliers/:id
export async function getSupplier(req, res) {
  const supplier = await findOrFail('suppliers', req.params.id, 'Supplier');
  res.json(supplier);
}

// POST /api/suppliers
export async function createSupplier(req, res) {
  const [newId] = await db('suppliers').insert(req.body);
  const supplier = await findOrFail('suppliers', newId, 'Supplier');

  res.status(201).json(supplier); // 201 = Created
}

// PUT /api/suppliers/:id
export async function updateSupplier(req, res) {
  const supplier = await findOrFail('suppliers', req.params.id, 'Supplier');

  await db('suppliers').where({ id: supplier.id }).update(req.body);
  const updated = await findOrFail('suppliers', supplier.id, 'Supplier');

  res.json(updated);
}

// DELETE /api/suppliers/:id
// Checked here first so the user gets a clear message, instead of relying on
// the database's ON DELETE RESTRICT error.
export async function deleteSupplier(req, res) {
  const supplier = await findOrFail('suppliers', req.params.id, 'Supplier');

  const count = await countStagesUsingSupplier(supplier.id);
  if (count > 0) {
    throw new HttpError(
      409,
      `This supplier is used in ${count} supply-chain stage(s). Remove or reassign those stages first.`
    );
  }

  await db('suppliers').where({ id: supplier.id }).del();
  res.status(204).end(); // 204 = success, nothing to send back
}
