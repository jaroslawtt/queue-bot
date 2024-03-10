import { AbstractModel, DatabaseTableName } from '~/libs/database/database.js';
import { QueueParticipatesRange } from '~/packages/queues/libs/types/queue-participates-range.type.js';

class QueueUserModel extends AbstractModel {
  public 'queueId': number;
  public 'userId': number;
  public 'turn': QueueParticipatesRange;

  static get tableName() {
    return DatabaseTableName.USERS_QUEUES;
  }
}

export { QueueUserModel };
