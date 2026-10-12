// Demo data for EcoGrip Pro, based on data/sample-product.json and
// data/sample-certifications.csv from the assignment brief.
// WARNING: running this seed deletes ALL existing data first.
import sample from './data/sample-product.json' with { type: 'json' };

// The third certificate only appears in sample-certifications.csv.
// It has a future issue date, so it demonstrates "Not yet valid" (AT-05).
const futureCertificate = {
  name: 'Future Certificate (demo record)',
  issuer: 'Example Certification Body',
  certificate_number: 'DEMO-FUT-003',
  issued_at: '2027-01-01',
  expires_at: '2028-01-01',
  evidence_url: null,
};

export async function seed(knex) {
  // 1. Empty the tables. Children first, because foreign keys
  //    stop us deleting a row that other rows still point to.
  await knex('passport_snapshots').del();
  await knex('certifications').del();
  await knex('supply_chain_stages').del();
  await knex('suppliers').del();
  await knex('products').del();

  // 2. Insert the product. With MySQL, insert() returns [newId].
  const [productId] = await knex('products').insert({
    name: sample.name,
    sku: sample.sku,
    category: sample.category,
    description: sample.description,
    primary_material: sample.primary_material,
    manufacture_country: sample.manufacture_country,
    image_url: sample.image_url,
  });

  // 3. Insert suppliers, remembering which new id belongs to which code.
  //    The JSON links stages to suppliers by code ("SUP-01"), but our
  //    database links them by id, so we need this lookup.
  const supplierIdByCode = {};
  for (const supplier of sample.suppliers) {
    const [supplierId] = await knex('suppliers').insert({
      name: supplier.name,
      country: supplier.country,
      location: supplier.location,
    });
    supplierIdByCode[supplier.code] = supplierId;
  }

  // 4. Insert the stages, translating supplier codes into ids.
  for (const stage of sample.stages) {
    await knex('supply_chain_stages').insert({
      product_id: productId,
      supplier_id: supplierIdByCode[stage.supplier_code],
      stage_name: stage.stage_name,
      stage_order: stage.stage_order,
    });
  }

  // 5. Insert the certificates (2 from the JSON + 1 from the CSV).
  const certificates = [...sample.certifications, futureCertificate];
  for (const certificate of certificates) {
    await knex('certifications').insert({ product_id: productId, ...certificate });
  }

  // The product is NOT published here on purpose:
  // publishing is part of the demo (Preview → Publish).
}