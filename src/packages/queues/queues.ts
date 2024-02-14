import { QueueRepository } from '~/packages/queues/queue.repository.js';
import { QueueModel } from '~/packages/queues/queue.model.js';
import { QueueService } from '~/packages/queues/queue.service';

const queueRepository = new QueueRepository(QueueModel);
const queueService = new QueueService(queueRepository);

export { MAX_QUEUE_PARTICIPATES_NUMBER } from './libs/constants.js';
export { queueService };
