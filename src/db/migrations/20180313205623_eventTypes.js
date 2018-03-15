exports.up = function(knex, Promise) {
  return knex.schema.createTable('eventTypes', table => {
    table.increments().primary();
    table
      .string('name')
      .notNullable()
      .unique();
    table.timestamp('createdAt').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('eventTypes');
};
