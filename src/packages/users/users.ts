import { UserRepository } from '~/packages/users/user.repository.js';
import { UserModel } from '~/packages/users/user.model.js';
import { UserService } from '~/packages/users/user.service';

const userRepository = new UserRepository(UserModel);
const userService = new UserService(userRepository);

export { userService };
