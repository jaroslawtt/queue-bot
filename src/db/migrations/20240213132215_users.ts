import type { Knex } from 'knex';
import { DatabaseTableName } from '~/libs/database/database.js';

const ColumnName = {
  TELEGRAM_ID: 'telegram_id',
  FIRST_NAME: 'first_name',
  LAST_NAME: 'last_name',
  TELEGRAM_USERNAME: 'telegram_username',
  TELEGRAM_TAG: 'telegram_tag',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
};

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(DatabaseTableName.USERS, (table) => {
    table.integer(ColumnName.TELEGRAM_ID).unique().notNullable().primary();
    table.string(ColumnName.TELEGRAM_USERNAME, 255).notNullable();
    table.string(ColumnName.FIRST_NAME, 255).nullable();
    table.string(ColumnName.LAST_NAME, 255).nullable();
    table.string(ColumnName.TELEGRAM_TAG, 255).nullable();
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
  return knex.schema.dropTableIfExists(DatabaseTableName.USERS);
}
