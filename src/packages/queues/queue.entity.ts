import { IEntity } from '~/libs/interfaces/entity.interface.js';
import { QueueParticipatesRange } from '~/packages/queues/libs/types/queue-participates-range.type';

class QueueEntity implements IEntity {
  private readonly 'id': number | null;

  private readonly 'name': string | null;

  private readonly 'turns': QueueParticipatesRange | null;

  private readonly 'chatId': number | null;

  private readonly 'creatorId': number | null;

  private readonly 'messageId': number | null;

  private readonly 'createdAt': string | null;

  private readonly 'updatedAt': string | null;

  private constructor({
    id,
    name,
    turns,
    chatId,
    creatorId,
    messageId,
    createdAt,
    updatedAt,
  }: {
    id: number | null;
    name: string | null;
    turns: QueueParticipatesRange | null;
    chatId: number | null;
    creatorId: number | null;
    messageId: number | null;
    createdAt: string | null;
    updatedAt: string | null;
  }) {
    this.id = id;
    this.name = name;
    this.turns = turns;
    this.chatId = chatId;
    this.creatorId = creatorId;
    this.messageId = messageId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public static initialize({
    id,
    name,
    turns,
    chatId,
    creatorId,
    messageId,
    createdAt,
    updatedAt,
  }: {
    id: number;
    name: string;
    turns: QueueParticipatesRange;
    chatId: number;
    creatorId: number;
    messageId: number | null;
    createdAt: string | null;
    updatedAt: string | null;
  }) {
    return new QueueEntity({
      id,
      name,
      turns,
      chatId,
      creatorId,
      messageId,
      createdAt,
      updatedAt,
    });
  }

  public static initializeNew({
    name,
    turns,
    chatId,
    creatorId,
  }: {
    name: string;
    turns: QueueParticipatesRange;
    chatId: number;
    creatorId: number;
  }) {
    return new QueueEntity({
      id: null,
      name,
      turns,
      chatId,
      creatorId,
      messageId: null,
      createdAt: null,
      updatedAt: null,
    });
  }

  toObject(): {
    id: number;
    name: string;
    turns: QueueParticipatesRange;
    chatId: number;
    creatorId: number;
    messageId: number | null;
    createdAt: string;
    updatedAt: string;
  } {
    return {
      id: this.id as number,
      name: this.name as string,
      turns: this.turns as QueueParticipatesRange,
      chatId: this.chatId as number,
      creatorId: this.creatorId as number,
      messageId: this.messageId as number | null,
      createdAt: this.createdAt as string,
      updatedAt: this.updatedAt as string,
    };
  }
  toNewObject(): {
    name: string;
    turns: QueueParticipatesRange;
    chatId: number;
    creatorId: number;
  } {
    return {
      name: this.name as string,
      turns: this.turns as QueueParticipatesRange,
      chatId: this.chatId as number,
      creatorId: this.creatorId as number,
    };
  }
}

export { QueueEntity };
