import { IRepository } from '~/libs/interfaces/repository.interface.js';
import { UserModel } from '~/packages/users/user.model.js';
import { UserEntity } from '~/packages/users/user.entity.js';

class UserRepository implements Omit<IRepository, 'findAll' | 'delete'> {
  private readonly userModel: typeof UserModel;

  public constructor(userModel: typeof UserModel) {
    this.userModel = userModel;
  }

  async create(payload: UserEntity): Promise<UserEntity> {
    const { telegramId, telegramUsername, telegramTag } = payload.toNewObject();

    const user = await this.userModel.query().insert({
      telegramId,
      telegramUsername,
      telegramTag,
    });

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

    const user = await this.userModel
      .query()
      .patchAndFetch({
        telegramUsername,
        telegramTag,
      })
      .where('telegramId', telegramTag);

    return UserEntity.initialize({
      telegramId: user.telegramId,
      firstName: user.firstName,
      lastName: user.lastName,
      telegramUsername: user.telegramUsername,
      telegramTag: user.telegramTag,
    });
  }

  async updateUserDetails(payload: UserEntity): Promise<UserEntity> {
    const { telegramId, firstName, lastName } = payload.toObject();

    const user = await this.userModel
      .query()
      .patchAndFetch({
        firstName,
        lastName,
      })
      .where('telegramId', telegramId);

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
