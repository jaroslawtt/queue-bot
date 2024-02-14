import { MAX_QUEUE_PARTICIPATES_NUMBER } from '~/packages/queues/queues.js';
import { type Range } from '~/libs/types/types.js';

type QueueParticipatesRange = Range<typeof MAX_QUEUE_PARTICIPATES_NUMBER>;

export { type QueueParticipatesRange };
