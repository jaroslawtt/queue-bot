import { AbstractModel, DatabaseTableName } from '~/libs/database/database.js';

class QueueUserModel extends AbstractModel {
  public 'queueId': number;
  public 'userId': number;
  public 'turn': number;

  static get tableName() {
    return DatabaseTableName.USERS_QUEUES;
  }
}

export { QueueUserModel };
