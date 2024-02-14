import { QueueParticipatesRange } from '~/packages/queues/libs/types/queue-participates-range.type.js';

type QueueItem = {
  id: number;
  name: string;
  turns: QueueParticipatesRange;
  chatId: number;
  creatorId: number;
};

export { type QueueItem };
