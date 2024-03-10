import { IRepository } from '~/libs/interfaces/repository.interface.js';
import { QueueModel } from '~/packages/queues/queue.model.js';
import { QueueUserEntity } from '~/packages/queues-users/queues-users.js';
import { QueueEntity } from '~/packages/queues/queue.entity.js';

class QueueRepository implements IRepository {
  private readonly usersRelationExpression = 'users';
  private readonly queueModel: typeof QueueModel;

  public constructor(queueModel: typeof QueueModel) {
    this.queueModel = queueModel;
  }

  async create(payload: QueueEntity): Promise<QueueEntity> {
    const { name, turns, chatId, creatorId } = payload.toNewObject();

    const queue = await this.queueModel
      .query()
      .insert({
        name,
        turns,
        creatorId,
        chatId,
      })
      .returning('*');

    return QueueEntity.initialize({
      id: queue.id,
      name: queue.name,
      turns: queue.turns,
      chatId: queue.chatId,
      creatorId: queue.creatorId,
      createdAt: queue.createdAt,
    });
  }

  async delete(id: number): Promise<void> {
    return void (await this.queueModel.query().deleteById(id));
  }

  async find(id: number): Promise<QueueEntity | null> {
    const queue = await this.queueModel.query().findById(id);

    if (!queue) return null;

    return QueueEntity.initialize({
      id: queue.id,
      name: queue.name,
      turns: queue.turns,
      chatId: queue.chatId,
      creatorId: queue.creatorId,
      createdAt: queue.createdAt,
    });
  }

  findAll(): Promise<unknown[]> {
    return Promise.resolve([]);
  }

  async update(payload: unknown): Promise<unknown> {
    return Promise.resolve(undefined);
  }
}

export { QueueRepository };
