// Certifications: self-reported compliance records for a product.
// There is deliberately NO status column: Valid / Expired / Not yet valid is
// calculated from the dates whenever it is shown, so it can never go stale.
export async function up(knex) {
  await knex.schema.createTable('certifications', (table) => {
    table.increments('id');

    table.integer('product_id').unsigned().notNullable()
      .references('id').inTable('products')
      .onDelete('CASCADE');

    table.string('name', 150).notNullable();
    table.string('issuer', 150).notNullable();
    table.string('certificate_number', 100).notNullable();
    table.date('issued_at').notNullable();
    table.date('expires_at').nullable(); // missing = "No expiry provided"
    table.string('evidence_url', 500).nullable();

    // Safety net in the database itself: expiry can't be before issue (AT-06).
    // (A NULL expiry passes this check.)
    table.check('?? >= ??', ['expires_at', 'issued_at'], 'certifications_expiry_after_issue');

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
  });
}

export async function down(knex) {
  await knex.schema.dropTable('certifications');
}