import db from '../db.js';
import { HttpError, notFound } from '../utils/httpError.js';
import { toIsoUtc } from '../utils/dates.js';
import { getProductDetail } from '../services/productService.js';
import {
  buildPassportPayload,
  withCertificateStatuses,
  findSnapshotForProduct,
  describePublication,
} from '../services/passportService.js';

// GET /api/products/:id/passport-preview   (admin)
// Shows what the passport WOULD look like if published now, built from the live tables.
export async function previewPassport(req, res) {
  const detail = await getProductDetail(req.params.id);
  const draftPayload = buildPassportPayload(detail);
  const snapshot = await findSnapshotForProduct(detail.id);

  res.json({
    publication: describePublication(snapshot, draftPayload),
    passport: withCertificateStatuses(draftPayload),
  });
}

// POST /api/products/:id/publish   (admin)
// Freezes the current product information into a snapshot. Publishing again overwrites it.
export async function publishPassport(req, res) {
  const detail = await getProductDetail(req.params.id);
  const payload = buildPassportPayload(detail);

  // Another product may still hold this SKU in its own (older) snapshot,
  // e.g. after SKUs were swapped between products. Two passports can't share one URL.
  const skuTaken = await db('passport_snapshots')
    .where({ sku: detail.sku })
    .whereNot({ product_id: detail.id })
    .first();
  if (skuTaken) {
    throw new HttpError(409, `Another product's published passport already uses SKU "${detail.sku}".`);
  }

  // Insert the snapshot, or replace this product's existing one (one snapshot per product)
  await db('passport_snapshots')
    .insert({
      product_id: detail.id,
      sku: detail.sku,
      payload_json: JSON.stringify(payload),
      published_at: db.fn.now(),
    })
    .onConflict('product_id')
    .merge();

  const snapshot = await findSnapshotForProduct(detail.id);
  res.json(describePublication(snapshot, payload));
}

// GET /api/public/passports/:sku   (public, read-only, no login)
// Reads ONLY the snapshot table, never the editable product tables.
export async function getPublicPassport(req, res) {
  const sku = String(req.params.sku).toUpperCase();
  const snapshot = await db('passport_snapshots').where({ sku }).first();

  // Same answer for "unknown SKU" and "not published", so drafts stay invisible
  if (!snapshot) {
    throw notFound('No published passport was found for this product.');
  }

  res.json({
    published_at: toIsoUtc(snapshot.published_at),
    ...withCertificateStatuses(snapshot.payload_json),
  });
}