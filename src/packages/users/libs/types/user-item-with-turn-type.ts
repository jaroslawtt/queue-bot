import { QueueParticipatesRange } from '~/packages/queues/libs/types/queue-participates-range.type.js';
import { UserItem } from '~/packages/users/libs/types/user-item.type.js';

type UserItemWithTurn = {
  turn: QueueParticipatesRange;
} & UserItem;

export { type UserItemWithTurn };
