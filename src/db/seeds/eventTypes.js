exports.seed = function(knex, Promise) {
  return knex('eventTypes')
    .del()
    .then(function() {
      return knex('eventTypes').insert([
        { name: 'встреча' },
        { name: 'напоминание' },
        { name: 'день рождения' },
      ]);
    });
};
