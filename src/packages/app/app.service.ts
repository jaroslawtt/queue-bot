import { QueueService } from '~/packages/queues/queue.service.js';
import { UserService } from '~/packages/users/user.service.js';
import { type AppCreateQueueData } from '~/packages/app/libs/types/app-create-queue-data.type.js';
import { type QueueItem } from '~/packages/queues/libs/types/queue-item.type.js';
import { type QueueUserCreateData } from '~/packages/queues-users/libs/types/queue-user-create-data.type.js';
import { type UserCreateData } from '~/packages/users/libs/types/user-create-data.type.js';
import { type QueueDequeueUserData } from '~/packages/queues/libs/types/queue-dequeue-user-data.type.js';
import { type UserItemWithTurn } from '~/packages/users/libs/types/user-item-with-turn-type.js';
import TelegramBot, {
  ChatType,
  InlineKeyboardButton,
} from 'node-telegram-bot-api';
import { type UserItem } from '~/packages/users/libs/types/user-item.type.js';
import { type UserUpdateNotificationDetailsType } from '~/packages/users/libs/types/user-update-notification-details.type';

class AppService {
  private readonly queueService: QueueService;
  private readonly userService: UserService;
  public constructor(queueService: QueueService, userService: UserService) {
    this.queueService = queueService;
    this.userService = userService;
  }

  async createQueue(queueCreateData: AppCreateQueueData): Promise<QueueItem> {
    const { name, turns, chatId, creatorId } = queueCreateData;

    return this.queueService.create({
      name,
      turns,
      chatId,
      creatorId,
    });
  }

  async findQueue(queueId: number): Promise<QueueItem | null> {
    return this.queueService.find(queueId);
  }

  async insertUser(userCreateData: UserCreateData) {
    const { telegramId, telegramUsername, telegramTag } = userCreateData;

    return this.userService.create({
      telegramId,
      telegramTag,
      telegramUsername,
    });
  }

  async upsertUser(userCreateData: UserCreateData): Promise<UserItem> {
    const { telegramId, telegramUsername, telegramTag } = userCreateData;

    const user = await this.findUser(telegramId);

    if (!user) {
      return this.insertUser({
        telegramId,
        telegramTag,
        telegramUsername,
      });
    }

    return this.userService.update({
      telegramUsername,
      telegramTag,
      telegramId,
    });
  }

  async enqueueUser(queueUserCreateData: QueueUserCreateData) {
    const { userId, queueId, turn } = queueUserCreateData;

    return this.queueService.enqueue({
      userId,
      queueId,
      turn,
    });
  }

  async dequeueUser(dequeueUserData: QueueDequeueUserData) {
    const { userId, queueId } = dequeueUserData;

    return this.queueService.dequeue({
      userId,
      queueId,
    });
  }

  async findQueueParticipants(queueId: number) {
    return this.userService.findByQueueId(queueId);
  }

  async findUser(userId: number): Promise<UserItem | null> {
    return this.userService.find(userId);
  }

  async allowUserGetNotifications(telegramId: number) {
    return this.userService.updateUserNotificationDetails({
      telegramId,
      isAllowedNotification: true,
    });
  }

  async forbidUserGetNotifications(telegramId: number) {
    return this.userService.updateUserNotificationDetails({
      telegramId,
      isAllowedNotification: false,
    });
  }

  async associateUserWithChat({
    userId,
    chatId,
  }: {
    userId: number;
    chatId: number;
  }) {
    return this.userService.associateUserWithChat({
      userId,
      chatId,
    });
  }

  async getUsersByChatId(
    chatId: number,
    isAllowedNotifications: boolean = false,
  ): Promise<UserItem[]> {
    return this.userService.getUsersByChatId(chatId, isAllowedNotifications);
  }

  async dissociateUserWithChat({
    userId,
    chatId,
  }: {
    userId: number;
    chatId: number;
  }) {
    return this.userService.dissociateUserWithChat({
      userId,
      chatId,
    });
  }

  async updateUserNotificationDetails(
    payload: UserUpdateNotificationDetailsType,
  ): Promise<UserItem> {
    return this.userService.updateUserNotificationDetails(payload);
  }

  generateQueueListData({
    queue,
    creator,
    users = [],
  }: {
    queue: QueueItem;
    creator: UserItem;
    users?: UserItemWithTurn[];
  }): {
    inlineKeyboard: InlineKeyboardButton[][];
    template: string;
  } {
    const inlineKeyboard: InlineKeyboardButton[][] = [];
    let template = `Name: <code>${queue.name}</code>\nParticipants: ${queue.turns}\nCreator: ${creator.telegramTag ? '@' + creator.telegramTag : creator.telegramUsername}\n`;

    for (let i = 1; i <= queue.turns; i++) {
      const user = users.find((user) => user.turn === i);

      if (user) {
        template += `${i}. ${user.telegramTag ? '@' + user.telegramTag : user.telegramUsername}\n`;
      } else {
        template += `${i}.\n`;
        const lastKeyboardRow = inlineKeyboard.at(-1);
        if (!lastKeyboardRow || lastKeyboardRow.length === 3) {
          inlineKeyboard.push([
            {
              text: `${i}`,
              callback_data: `turn/${i}/${queue.id}`,
            },
          ]);
        } else {
          lastKeyboardRow.push({
            text: `${i}`,
            callback_data: `turn/${i}/${queue.id}`,
          });
        }
      }
    }
    inlineKeyboard.push([
      {
        text: 'Cancel',
        callback_data: `cancel//${queue.id}`,
      },
    ]);

    return {
      template,
      inlineKeyboard,
    };
  }

  generateMessageLink({
    chatId,
    messageId,
    chatType,
  }: {
    chatId: number;
    messageId: number;
    chatType: ChatType;
  }): string {
    return `https://t.me/c/${chatId.toString().split('').slice(4).join('')}/${messageId}`;
  }

  generateNotificationMessage({
    chatTitle,
    username,
    queueTitle,
    messageLink,
  }: {
    chatTitle: string | undefined;
    queueTitle: string;
    username: string;
    messageLink: string;
  }): string {
    return `<i>${username}</i> has set up a new queue called <b>"${queueTitle}"</b> in the <b>${chatTitle}</b> chat! \nMessage link: ${messageLink}`;
  }
}

export { AppService };
