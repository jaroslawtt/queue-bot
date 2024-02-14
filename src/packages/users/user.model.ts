import { AbstractModel, DatabaseTableName } from '~/libs/database/database.js';

class UserModel extends AbstractModel {
  public 'telegramId': number;

  public 'firstName': string | null;

  public 'lastName': string | null;

  public 'telegramUsername': string;

  public 'telegramTag': string | null;

  public static override get tableName(): string {
    return DatabaseTableName.USERS;
  }
}

export { UserModel };
