import { AbstractModel, DatabaseTableName } from '~/libs/database/database.js';

class MessageModel extends AbstractModel {
  public 'id': number;
  public 'queueId': number;

  static get tableName() {
    return DatabaseTableName.MESSAGES;
  }
}

export { MessageModel };
