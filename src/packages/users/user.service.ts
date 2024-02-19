import { UserRepository } from '~/packages/users/user.repository.js';
import {
  UserCreateData,
  UserItem,
  UserItemWithTurn,
  UserUpdateData,
  UserUpdateDetailsData,
} from '~/packages/users/libs/types/types.js';
import { UserEntity } from '~/packages/users/user.entity.js';

class UserService {
  private readonly userRepository: UserRepository;
  public constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async create(payload: UserCreateData): Promise<UserItem> {
    const { telegramId, telegramUsername, telegramTag } = payload;

    const user = await this.userRepository.create(
      UserEntity.initializeNew({
        telegramId,
        telegramUsername,
        telegramTag,
      }),
    );

    return user.toObject();
  }

  async update(payload: UserUpdateData): Promise<UserItem> {
    const { telegramId, telegramUsername, telegramTag } = payload;

    const user = await this.userRepository.update(
      UserEntity.initialize({
        telegramId,
        telegramUsername,
        telegramTag,
        firstName: null,
        lastName: null,
      }),
    );

    return user.toObject();
  }

  async updateUserDetails(payload: UserUpdateDetailsData): Promise<UserItem> {
    const { telegramId, firstName, lastName } = payload;

    const user = await this.userRepository.updateUserDetails(
      UserEntity.initialize({
        telegramId,
        firstName,
        lastName,
        telegramTag: null,
        telegramUsername: '',
      }),
    );

    return user.toObject();
  }

  async find(id: number): Promise<UserItem | null> {
    const user = await this.userRepository.find(id);

    if (!user) return null;

    return user.toObject();
  }

  async findByQueueId(queueId: number): Promise<UserItemWithTurn[]> {
    const users = await this.userRepository.findByQueueId(queueId);

    return users.map((user) => user.toObjectWithTurn());
  }
}

export { UserService };
