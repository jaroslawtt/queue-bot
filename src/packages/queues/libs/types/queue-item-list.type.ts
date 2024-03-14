import { type QueueItem } from '~/packages/queues/libs/types/queue-item.type.js';
import { type MetaData } from '~/libs/types/meta-data.type.js';

type QueueItemList = {
  items: QueueItem[];
  meta: MetaData;
};

export { type QueueItemList };
