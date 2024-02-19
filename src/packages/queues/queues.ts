import { QueueRepository } from '~/packages/queues/queue.repository.js';
import { QueueModel } from '~/packages/queues/queue.model.js';
import { QueueService } from '~/packages/queues/queue.service.js';
import { queueUserService } from '~/packages/queues-users/queues-users.js';

const queueRepository = new QueueRepository(QueueModel);
const queueService = new QueueService(queueRepository, queueUserService);

export { MAX_QUEUE_PARTICIPATES_NUMBER } from './libs/constants.js';
export { queueService };
