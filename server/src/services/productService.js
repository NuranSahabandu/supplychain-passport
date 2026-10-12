import { findOrFail } from '../utils/findOrFail.js';
import db from '../db.js';
import { getStagesForProduct } from './stageService.js';
import { withStatus } from '../utils/certificateStatus.js';

// Everything about one product in a single object:
// the product's fields + its ordered stages + its certificates with statuses.
// Used by the product detail page now, and by passport preview/publish in Step 4.
export async function getProductDetail(productId) {
  const product = await findOrFail('products', productId, 'Product');

  const stages = await getStagesForProduct(product.id);

  const certifications = await db('certifications')
    .where({ product_id: product.id })
    .orderBy('issued_at');

  return {
    ...product,
    stages,
    certifications: certifications.map(withStatus),
  };
}