import { UserChatRepository } from '~/packages/users-chats/user-chat.repository.js';
import { UserChatModel } from '~/packages/users-chats/user-chat.model.js';
import { UserChatService } from '~/packages/users-chats/user-chat.service.js';

const userChatRepository = new UserChatRepository(UserChatModel);
const userChatService = new UserChatService(userChatRepository);

export { UserChatModel, userChatService };
export { UserChatEntity } from './user-chat.entity.js';
