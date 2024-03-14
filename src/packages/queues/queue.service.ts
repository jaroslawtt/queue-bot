import { QueueRepository } from '~/packages/queues/queue.repository.js';
import { type QueueCreateData } from '~/packages/queues/libs/types/queue-create-data.type.js';
import { QueueEntity } from '~/packages/queues/queue.entity.js';
import { type QueueEnqueueUserData } from '~/packages/queues/libs/types/queue-enqueue-user-data.type.js';
import { type QueueDequeueUserData } from '~/packages/queues/libs/types/queue-dequeue-user-data.type.js';
import { QueueUserService } from '~/packages/queues-users/queue-user.service.js';
import { type QueueItem } from '~/packages/queues/libs/types/queue-item.type.js';
import { ApplicationError } from '~/libs/exceptions/application-error/application-error.exception.js';
import { ApplicationErrorCause } from '~/libs/exceptions/application-error/libs/enums/application-error-cause.enum.js';
import { type QueueItemList } from '~/packages/queues/libs/types/queue-item-list.type.js';
import { type QueueUpdateData } from '~/packages/queues/libs/types/queue-update-data.type.js';
import { type QueueParticipatesRange } from '~/packages/queues/libs/types/queue-participates-range.type.js';
import { MessageService } from '~/packages/messages/message.service';
import { MessageCreate } from '~/packages/messages/types/message-create.type';
import { MessageItem } from '~/packages/messages/types/message-item.type';

class QueueService {
  private readonly queueRepository: QueueRepository;
  private readonly queueUserService: QueueUserService;
  private readonly messageService: MessageService;
  public constructor(
    queueRepository: QueueRepository,
    queueUserService: QueueUserService,
    messageService: MessageService,
  ) {
    this.queueRepository = queueRepository;
    this.queueUserService = queueUserService;
    this.messageService = messageService;
  }

  async create(data: QueueCreateData) {
    const { name, turns, chatId, creatorId } = data;

    const queue = await this.queueRepository.create(
      QueueEntity.initializeNew({
        name,
        turns,
        chatId,
        creatorId,
      }),
    );

    return queue.toObject();
  }

  async delete(id: number): Promise<void> {
    return this.queueRepository.delete(id);
  }

  async enqueue(enqueueUserData: QueueEnqueueUserData) {
    const { queueId, userId, turn } = enqueueUserData;

    const queue = await this.queueRepository.find(queueId);

    if (!queue)
      throw new ApplicationError({
        message: 'Queue does not exist',
        cause: ApplicationErrorCause.QUEUE_NOT_EXIST,
      });

    const isUserInQueue = !!(await this.queueUserService.find({
      userId,
      queueId,
    }));

    if (isUserInQueue)
      throw new ApplicationError({
        message: 'You are already in the queue',
        cause: ApplicationErrorCause.ALREADY_IN_QUEUE,
      });

    const isTurnTaken = !!(await this.queueUserService.findByQueueIdAndTurn(
      queueId,
      turn,
    ));

    if (isTurnTaken)
      throw new ApplicationError({
        message: 'Turn is already taken',
        cause: ApplicationErrorCause.TURN_TAKEN,
      });

    return this.queueUserService.create({
      queueId,
      userId,
      turn,
    });
  }

  async dequeue(dequeueUserData: QueueDequeueUserData) {
    const { queueId, userId } = dequeueUserData;

    const queue = await this.queueRepository.find(queueId);

    if (!queue)
      throw new ApplicationError({
        message: 'Queue does not exist',
        cause: ApplicationErrorCause.QUEUE_NOT_EXIST,
      });

    const isUserInQueue = !!(await this.queueUserService.find({
      userId,
      queueId,
    }));

    if (!isUserInQueue)
      throw new ApplicationError({
        message: 'You are not in the queue',
        cause: ApplicationErrorCause.NOT_IN_THE_QUEUE,
      });

    return this.queueUserService.delete({
      queueId,
      userId,
    });
  }

  async assignMessageWithQueue(payload: MessageCreate) {
    return this.messageService.create(payload);
  }

  async findQueueMessages(queueId: number): Promise<MessageItem[]> {
    return this.messageService.findMessageWithQueueId(queueId);
  }

  async findByChatId(
    chatId: number,
    options: {
      limit?: number;
      page?: number;
    },
  ): Promise<QueueItemList> {
    const queues = await this.queueRepository.findByChatId(chatId, options);
    const metaData = await this.queueRepository.getMetaData({
      ...options,
      chatId,
    });

    return {
      items: queues.map((queue) => queue.toObject()),
      meta: metaData,
    };
  }

  async find(id: number): Promise<QueueItem | null> {
    const queue = await this.queueRepository.find(id);

    if (!queue) return null;

    return queue.toObject();
  }

  async update(payload: QueueUpdateData): Promise<QueueItem> {
    const { id, name, creatorId, chatId, turns, messageId } = payload;
    const queue = await this.queueRepository.update(
      QueueEntity.initialize({
        id,
        name,
        messageId,
        turns: turns as QueueParticipatesRange,
        chatId,
        creatorId,
        createdAt: null,
        updatedAt: null,
      }),
    );

    return queue.toObject();
  }
}

export { QueueService };
