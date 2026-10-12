import db from '../db.js';
import { findOrFail } from '../utils/findOrFail.js';
import { withStatus } from '../utils/certificateStatus.js';

// POST /api/products/:productId/certifications
export async function createCertification(req, res) {
  const product = await findOrFail('products', req.params.productId, 'Product');

  const [newId] = await db('certifications').insert({ ...req.body, product_id: product.id });
  const certificate = await findOrFail('certifications', newId, 'Certificate');

  res.status(201).json(withStatus(certificate));
}

// PUT /api/certifications/:id
export async function updateCertification(req, res) {
  const certificate = await findOrFail('certifications', req.params.id, 'Certificate');

  await db('certifications').where({ id: certificate.id }).update(req.body);
  const updated = await findOrFail('certifications', certificate.id, 'Certificate');

  res.json(withStatus(updated));
}

// DELETE /api/certifications/:id
export async function deleteCertification(req, res) {
  const certificate = await findOrFail('certifications', req.params.id, 'Certificate');
  await db('certifications').where({ id: certificate.id }).del();
  res.status(204).end();
}