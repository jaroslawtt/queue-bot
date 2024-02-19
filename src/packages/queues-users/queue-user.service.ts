import { QueueUserRepository } from '~/packages/queues-users/queue-user.repository.js';
import { type QueueUserCreateData } from '~/packages/queues-users/libs/types/queue-user-create-data.type.js';
import { QueueUserEntity } from '~/packages/queues-users/queues-users.js';
import { type QueueUserDeleteData } from '~/packages/queues-users/libs/types/queue-user-delete-data.type.js';
import { type QueueParticipatesRange } from '~/packages/queues/libs/types/queue-participates-range.type.js';
import { type QueueUserFindData } from '~/packages/queues-users/libs/types/queue-user-find-data.type.js';
import { type QueueUserItem } from '~/packages/queues-users/libs/types/queue-user-item.type.js';

class QueueUserService {
  private readonly queueUserRepository: QueueUserRepository;
  public constructor(queueUserRepository: QueueUserRepository) {
    this.queueUserRepository = queueUserRepository;
  }

  async create(queueUserCreateData: QueueUserCreateData) {
    const { queueId, userId, turn } = queueUserCreateData;

    const queueUser = await this.queueUserRepository.create(
      QueueUserEntity.initialize({
        queueId,
        userId,
        turn,
      }),
    );

    return queueUser.toObject();
  }

  async delete(queueUserDeleteData: QueueUserDeleteData) {
    const { queueId, userId } = queueUserDeleteData;

    return void this.queueUserRepository.delete(
      QueueUserEntity.initialize({
        queueId,
        userId,
        turn: null,
      }),
    );
  }

  async find(
    queueUserFindData: QueueUserFindData,
  ): Promise<QueueUserItem | null> {
    const { queueId, userId } = queueUserFindData;

    const queueUser = await this.queueUserRepository.find(
      QueueUserEntity.initialize({
        queueId,
        userId,
        turn: null,
      }),
    );

    if (!queueUser) return null;

    return queueUser.toObject();
  }

  async findByQueueIdAndTurn(queueId: number, turn: QueueParticipatesRange) {
    return this.queueUserRepository.findByQueueIdAndTurn(queueId, turn);
  }
}

export { QueueUserService };
