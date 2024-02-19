import { QueueService } from '~/packages/queues/queue.service.js';
import { UserService } from '~/packages/users/user.service.js';
import { AppCreateQueueData } from '~/packages/app/libs/types/app-create-queue-data.type.js';
import { QueueItem } from '~/packages/queues/libs/types/queue-item.type.js';
import { QueueUserCreateData } from '~/packages/queues-users/libs/types/queue-user-create-data.type';
import { UserCreateData } from '~/packages/users/libs/types/user-create-data.type';
import { QueueDequeueUserData } from '~/packages/queues/libs/types/queue-dequeue-user-data.type';
import { UserItemWithTurn } from '~/packages/users/libs/types/user-item-with-turn-type';
import { InlineKeyboardButton } from 'node-telegram-bot-api';
import { UserItem } from '~/packages/users/libs/types/user-item.type';

class AppService {
  private readonly queueService: QueueService;
  private readonly userService: UserService;
  public constructor(queueService: QueueService, userService: UserService) {
    this.queueService = queueService;
    this.userService = userService;
  }

  async createQueue(queueCreateData: AppCreateQueueData): Promise<QueueItem> {
    const { name, turns, chatId, creatorId, creatorTag, creatorUsername } =
      queueCreateData;

    const user = await this.userService.find(creatorId);

    if (!user)
      await this.userService.create({
        telegramId: creatorId,
        telegramUsername: creatorUsername,
        telegramTag: creatorTag,
      });

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

  async upsertUser(userCreateData: UserCreateData) {
    const { telegramId, telegramUsername, telegramTag } = userCreateData;

    const user = this.userService.find(telegramId);

    if (!user) {
      return void (await this.userService.create({
        telegramId,
        telegramTag,
        telegramUsername,
      }));
    }

    return void (await this.userService.update({
      telegramUsername,
      telegramTag,
      telegramId,
    }));
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
}

export { AppService };
