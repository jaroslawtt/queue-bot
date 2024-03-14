import { QueueParticipatesRange } from '~/packages/queues/libs/types/queue-participates-range.type.js';

type QueueUpdateData = {
  id: number;
  name: string;
  turns: QueueParticipatesRange;
  chatId: number;
  messageId: number;
  creatorId: number;
};

export { type QueueUpdateData };
