import { IRepository } from '~/libs/interfaces/repository.interface.js';
import {
  UserChatEntity,
  UserChatModel,
} from '~/packages/users-chats/users-chats.js';

class UserChatRepository implements IRepository {
  private readonly userChatModel: typeof UserChatModel;

  public constructor(userChatModel: typeof UserChatModel) {
    this.userChatModel = userChatModel;
  }

  async find(payload: UserChatEntity): Promise<UserChatEntity | null> {
    const { userId, chatId } = payload.toObject();

    const userOnChat = await this.userChatModel.query().findOne({
      userId,
      chatId,
    });

    if (!userOnChat) return null;

    return UserChatEntity.initialize({
      userId: userOnChat.userId,
      chatId: userOnChat.chatId,
    });
  }
  findAll(): Promise<unknown[]> {
    throw new Error('Method not implemented.');
  }
  async create(payload: UserChatEntity): Promise<UserChatEntity> {
    const { userId, chatId } = payload.toObject();

    const userOnChat = await this.userChatModel
      .query()
      .insert({
        userId,
        chatId,
      })
      .returning('*');

    return UserChatEntity.initialize({
      userId: userOnChat.userId,
      chatId: userOnChat.chatId,
    });
  }
  update(payload: unknown): Promise<unknown> {
    throw new Error('Method not implemented.');
  }
  async delete(payload: UserChatEntity): Promise<void> {
    const { userId, chatId } = payload.toObject();

    return void (await this.userChatModel.query().delete().where({
      userId,
      chatId,
    }));
  }
}

export { UserChatRepository };
