import type { Knex } from 'knex';
import { DatabaseTableName } from '~/libs/database/database.js';
import { MAX_QUEUE_PARTICIPATES_NUMBER } from '~/packages/queues/queues.js';

const ColumnName = {
  ID: 'id',
  NAME: 'name',
  CHAT_ID: 'chat_id',
  TURNS: 'turns',
  CREATOR_ID: 'creator_id',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
};

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(DatabaseTableName.QUEUES, (table) => {
    table.increments(ColumnName.ID).primary();
    table.string(ColumnName.NAME, 255).notNullable();
    table
      .integer(ColumnName.TURNS)
      .checkPositive()
      .checkBetween([0, MAX_QUEUE_PARTICIPATES_NUMBER])
      .notNullable()
      .defaultTo(32);
    table.integer(ColumnName.CHAT_ID).notNullable();
    table.integer(ColumnName.CREATOR_ID)
      .unsigned()
      .references('telegram_id')
      .inTable(DatabaseTableName.USERS)
      .onDelete('CASCADE');
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
  return knex.schema.dropTableIfExists(DatabaseTableName.QUEUES);
}
