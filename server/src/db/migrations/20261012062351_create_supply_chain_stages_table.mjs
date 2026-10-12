// Supply-chain stages: the ordered steps of one product's journey.
// Each stage points to a product and to a supplier (the country comes from the supplier).
export async function up(knex) {
  await knex.schema.createTable('supply_chain_stages', (table) => {
    table.increments('id');

    table.integer('product_id').unsigned().notNullable()
      .references('id').inTable('products')
      .onDelete('CASCADE'); // deleting a product deletes its stages

    table.integer('supplier_id').unsigned().notNullable()
      .references('id').inTable('suppliers')
      .onDelete('RESTRICT'); // a supplier that is used in a stage cannot be deleted

    table.string('stage_name', 150).notNullable();
    table.integer('stage_order').unsigned().notNullable(); // 1, 2, 3, ...

    // A product cannot have two stages with the same position
    table.unique(['product_id', 'stage_order']);

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
  });
}

export async function down(knex) {
  await knex.schema.dropTable('supply_chain_stages');
}