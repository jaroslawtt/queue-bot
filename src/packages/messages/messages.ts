import { MessageRepository } from '~/packages/messages/message.repository.js';
import { MessageModel } from '~/packages/messages/message.model.js';
import { MessageService } from '~/packages/messages/message.service.js';

const messageRepository = new MessageRepository(MessageModel);
const messageService = new MessageService(messageRepository);

export { messageService };
