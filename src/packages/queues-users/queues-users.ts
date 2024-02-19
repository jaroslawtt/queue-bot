import { QueueUserRepository } from '~/packages/queues-users/queue-user.repository.js';
import { QueueUserModel } from '~/packages/queues-users/queue-user.model.js';
import { QueueUserService } from '~/packages/queues-users/queue-user.service.js';

const queueUserRepository = new QueueUserRepository(QueueUserModel);
const queueUserService = new QueueUserService(queueUserRepository);

export { QueueUserModel } from './queue-user.model.js';
export { QueueUserEntity } from './queue-user.entity.js';
export { queueUserService };
