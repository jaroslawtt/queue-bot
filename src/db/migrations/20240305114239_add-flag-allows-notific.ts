import type { Knex } from 'knex';
import { DatabaseTableName } from '~/libs/database/database.js';

const ColumnName = {
  IS_ALLOWED_NOTIFICATION: 'is_allowed_notification',
};

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(DatabaseTableName.USERS, (table) => {
    table
      .boolean(ColumnName.IS_ALLOWED_NOTIFICATION)
      .notNullable()
      .defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable(DatabaseTableName.USERS, (table) => {
    table.dropColumn(ColumnName.IS_ALLOWED_NOTIFICATION);
  });
}
