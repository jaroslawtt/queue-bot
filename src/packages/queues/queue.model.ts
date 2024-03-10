import { AbstractModel, DatabaseTableName } from '~/libs/database/database.js';
import { type QueueParticipatesRange } from '~/packages/queues/libs/types/queue-participates-range.type.js';
import { UserModel } from '~/packages/users/user.model.js';
import { Model, RelationMappings } from 'objection';
import { getJoinRelationPath } from '~/libs/helpers/helpers.js';
import { QueueUserModel } from '~/packages/queues-users/queue-user.model.js';

class QueueModel extends AbstractModel {
  public 'id': number;

  public 'name': string;

  public 'turns': QueueParticipatesRange;

  public 'creatorId': number;

  public 'chatId': number;

  public 'users': UserModel[];

  public static override get tableName(): string {
    return DatabaseTableName.QUEUES;
  }

  static get relationMappings(): RelationMappings {
    return {
      users: {
        relation: Model.ManyToManyRelation,
        modelClass: UserModel,
        join: {
          from: getJoinRelationPath<QueueModel>(DatabaseTableName.QUEUES, 'id'),
          through: {
            from: getJoinRelationPath<QueueUserModel>(
              DatabaseTableName.USERS_QUEUES,
              'queueId',
            ),
            to: getJoinRelationPath<QueueUserModel>(
              DatabaseTableName.USERS_QUEUES,
              'userId',
            ),
          },
          to: getJoinRelationPath<UserModel>(
            DatabaseTableName.USERS,
            'telegramId',
          ),
        },
      },
    };
  }
}

export { QueueModel };
