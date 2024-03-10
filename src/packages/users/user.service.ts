import { UserRepository } from '~/packages/users/user.repository.js';
import {
  UserCreateData,
  UserItem,
  UserItemWithTurn,
  UserUpdateData,
  UserUpdateDetailsData,
  UserUpdateNotificationDetailsType,
} from '~/packages/users/libs/types/types.js';
import { UserEntity } from '~/packages/users/user.entity.js';
import { UserChatService } from '~/packages/users-chats/user-chat.service.js';

class UserService {
  private readonly userRepository: UserRepository;
  private readonly userChatService: UserChatService;

  public constructor(
    userRepository: UserRepository,
    userChatService: UserChatService,
  ) {
    this.userRepository = userRepository;
    this.userChatService = userChatService;
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
      UserEntity.initializeNew({
        telegramId,
        telegramUsername,
        telegramTag,
      }),
    );

    return user.toObject();
  }

  async getUsersByChatId(
    chatId: number,
    isAllowedNotifications: boolean = false,
  ): Promise<UserItem[]> {
    const usersOnChat = await this.userRepository.getUsersByChatId(
      chatId,
      isAllowedNotifications,
    );

    return usersOnChat.map((userOnChat) => userOnChat.toObject());
  }

  async updateUserDetails(payload: UserUpdateDetailsData): Promise<UserItem> {
    const { telegramId, firstName, lastName } = payload;

    const user = await this.userRepository.updateUserDetails(
      UserEntity.initializeForUserDetailsUpdate({
        telegramId,
        firstName,
        lastName,
      }),
    );

    return user.toObject();
  }

  async updateUserNotificationDetails(
    payload: UserUpdateNotificationDetailsType,
  ): Promise<UserItem> {
    const { telegramId, isAllowedNotification } = payload;
    const user = await this.userRepository.updateUserNotificationDetails(
      UserEntity.initializeForUserNotificationUpdate({
        telegramId,
        isAllowedNotification,
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

  async associateUserWithChat({
    chatId,
    userId,
  }: {
    userId: number;
    chatId: number;
  }): Promise<void> {
    const userOnChat = await this.userChatService.find({
      chatId,
      userId,
    });

    if (userOnChat) return;

    return void this.userChatService.create({
      chatId,
      userId,
    });
  }

  async dissociateUserWithChat({
    chatId,
    userId,
  }: {
    userId: number;
    chatId: number;
  }): Promise<void> {
    const userOnChat = await this.userChatService.find({
      chatId,
      userId,
    });

    if (userOnChat) return;
    return void this.userChatService.delete({
      chatId,
      userId,
    });
  }
}

export { UserService };
