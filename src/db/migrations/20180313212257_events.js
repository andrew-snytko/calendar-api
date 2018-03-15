exports.up = function(knex, Promise) {
  return knex.schema.createTable('events', table => {
    table.increments().primary();
    table.string('description');
    table.dateTime('startDate').notNullable();
    table.dateTime('endDate');
    table.integer('userId').notNullable();
    table.foreign('userId').references('users.id');
    table.integer('eventTypeId').notNullable();
    table.foreign('eventTypeId').references('eventTypes.id');
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('events');
};
