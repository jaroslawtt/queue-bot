import { QueueRepository } from '~/packages/queues/queue.repository.js';
import { QueueCreateData } from '~/packages/queues/libs/types/queue-create-data.type.js';
import { QueueEntity } from '~/packages/queues/queue.entity.js';
import { QueueEnqueueUserData } from '~/packages/queues/libs/types/queue-enqueue-user-data.type.js';
import { QueueDequeueUserData } from '~/packages/queues/libs/types/queue-dequeue-user-data.type.js';
import { QueueUserService } from '~/packages/queues-users/queue-user.service.js';
import { QueueItem } from '~/packages/queues/libs/types/queue-item.type';

class QueueService {
  private readonly queueRepository: QueueRepository;
  private readonly queueUserService: QueueUserService;
  public constructor(
    queueRepository: QueueRepository,
    queueUserService: QueueUserService,
  ) {
    this.queueRepository = queueRepository;
    this.queueUserService = queueUserService;
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
    return void (await this.queueRepository.delete(id));
  }

  async enqueue(enqueueUserData: QueueEnqueueUserData) {
    const { queueId, userId, turn } = enqueueUserData;

    const isUserInQueue = !!(await this.queueUserService.find({
      userId,
      queueId,
    }));

    if (isUserInQueue) return console.log('User is in the queue');

    const isTurnTaken = !!(await this.queueUserService.findByQueueIdAndTurn(
      queueId,
      turn,
    ));

    if (isTurnTaken) return console.log('Turn is already taken');

    return this.queueUserService.create({
      queueId,
      userId,
      turn,
    });
  }

  async dequeue(dequeueUserData: QueueDequeueUserData) {
    const { queueId, userId } = dequeueUserData;

    return this.queueUserService.delete({
      queueId,
      userId,
    });
  }

  async find(id: number): Promise<QueueItem | null> {
    const queue = await this.queueRepository.find(id);

    if (!queue) return null;

    return queue.toObject();
  }
}

export { QueueService };
