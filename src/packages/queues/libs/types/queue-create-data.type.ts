import { QueueParticipatesRange } from '~/packages/queues/libs/types/queue-participates-range.type.js';

type QueueCreateData = {
  name: string;
  turns: QueueParticipatesRange;
  chatId: number;
  creatorId: number;
};

export { type QueueCreateData };
