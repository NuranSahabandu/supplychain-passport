// Passport snapshots: the frozen, public copy of a product saved when it is published.
// The public passport page reads ONLY from this table, never from the editable tables.
export async function up(knex) {
  await knex.schema.createTable('passport_snapshots', (table) => {
    table.increments('id');

    table.integer('product_id').unsigned().notNullable().unique() // one (latest) snapshot per product
      .references('id').inTable('products')
      .onDelete('CASCADE');

    // The SKU as it was at publish time. The public URL looks up this column,
    // so renaming a SKU in the admin doesn't change the public URL until republish.
    table.string('sku', 50).notNullable().unique();

    table.json('payload_json').notNullable(); // product + stages + certificates, frozen
    table.timestamp('published_at').notNullable();

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
  });
}

export async function down(knex) {
  await knex.schema.dropTable('passport_snapshots');
}