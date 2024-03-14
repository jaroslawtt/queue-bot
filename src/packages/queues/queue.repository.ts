import { IRepository } from '~/libs/interfaces/repository.interface.js';
import { QueueModel } from '~/packages/queues/queue.model.js';
import { QueueUserEntity } from '~/packages/queues-users/queues-users.js';
import { QueueEntity } from '~/packages/queues/queue.entity.js';
import { MetaData } from '~/libs/types/meta-data.type';

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
      messageId: queue.messageId,
      createdAt: queue.createdAt,
      updatedAt: queue.updatedAt,
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
      messageId: queue.messageId,
      createdAt: queue.createdAt,
      updatedAt: queue.updatedAt,
    });
  }

  async findByChatId(
    chatId: number,
    options: {
      limit?: number;
      page?: number;
    },
  ) {
    const { limit, page } = options;

    const { currentPage } = await this.getMetaData({
      page,
      limit,
      chatId,
    });
    const offset = (currentPage - 1) * (limit ?? Number.MAX_SAFE_INTEGER);

    const queues = await this.queueModel
      .query()
      .select('*')
      .where('chatId', chatId)
      .offset(offset)
      .limit(limit ?? Number.MAX_SAFE_INTEGER)
      .execute();

    return queues.map((queue) =>
      QueueEntity.initialize({
        id: queue.id,
        name: queue.name,
        turns: queue.turns,
        chatId: queue.chatId,
        creatorId: queue.creatorId,
        messageId: queue.messageId,
        createdAt: queue.createdAt,
        updatedAt: queue.updatedAt,
      }),
    );
  }

  async getMetaData({
    page,
    limit,
    chatId,
  }: {
    page?: number;
    limit?: number;
    chatId: number;
  }): Promise<MetaData> {
    const totalItems = Number(
      (
        await this.queueModel
          .knex()
          .raw(
            `SELECT count(*) as total FROM ${QueueModel.tableName} WHERE chat_id = ${chatId}`,
          )
      ).rows[0].total,
    );

    const totalPages = Math.ceil(totalItems / (Number(limit) || totalItems));
    const currentPage = Number(page) || 1;

    return {
      totalPages,
      totalItems,
      currentPage:
        currentPage > totalPages && totalPages !== 0 ? totalPages : currentPage,
    };
  }

  findAll(): Promise<unknown[]> {
    return Promise.resolve([]);
  }

  async update(payload: QueueEntity): Promise<QueueEntity> {
    const { id, name, turns, messageId, chatId, creatorId } =
      payload.toObject();

    await this.queueModel
      .query()
      .patch({
        name,
        turns,
        messageId,
        chatId,
        creatorId,
      })
      .where('id', id);

    const queue = (await this.queueModel
      .query()
      .findById(id)
      .returning('*')) as QueueModel;

    return QueueEntity.initialize({
      id: queue.id,
      name: queue.name,
      turns: queue.turns,
      chatId: queue.chatId,
      creatorId: queue.creatorId,
      messageId: queue.messageId,
      createdAt: queue.createdAt,
      updatedAt: queue.updatedAt,
    });
  }
}

export { QueueRepository };
