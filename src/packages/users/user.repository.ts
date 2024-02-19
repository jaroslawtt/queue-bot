import { IRepository } from '~/libs/interfaces/repository.interface.js';
import { UserModel } from '~/packages/users/user.model.js';
import { UserEntity } from '~/packages/users/user.entity.js';
import { DatabaseTableName } from '~/libs/database/database.js';
import { getJoinRelationPath } from '~/libs/helpers/helpers.js';
import { QueueUserModel } from '~/packages/queues-users/queue-user.model.js';

class UserRepository implements Omit<IRepository, 'findAll' | 'delete'> {
  private readonly queuesRelationExpression = 'queues';
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
    });
  }

  delete(id: unknown): Promise<boolean> {
    return Promise.resolve(false);
  }

  async find(id: number): Promise<UserEntity | null> {
    const user = await this.userModel.query().findOne('telegramId', id);

    if (!user) return null;

    return UserEntity.initialize({
      telegramId: user.telegramId,
      firstName: user.firstName,
      lastName: user.lastName,
      telegramUsername: user.telegramUsername,
      telegramTag: user.telegramTag,
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
    });
  }
}

export { UserRepository };
