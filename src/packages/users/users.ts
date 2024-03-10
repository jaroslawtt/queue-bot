import { UserRepository } from '~/packages/users/user.repository.js';
import { UserModel } from '~/packages/users/user.model.js';
import { UserService } from '~/packages/users/user.service.js';
import { userChatService } from '~/packages/users-chats/users-chats.js';

const userRepository = new UserRepository(UserModel);
const userService = new UserService(userRepository, userChatService);

export { userService };
