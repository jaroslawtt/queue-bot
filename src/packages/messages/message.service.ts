import { MessageRepository } from '~/packages/messages/message.repository.js';
import { MessageCreate } from '~/packages/messages/types/message-create.type.js';
import { MessageEntity } from '~/packages/messages/message.entity.js';
import { MessageItem } from '~/packages/messages/types/message-item.type.js';

class MessageService {
  private readonly messageRepository: MessageRepository;
  public constructor(messageRepository: MessageRepository) {
    this.messageRepository = messageRepository;
  }

  async create(payload: MessageCreate): Promise<MessageItem> {
    const { id, queueId } = payload;
    const message = await this.messageRepository.create(
      MessageEntity.initialize({
        id,
        queueId,
      }),
    );

    return message.toObject();
  }

  async findMessageWithQueueId(queueId: number): Promise<MessageItem[]> {
    const messages = await this.messageRepository.findByQueueId(queueId);

    return messages.map((message) => message.toObject());
  }

  async delete(id: number): Promise<void> {
    return this.messageRepository.delete(id);
  }
}

export { MessageService };
