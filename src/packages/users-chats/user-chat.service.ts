import { UserChatRepository } from '~/packages/users-chats/user-chat.repository.js';
import { type UserChatCreateData } from '~/packages/users-chats/libs/types/user-chat-create-data.type.js';
import { UserChatEntity } from '~/packages/users-chats/users-chats.js';
import { type UserChatItemFindData } from '~/packages/users-chats/libs/types/user-chat-item-find-data.type.js';
import { type UserChatItem } from '~/packages/users-chats/libs/types/user-chat-item.type.js';
import { type UserChatDeleteItemData } from '~/packages/users-chats/libs/types/user-chat-delete-data.type.js';

class UserChatService {
  private readonly userChatRepository: UserChatRepository;
  public constructor(userChatRepository: UserChatRepository) {
    this.userChatRepository = userChatRepository;
  }

  async create(userChatCreateData: UserChatCreateData): Promise<UserChatItem> {
    const { userId, chatId } = userChatCreateData;

    const userOnChat = await this.userChatRepository.create(
      UserChatEntity.initialize({
        chatId,
        userId,
      }),
    );

    return userOnChat.toObject();
  }

  async find(
    userChatItemFindData: UserChatItemFindData,
  ): Promise<UserChatItem | null> {
    const { userId, chatId } = userChatItemFindData;

    const userOnChat = await this.userChatRepository.find(
      UserChatEntity.initialize({
        chatId,
        userId,
      }),
    );

    if (!userOnChat) return null;

    return userOnChat.toObject();
  }

  async delete(userChatDeleteItemData: UserChatDeleteItemData): Promise<void> {
    const { userId, chatId } = userChatDeleteItemData;

    return this.userChatRepository.delete(
      UserChatEntity.initialize({
        userId,
        chatId,
      }),
    );
  }
}

export { UserChatService };
