import type { Knex } from 'knex';
import { DatabaseTableName } from '~/libs/database/libs/enums/database-table-name.enum.js';
import { MAX_QUEUE_PARTICIPATES_NUMBER } from '~/packages/queues/libs/constants.js';

const ColumnName = {
  QUEUE_ID: 'queue_id',
  USER_ID: 'user_id',
  TURN: 'turn',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
};

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(DatabaseTableName.USERS_QUEUES, (table) => {
    table
      .integer(ColumnName.QUEUE_ID)
      .unsigned()
      .references('id')
      .inTable(DatabaseTableName.QUEUES)
      .onDelete('CASCADE');
    table
      .integer(ColumnName.USER_ID)
      .unsigned()
      .references('telegram_id')
      .inTable(DatabaseTableName.USERS)
      .onDelete('CASCADE');
    table
      .integer(ColumnName.TURN)
      .checkBetween([0, MAX_QUEUE_PARTICIPATES_NUMBER])
      .notNullable();
    table
      .dateTime(ColumnName.CREATED_AT)
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .dateTime(ColumnName.UPDATED_AT)
      .notNullable()
      .defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(DatabaseTableName.USERS_QUEUES);
}
