import { IRepository } from '~/libs/interfaces/repository.interface.js';
import { UserModel } from '~/packages/users/user.model.js';
import { UserEntity } from '~/packages/users/user.entity.js';
import { DatabaseTableName } from '~/libs/database/database.js';
import { getJoinRelationPath } from '~/libs/helpers/helpers.js';
import { QueueUserModel } from '~/packages/queues-users/queue-user.model.js';
import { UserChatEntity } from '~/packages/users-chats/user-chat.entity.js';

class UserRepository implements Omit<IRepository, 'findAll' | 'delete'> {
  private readonly queuesRelationExpression = 'queues';
  private readonly userOnChatsRelationExpression = 'userOnChats';
  private readonly userModel: typeof UserModel;

  public constructor(userModel: typeof UserModel) {
    this.userModel = userModel;
  }

  async create(payload: UserEntity): Promise<UserEntity> {
    const { telegramId, telegramUsername, telegramTag } = payload.toNewObject();

    const user = await this.userModel
      .query()
      .insert({
        telegramId,
        telegramUsername,
        telegramTag,
      })
      .returning('*');

    return UserEntity.initialize({
      telegramId: user.telegramId,
      firstName: user.firstName,
      lastName: user.lastName,
      telegramUsername: user.telegramUsername,
      telegramTag: user.telegramTag,
      isAllowedNotification: user.isAllowedNotification,
    });
  }

  delete(id: unknown): Promise<boolean> {
    return Promise.resolve(false);
  }

  async find(id: number): Promise<UserEntity | null> {
    const user = await this.userModel
      .query()
      .findOne('telegramId', id)
      .returning('*');

    if (!user) return null;

    return UserEntity.initialize({
      telegramId: user.telegramId,
      firstName: user.firstName,
      lastName: user.lastName,
      telegramUsername: user.telegramUsername,
      telegramTag: user.telegramTag,
      isAllowedNotification: user.isAllowedNotification,
    });
  }

  async update(payload: UserEntity): Promise<UserEntity> {
    const { telegramId, telegramUsername, telegramTag } = payload.toObject();

    await this.userModel
      .query()
      .patch({
        telegramUsername,
        telegramTag,
      })
      .where('telegramId', telegramId);

    const user = (await this.userModel
      .query()
      .findOne('telegramId', telegramId)
      .returning('*')) as UserModel;

    return UserEntity.initialize({
      telegramId: user.telegramId,
      firstName: user.firstName,
      lastName: user.lastName,
      telegramUsername: user.telegramUsername,
      telegramTag: user.telegramTag,
      isAllowedNotification: user.isAllowedNotification,
    });
  }

  async findByQueueId(queueId: number) {
    const users = await this.userModel
      .query()
      .select('*')
      .whereExists(
        UserModel.relatedQuery(this.queuesRelationExpression).where(
          'id',
          queueId,
        ),
      )
      .modify((qb) => {
        qb.select('turn')
          .from(DatabaseTableName.USERS)
          .join(
            DatabaseTableName.USERS_QUEUES,
            getJoinRelationPath<UserModel>(
              DatabaseTableName.USERS,
              'telegramId',
            ),
            getJoinRelationPath<QueueUserModel>(
              DatabaseTableName.USERS_QUEUES,
              'userId',
            ),
          )
          .where('queueId', queueId);
      });

    return users.map((user) =>
      UserEntity.initializeWithTurn({
        telegramId: user.telegramId,
        firstName: user.firstName,
        lastName: user.lastName,
        telegramUsername: user.telegramUsername,
        telegramTag: user.telegramTag,
        turn: user.turn,
        isAllowedNotification: user.isAllowedNotification,
      }),
    );
  }

  async updateUserDetails(payload: UserEntity): Promise<UserEntity> {
    const { telegramId, firstName, lastName } = payload.toObject();

    await this.userModel
      .query()
      .patch({
        firstName,
        lastName,
      })
      .where('telegramId', telegramId);

    const user = (await this.userModel
      .query()
      .findOne('telegramId', telegramId)
      .returning('*')) as UserModel;

    return UserEntity.initialize({
      telegramId: user.telegramId,
      firstName: user.firstName,
      lastName: user.lastName,
      telegramUsername: user.telegramUsername,
      telegramTag: user.telegramTag,
      isAllowedNotification: user.isAllowedNotification,
    });
  }

  async updateUserNotificationDetails(
    payload: UserEntity,
  ): Promise<UserEntity> {
    const { telegramId, isAllowedNotification } = payload.toObject();

    await this.userModel
      .query()
      .patch({
        isAllowedNotification,
      })
      .where('telegramId', telegramId);

    const user = (await this.userModel
      .query()
      .findOne('telegramId', telegramId)
      .returning('*')) as UserModel;

    return UserEntity.initialize({
      telegramId: user.telegramId,
      firstName: user.firstName,
      lastName: user.lastName,
      telegramUsername: user.telegramUsername,
      telegramTag: user.telegramTag,
      isAllowedNotification: user.isAllowedNotification,
    });
  }

  async getUsersByChatId(
    chatId: number,
    isOnlyAllowedNotifications: boolean = false,
  ): Promise<UserEntity[]> {
    const usersOnChat = await this.userModel
      .query()
      .select()
      .whereExists(
        UserModel.relatedQuery(this.userOnChatsRelationExpression).where(
          'chatId',
          chatId,
        ),
      )
      .where('isAllowedNotification', isOnlyAllowedNotifications)
      .returning('*');

    return usersOnChat.map((userOnChat) =>
      UserEntity.initialize({
        telegramId: userOnChat.telegramId,
        firstName: userOnChat.firstName,
        lastName: userOnChat.lastName,
        telegramUsername: userOnChat.telegramUsername,
        telegramTag: userOnChat.telegramTag,
        isAllowedNotification: userOnChat.isAllowedNotification,
      }),
    );
  }
}

export { UserRepository };
