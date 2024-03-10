import { AbstractModel, DatabaseTableName } from '~/libs/database/database.js';

class UserChatModel extends AbstractModel {
  public 'userId': number;
  public 'chatId': number;

  public static override get tableName(): string {
    return DatabaseTableName.USERS_CHATS;
  }
}

export { UserChatModel };
