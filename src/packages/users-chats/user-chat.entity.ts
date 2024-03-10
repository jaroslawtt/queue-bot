import { IEntity } from '~/libs/interfaces/entity.interface.js';

class UserChatEntity implements Pick<IEntity, 'toObject'> {
  private readonly 'userId': number | null;
  private readonly 'chatId': number | null;

  private constructor({
    userId,
    chatId,
  }: {
    userId: number | null;
    chatId: number | null;
  }) {
    this.userId = userId;
    this.chatId = chatId;
  }

  public static initialize({
    userId,
    chatId,
  }: {
    userId: number;
    chatId: number;
  }) {
    return new UserChatEntity({
      userId,
      chatId,
    });
  }

  toObject(): {
    userId: number;
    chatId: number;
  } {
    return {
      userId: this.userId as number,
      chatId: this.chatId as number,
    };
  }
}

export { UserChatEntity };
