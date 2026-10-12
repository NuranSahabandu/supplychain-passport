import db from '../db.js';
import { validationError } from '../utils/httpError.js';
import { findOrFail } from '../utils/findOrFail.js';
import { getStagesForProduct, renumberStages } from '../services/stageService.js';

// The chosen supplier must exist. This is a problem with the submitted form, so it's a 422.
async function ensureSupplierExists(supplierId) {
  const supplier = await db('suppliers').where({ id: supplierId }).first();
  if (!supplier) {
    throw validationError({ supplier_id: ['The selected supplier does not exist'] });
  }
}

// Every stage endpoint answers with the product's full, freshly ordered stage list,
// so the screen can simply redraw the timeline from the response.

// POST /api/products/:productId/stages  → adds the stage at the end
export async function createStage(req, res) {
  const product = await findOrFail('products', req.params.productId, 'Product');
  await ensureSupplierExists(req.body.supplier_id);

  await db.transaction(async (trx) => {
    const { maxOrder } = await trx('supply_chain_stages')
      .where({ product_id: product.id })
      .max('stage_order as maxOrder')
      .first();

    await trx('supply_chain_stages').insert({
      product_id: product.id,
      supplier_id: req.body.supplier_id,
      stage_name: req.body.stage_name,
      stage_order: (maxOrder ?? 0) + 1, // no stages yet → maxOrder is null → position 1
    });
  });

  res.status(201).json(await getStagesForProduct(product.id));
}

// PUT /api/stages/:id  → changes the name and/or supplier (not the position)
export async function updateStage(req, res) {
  const stage = await findOrFail('supply_chain_stages', req.params.id, 'Stage');
  await ensureSupplierExists(req.body.supplier_id);

  await db('supply_chain_stages')
    .where({ id: stage.id })
    .update({ stage_name: req.body.stage_name, supplier_id: req.body.supplier_id });

  res.json(await getStagesForProduct(stage.product_id));
}

// DELETE /api/stages/:id  → removes the stage and closes the gap (1,2,4 → 1,2,3)
export async function deleteStage(req, res) {
  const stage = await findOrFail('supply_chain_stages', req.params.id, 'Stage');

  await db.transaction(async (trx) => {
    await trx('supply_chain_stages').where({ id: stage.id }).del();

    const remainingIds = await trx('supply_chain_stages')
      .where({ product_id: stage.product_id })
      .orderBy('stage_order')
      .pluck('id');

    await renumberStages(trx, stage.product_id, remainingIds);
  });

  res.json(await getStagesForProduct(stage.product_id));
}

// PUT /api/products/:productId/stages/order  → body: { stage_ids: [ ...new order... ] }
export async function reorderStages(req, res) {
  const product = await findOrFail('products', req.params.productId, 'Product');
  const newOrder = req.body.stage_ids;

  const currentIds = await db('supply_chain_stages')
    .where({ product_id: product.id })
    .pluck('id');

  // The new order must contain every stage of this product exactly once:
  // same number of ids, no duplicates, and no ids from other products.
  const hasDuplicates = new Set(newOrder).size !== newOrder.length;
  const sameStages =
    newOrder.length === currentIds.length && newOrder.every((id) => currentIds.includes(id));

  if (hasDuplicates || !sameStages) {
    throw validationError({
      stage_ids: ['The new order must list every stage of this product exactly once'],
    });
  }

  // All updates succeed together or none are kept (no half-reordered timeline)
  await db.transaction((trx) => renumberStages(trx, product.id, newOrder));

  res.json(await getStagesForProduct(product.id));
}