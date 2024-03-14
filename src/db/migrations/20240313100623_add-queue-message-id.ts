import type { Knex } from 'knex';
import { DatabaseTableName } from '~/libs/database/database.js';

const ColumnName = {
  MESSAGE_ID: 'message_id',
};

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(DatabaseTableName.QUEUES, (table) => {
    table.bigint(ColumnName.MESSAGE_ID).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable(DatabaseTableName.QUEUES, (table) => {
    table.dropColumn(ColumnName.MESSAGE_ID);
  });
}
