import { QueueRepository } from '~/packages/queues/queue.repository.js';
import { QueueCreateData } from '~/packages/queues/libs/types/queue-create-data.type.js';
import { QueueEntity } from '~/packages/queues/queue.entity.js';
import { QueueEnqueueUserData } from '~/packages/queues/libs/types/queue-enqueue-user-data.type';
import { QueueUserEntity } from '~/packages/queues-users/queues-users.js';
import { QueueDequeueUserData } from '~/packages/queues/libs/types/queue-dequeue-user-data.type';

class QueueService {
  private readonly queueRepository: QueueRepository;
  public constructor(queueRepository: QueueRepository) {
    this.queueRepository = queueRepository;
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

    return void (await this.queueRepository.enqueue(
      QueueUserEntity.initialize({
        queueId,
        userId,
        turn,
      }),
    ));
  }

  async dequeue(dequeueUserData: QueueDequeueUserData) {
    const { queueId, userId } = dequeueUserData;

    return void (await this.queueRepository.dequeue(
      QueueUserEntity.initialize({
        queueId,
        userId,
        turn: null,
      }),
    ));
  }
}

export { QueueService };
