// Products: the items a company registers (e.g. EcoGrip Pro).
export async function up(knex) {
  await knex.schema.createTable('products', (table) => {
    table.increments('id'); // INT UNSIGNED AUTO_INCREMENT PRIMARY KEY
    table.string('name', 150).notNullable();
    table.string('sku', 50).notNullable().unique(); // unique index: no duplicate SKUs (AT-02)
    table.string('category', 100).notNullable();
    table.text('description').notNullable();
    table.string('primary_material', 150).notNullable();
    table.string('manufacture_country', 100).notNullable();
    table.string('image_url', 500).nullable(); // optional

    // created_at is set on insert; updated_at is refreshed by MySQL on every update
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
  });
}

export async function down(knex) {
  await knex.schema.dropTable('products');
}