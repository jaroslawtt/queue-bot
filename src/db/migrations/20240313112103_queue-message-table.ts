import type { Knex } from 'knex';
import { DatabaseTableName } from '~/libs/database/database.js';

const ColumnName = {
  ID: 'id',
  QUEUE_ID: 'queue_id',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
};

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(DatabaseTableName.MESSAGES, (table) => {
    table.bigint(ColumnName.ID).primary();
    table
      .integer(ColumnName.QUEUE_ID)
      .unsigned()
      .references('id')
      .inTable(DatabaseTableName.QUEUES)
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
  return knex.schema.dropTableIfExists(DatabaseTableName.MESSAGES);
}
