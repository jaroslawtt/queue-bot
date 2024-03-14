import { QueueService } from '~/packages/queues/queue.service.js';
import { UserService } from '~/packages/users/user.service.js';
import { type AppCreateQueueData } from '~/packages/app/libs/types/app-create-queue-data.type.js';
import { type QueueItem } from '~/packages/queues/libs/types/queue-item.type.js';
import { type QueueUserCreateData } from '~/packages/queues-users/libs/types/queue-user-create-data.type.js';
import { type UserCreateData } from '~/packages/users/libs/types/user-create-data.type.js';
import { type QueueDequeueUserData } from '~/packages/queues/libs/types/queue-dequeue-user-data.type.js';
import { type UserItemWithTurn } from '~/packages/users/libs/types/user-item-with-turn-type.js';
import { InlineKeyboardButton } from 'node-telegram-bot-api';
import { type UserItem } from '~/packages/users/libs/types/user-item.type.js';
import { type UserUpdateNotificationDetailsType } from '~/packages/users/libs/types/user-update-notification-details.type.js';
import { type MetaData } from '~/libs/types/meta-data.type.js';
import { type QueueUpdateData } from '~/packages/queues/libs/types/queue-update-data.type.js';
import { type MessageCreate } from '~/packages/messages/types/message-create.type.js';
import { MessageItem } from '~/packages/messages/types/message-item.type';

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

  async findQueuesByChatId(
    chatId: number,
    options: {
      limit?: number;
      page?: number;
    },
  ) {
    return this.queueService.findByChatId(chatId, options);
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

  async deleteQueue(queueId: number): Promise<void> {
    return this.queueService.delete(queueId);
  }

  async updateUserNotificationDetails(
    payload: UserUpdateNotificationDetailsType,
  ): Promise<UserItem> {
    return this.userService.updateUserNotificationDetails(payload);
  }

  async updateQueueData(payload: QueueUpdateData) {
    return this.queueService.update({
      ...payload,
    });
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
  }: {
    chatId: number;
    messageId: number;
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

  generateQueuesListControlPanelData({
    queues,
    meta,
    userId,
    pageNumber,
  }: {
    queues: QueueItem[];
    meta: MetaData;
    userId: number;
    pageNumber: number;
  }): {
    template: string;
    inlineKeyboard: InlineKeyboardButton[][];
  } {
    let template = `${meta.totalItems > 0 ? `Active queues: ${meta.totalItems}` : 'Currently, there are no active queues.'}\n`;
    const inlineKeyboard: InlineKeyboardButton[][] = [];

    for (let i = 0; i < queues.length; i++) {
      template += `${i + 1}. ${queues[i].name}\n`;
      inlineKeyboard.push([
        {
          text: queues[i].name,
          callback_data: `queue/${queues[i].id}/${userId}/${pageNumber}`,
        },
      ]);
    }

    const paginationControls: InlineKeyboardButton[] = [];

    if (meta.currentPage < meta.totalPages) {
      if (meta.currentPage === 1)
        paginationControls.push({
          text: '➡️',
          callback_data: `page/${meta.currentPage + 1}/${userId}`,
        });
      if (meta.currentPage > 1) {
        paginationControls.push({
          text: '⬅️',
          callback_data: `page/${meta.currentPage - 1}/${userId}`,
        });
        paginationControls.push({
          text: '➡️',
          callback_data: `page/${meta.currentPage + 1}/${userId}`,
        });
      }
    }
    if (meta.currentPage === meta.totalPages) {
      if (meta.totalPages > 1) {
        paginationControls.push({
          text: '⬅️',
          callback_data: `page/${meta.currentPage - 1}/${userId}`,
        });
      }
    }

    return {
      template,
      inlineKeyboard:
        paginationControls.length > 0
          ? inlineKeyboard.concat([paginationControls])
          : inlineKeyboard,
    };
  }

  async assignMessageWithQueue(payload: MessageCreate) {
    return this.queueService.assignMessageWithQueue(payload);
  }

  async findQueueMessages(queueId: number): Promise<MessageItem[]> {
    return this.queueService.findQueueMessages(queueId);
  }

  generateQueueListTemplate({
    queue,
    creator,
    participants,
  }: {
    queue: QueueItem;
    creator: UserItem;
    participants: UserItemWithTurn[];
  }): string {
    const messageLink = this.generateMessageLink({
      messageId: queue.messageId as number,
      chatId: queue.chatId,
    });
    const createdAtDate = new Date(queue.createdAt);
    let template = `Name: ${queue.name}\nAuthor: ${creator.telegramTag ? '@' + creator.telegramTag : creator.telegramUsername}\nMessage link: ${messageLink}\nCreated: ${createdAtDate.toLocaleDateString('ru-RU')}\nUpdated: ${new Date().toLocaleDateString('ru-RU')} at ${new Date().toLocaleTimeString('ru-RU')}\n`;

    for (let i = 1; i <= queue.turns; i++) {
      const participant = participants.find(
        (participant) => participant.turn === i,
      );

      if (participant) {
        const telegramName = `${participant.telegramTag ? '@' + participant.telegramTag : participant.telegramUsername}`;
        let realName = '';

        if (participant.firstName) realName += `${participant.firstName} `;
        if (participant.lastName) realName += `${participant.lastName};`;

        template += `${i}. ${realName.length > 0 ? realName : telegramName}\n`;
      } else template += `${i}.\n`;
    }

    return template;
  }

  generateQueueDetailsControlsData({
    queue,
    creator,
    userId,
    pageNumber,
  }: {
    queue: QueueItem;
    creator: UserItem;
    userId: number;
    pageNumber: number;
  }): {
    template: string;
    inlineKeyboard: InlineKeyboardButton[][];
  } {
    const messageLink = this.generateMessageLink({
      messageId: queue.messageId as number,
      chatId: queue.chatId,
    });
    const template = `Name: ${queue.name}\nTurns: ${queue.turns}\nAuthor: ${creator.telegramTag ? '@' + creator.telegramTag : creator.telegramUsername}\nMessage link: ${messageLink}\nCreated: ${new Date(queue.createdAt).toLocaleDateString('ru-RU')}`;
    const inlineKeyboard: InlineKeyboardButton[][] = [
      [
        {
          text: 'List',
          callback_data: `list/${queue.id}/${userId}`,
        },
        {
          text: 'Delete',
          callback_data: `delete/${queue.id}/${userId}`,
        },
      ],
      [
        {
          text: 'Back',
          callback_data: `back/${pageNumber}/${userId}`,
        },
      ],
    ];

    return {
      template,
      inlineKeyboard,
    };
  }
}

export { AppService };
