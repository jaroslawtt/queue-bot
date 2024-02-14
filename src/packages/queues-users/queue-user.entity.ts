import { IEntity } from '~/libs/interfaces/entity.interface.js';
import { QueueParticipatesRange } from '~/packages/queues/libs/types/queue-participates-range.type';

class QueueUserEntity implements Omit<IEntity, 'toNewObject'> {
  private readonly 'queueId': number | null;
  private readonly 'userId': number | null;
  private readonly 'turn': QueueParticipatesRange | null;

  private constructor({
    queueId,
    userId,
    turn,
  }: {
    queueId: number | null;
    userId: number | null;
    turn: QueueParticipatesRange | null;
  }) {
    this.queueId = queueId;
    this.userId = userId;
    this.turn = turn;
  }

  public static initialize({
    queueId,
    userId,
    turn,
  }: {
    queueId: number;
    userId: number;
    turn: QueueParticipatesRange | null;
  }) {
    return new QueueUserEntity({
      queueId,
      userId,
      turn,
    });
  }

  toObject(): {
    queueId: number;
    userId: number;
    turn: QueueParticipatesRange | null;
  } {
    return {
      queueId: this.queueId as number,
      userId: this.userId as number,
      turn: this.turn as QueueParticipatesRange | null,
    };
  }
}

export { QueueUserEntity };
