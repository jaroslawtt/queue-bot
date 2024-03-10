import { AbstractModel, DatabaseTableName } from '~/libs/database/database.js';
import { QueueModel } from '~/packages/queues/queue.model.js';
import { Model, RelationMappings } from 'objection';
import { getJoinRelationPath } from '~/libs/helpers/helpers.js';
import { QueueUserModel } from '~/packages/queues-users/queue-user.model.js';
import { type QueueParticipatesRange } from '~/packages/queues/libs/types/queue-participates-range.type.js';
import { UserChatModel } from '~/packages/users-chats/user-chat.model.js';

class UserModel extends AbstractModel {
  public 'telegramId': number;

  public 'firstName': string | null;

  public 'lastName': string | null;

  public 'telegramUsername': string;

  public 'telegramTag': string | null;

  public 'turn': QueueParticipatesRange;

  public 'isAllowedNotification': boolean;

  public 'queues': QueueModel[];

  public 'userOnChats': UserChatModel[];

  public static override get tableName(): string {
    return DatabaseTableName.USERS;
  }

  public static relationMappings(): RelationMappings {
    return {
      queues: {
        relation: Model.ManyToManyRelation,
        modelClass: QueueModel,
        join: {
          from: getJoinRelationPath<UserModel>(
            DatabaseTableName.USERS,
            'telegramId',
          ),
          through: {
            from: getJoinRelationPath<QueueUserModel>(
              DatabaseTableName.USERS_QUEUES,
              'userId',
            ),
            to: getJoinRelationPath<QueueUserModel>(
              DatabaseTableName.USERS_QUEUES,
              'queueId',
            ),
          },
          to: getJoinRelationPath<QueueModel>(DatabaseTableName.QUEUES, 'id'),
        },
      },
      userOnChats: {
        relation: Model.HasManyRelation,
        modelClass: UserChatModel,
        join: {
          from: getJoinRelationPath<UserModel>(
            DatabaseTableName.USERS,
            'telegramId',
          ),
          to: getJoinRelationPath<UserChatModel>(
            DatabaseTableName.USERS_CHATS,
            'userId',
          ),
        },
      },
    };
  }
}

export { UserModel };
