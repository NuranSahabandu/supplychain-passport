import db from '../db.js';

// All stages of one product, in order, with the supplier's details joined in.
// The country comes from the supplier, so it is never copied into the stage.
export function getStagesForProduct(productId, connection = db) {
  return connection('supply_chain_stages as stage')
    .join('suppliers as supplier', 'supplier.id', 'stage.supplier_id')
    .where('stage.product_id', productId)
    .orderBy('stage.stage_order')
    .select(
      'stage.id',
      'stage.product_id',
      'stage.stage_order',
      'stage.stage_name',
      'stage.supplier_id',
      'supplier.name as supplier_name',
      'supplier.country',
      'supplier.location'
    );
}

// Gives a product's stages the positions 1, 2, 3, ... in the order of orderedIds.
// Must be called inside a transaction (trx).
//
// Why two passes? (product_id, stage_order) is UNIQUE and MySQL checks it after
// every single UPDATE. Swapping stages 2 and 3 directly would briefly create two
// "3"s and fail. So first we move every stage far out of the way (+10000), then
// write the final positions, which can no longer collide with anything.
export async function renumberStages(trx, productId, orderedIds) {
  await trx('supply_chain_stages')
    .where({ product_id: productId })
    .update({ stage_order: trx.raw('stage_order + 10000') });

  for (let index = 0; index < orderedIds.length; index++) {
    await trx('supply_chain_stages')
      .where({ id: orderedIds[index], product_id: productId })
      .update({ stage_order: index + 1 });
  }
}