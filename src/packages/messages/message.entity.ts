import { IEntity } from '~/libs/interfaces/entity.interface.js';

class MessageEntity implements Pick<IEntity, 'toObject'> {
  private readonly 'id': number;
  private readonly 'queueId': number;

  private constructor({ id, queueId }: { id: number; queueId: number }) {
    this.id = id;
    this.queueId = queueId;
  }

  public static initialize({ id, queueId }: { id: number; queueId: number }) {
    return new MessageEntity({
      id,
      queueId,
    });
  }

  toObject(): {
    id: number;
    queueId: number;
  } {
    return {
      id: this.id,
      queueId: this.queueId,
    };
  }
}

export { MessageEntity };
