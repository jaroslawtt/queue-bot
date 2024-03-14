import { IRepository } from '~/libs/interfaces/repository.interface.js';
import { MessageEntity } from '~/packages/messages/message.entity.js';
import { MessageModel } from '~/packages/messages/message.model.js';

class MessageRepository implements Pick<IRepository, 'delete' | 'create'> {
  private readonly messageModel: typeof MessageModel;
  public constructor(messageModel: typeof MessageModel) {
    this.messageModel = messageModel;
  }

  async create(payload: MessageEntity) {
    const { id, queueId } = payload.toObject();

    const message = await this.messageModel
      .query()
      .insert({
        id,
        queueId,
      })
      .returning('*');

    return MessageEntity.initialize({
      id: message.id,
      queueId: message.queueId,
    });
  }

  async findByQueueId(queueId: number) {
    const messages = await this.messageModel
      .query()
      .select('*')
      .where('queueId', queueId);

    return messages.map((message) =>
      MessageEntity.initialize({
        id: message.id,
        queueId: message.queueId,
      }),
    );
  }

  async delete(id: number): Promise<void> {
    return void (await this.messageModel.query().deleteById(id));
  }
}

export { MessageRepository };
