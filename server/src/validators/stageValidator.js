import { z } from 'zod';
import { requiredText } from './common.js';

// Forms send numbers as text ("3"), so z.coerce.number() converts them first.
// Empty, missing, 0 or "abc" all fail with the same friendly message.
const supplierId = z.coerce
  .number({ error: 'Supplier is required' })
  .int('Supplier is required')
  .positive('Supplier is required');

// Adding or editing a stage. The position (stage_order) is NOT sent here:
// new stages go to the end, and positions change only through the reorder endpoint.
export const stageSchema = z.object({
  stage_name: requiredText('Stage name', 150),
  supplier_id: supplierId,
});

// Reordering: the full list of this product's stage ids, in the new order.
// e.g. { "stage_ids": [12, 10, 11, 13] } → stage 12 becomes 1st, 10 becomes 2nd, ...
export const reorderSchema = z.object({
  stage_ids: z
    .array(z.coerce.number().int().positive(), { error: 'stage_ids must be a list of stage ids' })
    .min(1, 'stage_ids must contain at least one stage id'),
});