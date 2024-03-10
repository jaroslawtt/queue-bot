import { QueueParticipatesRange } from '~/packages/queues/libs/types/queue-participates-range.type.js';

type AppCreateQueueData = {
  name: string;
  turns: QueueParticipatesRange;
  chatId: number;
  creatorId: number;
};

export { type AppCreateQueueData };
