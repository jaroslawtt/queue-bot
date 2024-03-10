import type { Knex } from 'knex';
import { DatabaseTableName } from '~/libs/database/database.js';

const ColumnName = {
  USER_ID: 'user_id',
  CHAT_ID: 'chat_id',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
};

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(DatabaseTableName.USERS_CHATS, (table) => {
    table
      .bigint(ColumnName.USER_ID)
      .unsigned()
      .references('telegram_id')
      .inTable(DatabaseTableName.USERS)
      .onDelete('CASCADE');
    table.bigint(ColumnName.CHAT_ID);
    table
      .dateTime(ColumnName.CREATED_AT)
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .dateTime(ColumnName.UPDATED_AT)
      .notNullable()
      .defaultTo(knex.fn.now());
    table.primary([ColumnName.CHAT_ID, ColumnName.USER_ID]);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(DatabaseTableName.USERS_CHATS);
}
