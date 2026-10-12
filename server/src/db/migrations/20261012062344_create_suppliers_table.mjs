// Suppliers: companies that take part in a product's supply chain.
// Stored once and referenced by stages, so supplier details are never copied around.
export async function up(knex) {
  await knex.schema.createTable('suppliers', (table) => {
    table.increments('id');
    table.string('name', 150).notNullable();
    table.string('country', 100).notNullable();
    table.string('location', 150).nullable(); // e.g. "Colombo"
    table.string('contact', 255).nullable();  // free text, e.g. an email

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable()
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
  });
}

export async function down(knex) {
  await knex.schema.dropTable('suppliers');
}