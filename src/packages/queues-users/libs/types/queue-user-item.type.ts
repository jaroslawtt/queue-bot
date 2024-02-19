import { type QueueParticipatesRange } from '~/packages/queues/libs/types/queue-participates-range.type.js';

type QueueUserItem = {
  queueId: number;
  userId: number;
  turn: QueueParticipatesRange | null;
};

export { type QueueUserItem };
