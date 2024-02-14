import { QueueParticipatesRange } from '~/packages/queues/libs/types/queue-participates-range.type.js';

type QueueEnqueueUserData = {
  userId: number;
  queueId: number;
  turn: QueueParticipatesRange;
};

export { type QueueEnqueueUserData };
