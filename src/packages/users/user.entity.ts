import { IEntity } from '~/libs/interfaces/entity.interface.js';
import { QueueParticipatesRange } from '~/packages/queues/libs/types/queue-participates-range.type';

class UserEntity implements IEntity {
  private readonly 'telegramId': number | null;

  private readonly 'firstName': string | null;

  private readonly 'lastName': string | null;

  private readonly 'telegramUsername': string | null;

  private readonly 'telegramTag': string | null;

  private readonly 'turn': QueueParticipatesRange | null;

  private constructor({
    telegramId,
    firstName,
    lastName,
    telegramUsername,
    telegramTag,
    turn,
  }: {
    telegramId: number | null;
    firstName: string | null;
    lastName: string | null;
    telegramUsername: string | null;
    telegramTag: string | null;
    turn: QueueParticipatesRange | null;
  }) {
    this.telegramId = telegramId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.telegramUsername = telegramUsername;
    this.telegramTag = telegramTag;
    this.turn = turn;
  }

  public static initialize({
    telegramId,
    firstName,
    lastName,
    telegramUsername,
    telegramTag,
  }: {
    telegramId: number;
    firstName: string | null;
    lastName: string | null;
    telegramUsername: string;
    telegramTag: string | null;
  }) {
    return new UserEntity({
      telegramId,
      firstName,
      lastName,
      telegramUsername,
      telegramTag,
      turn: null,
    });
  }

  public static initializeNew({
    telegramId,
    telegramUsername,
    telegramTag,
  }: {
    telegramId: number;
    telegramUsername: string;
    telegramTag: string | null;
  }) {
    return new UserEntity({
      telegramId,
      firstName: null,
      lastName: null,
      telegramUsername,
      telegramTag,
      turn: null,
    });
  }

  public static initializeWithTurn({
    telegramId,
    firstName,
    lastName,
    telegramUsername,
    telegramTag,
    turn,
  }: {
    telegramId: number;
    firstName: string | null;
    lastName: string | null;
    telegramUsername: string;
    telegramTag: string | null;
    turn: QueueParticipatesRange;
  }) {
    return new UserEntity({
      telegramId,
      firstName,
      lastName,
      telegramUsername,
      telegramTag,
      turn,
    });
  }

  toNewObject(): {
    telegramId: number;
    telegramUsername: string;
    telegramTag: string | null;
  } {
    return {
      telegramId: this.telegramId as number,
      telegramUsername: this.telegramUsername as string,
      telegramTag: this.telegramTag as string | null,
    };
  }

  toObject(): {
    telegramId: number;
    firstName: string | null;
    lastName: string | null;
    telegramUsername: string;
    telegramTag: string | null;
  } {
    return {
      telegramId: this.telegramId as number,
      firstName: this.firstName as string | null,
      lastName: this.lastName as string | null,
      telegramUsername: this.telegramUsername as string,
      telegramTag: this.telegramTag as string | null,
    };
  }

  toObjectWithTurn(): {
    telegramId: number;
    firstName: string | null;
    lastName: string | null;
    telegramUsername: string;
    telegramTag: string | null;
    turn: QueueParticipatesRange;
  } {
    return {
      telegramId: this.telegramId as number,
      firstName: this.firstName as string | null,
      lastName: this.lastName as string | null,
      telegramUsername: this.telegramUsername as string,
      telegramTag: this.telegramTag as string | null,
      turn: this.turn as QueueParticipatesRange,
    };
  }
}

export { UserEntity };
