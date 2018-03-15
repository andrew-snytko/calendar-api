exports.up = function(knex, Promise) {
  return knex.schema.createTable('tokens', table => {
    table.increments().primary();
    table.integer('userId').notNullable();
    table.foreign('userId').references('users.id');
    table.string('accessToken').notNullable();
    table.string('refreshToken').notNullable();
    table.timestamp('createdAt').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('tokens');
};
