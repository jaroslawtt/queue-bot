import { IRepository } from '~/libs/interfaces/repository.interface.js';
import { QueueUserEntity } from '~/packages/queues-users/queue-user.entity.js';
import { QueueUserModel } from '~/packages/queues-users/queues-users.js';
import { QueueParticipatesRange } from '~/packages/queues/libs/types/queue-participates-range.type.js';

class QueueUserRepository implements IRepository {
  private readonly queueUserModel: typeof QueueUserModel;

  public constructor(queueUserModel: typeof QueueUserModel) {
    this.queueUserModel = queueUserModel;
  }

  async create(payload: QueueUserEntity): Promise<QueueUserEntity> {
    const { queueId, userId, turn } = payload.toObject();
    const queueUser = await this.queueUserModel
      .query()
      .insert({
        queueId,
        userId,
        turn: turn as QueueParticipatesRange,
      })
      .returning('*');

    return QueueUserEntity.initialize({
      queueId: queueUser.queueId,
      userId: queueUser.userId,
      turn: queueUser.turn,
    });
  }

  async delete(payload: QueueUserEntity): Promise<void> {
    const { queueId, userId } = payload.toObject();
    return void (await this.queueUserModel.query().delete().where({
      queueId,
      userId,
    }));
  }

  async find(payload: QueueUserEntity): Promise<QueueUserEntity | null> {
    const { queueId, userId } = payload.toObject();

    const queueUser = await this.queueUserModel
      .query()
      .findOne({
        queueId,
        userId,
      })
      .returning('*');

    if (!queueUser) return null;

    return QueueUserEntity.initialize({
      queueId: queueUser.queueId,
      userId: queueUser.userId,
      turn: queueUser.turn,
    });
  }

  findAll(): Promise<unknown[]> {
    return Promise.resolve([]);
  }

  async findByQueueIdAndTurn(
    queueId: number,
    turn: QueueParticipatesRange,
  ): Promise<QueueUserEntity | null> {
    const queueUser = await this.queueUserModel
      .query()
      .findOne({
        queueId,
        turn,
      })
      .returning('*');

    if (!queueUser) return null;

    return QueueUserEntity.initialize({
      queueId: queueUser.queueId,
      userId: queueUser.userId,
      turn: queueUser.turn,
    });
  }

  update(payload: unknown): Promise<unknown> {
    return Promise.resolve(undefined);
  }
}

export { QueueUserRepository };
