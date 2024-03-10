import { QueueParticipatesRange } from '~/packages/queues/libs/types/queue-participates-range.type.js';

type QueueUserCreateData = {
  queueId: number;
  userId: number;
  turn: QueueParticipatesRange;
};

export { type QueueUserCreateData };
