import { UserRepository } from '~/packages/users/user.repository.js';
import {
  UserCreateData,
  UserItem,
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
}

export { UserService };
