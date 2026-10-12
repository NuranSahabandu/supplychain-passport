import { isDeepStrictEqual } from 'node:util';
import db from '../db.js';
import { withStatus } from '../utils/certificateStatus.js';
import { toIsoUtc } from '../utils/dates.js';

// Picks ONLY the fields that are allowed to be public from a full product detail.
// Internal ids, timestamps and supplier contact details are left out on purpose.
// Certificates keep their DATES, not a status: the status is calculated when the
// passport is viewed, so it stays correct as time passes (e.g. turns "Expired").
export function buildPassportPayload(productDetail) {
  return {
    product: {
      name: productDetail.name,
      sku: productDetail.sku,
      category: productDetail.category,
      description: productDetail.description,
      primary_material: productDetail.primary_material,
      manufacture_country: productDetail.manufacture_country,
      image_url: productDetail.image_url,
    },
    stages: productDetail.stages.map((stage) => ({
      stage_order: stage.stage_order,
      stage_name: stage.stage_name,
      supplier_name: stage.supplier_name,
      country: stage.country,
      location: stage.location,
    })),
    certifications: productDetail.certifications.map((certificate) => ({
      name: certificate.name,
      issuer: certificate.issuer,
      certificate_number: certificate.certificate_number,
      issued_at: certificate.issued_at,
      expires_at: certificate.expires_at,
      evidence_url: certificate.evidence_url,
    })),
  };
}

// Adds today's status to each certificate of a payload (for showing it).
export function withCertificateStatuses(payload) {
  return {
    ...payload,
    certifications: payload.certifications.map(withStatus),
  };
}

// The saved snapshot for a product, or undefined if it was never published.
export function findSnapshotForProduct(productId) {
  return db('passport_snapshots').where({ product_id: productId }).first();
}

// Publication info for the admin screens.
export function describePublication(snapshot, draftPayload) {
  if (!snapshot) {
    return { is_published: false, published_at: null, public_path: null, has_unpublished_changes: true };
  }
  return {
    is_published: true,
    published_at: toIsoUtc(snapshot.published_at),
    public_path: `/passport/${snapshot.sku}`,
    // Compares the saved snapshot with what would be published now, value by value.
    // (Not by JSON text: MySQL may store object keys in a different order.)
    has_unpublished_changes: !isDeepStrictEqual(snapshot.payload_json, draftPayload),
  };
}