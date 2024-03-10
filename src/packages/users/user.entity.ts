import { IEntity } from '~/libs/interfaces/entity.interface.js';
import { QueueParticipatesRange } from '~/packages/queues/libs/types/queue-participates-range.type';

class UserEntity implements IEntity {
  private readonly 'telegramId': number | null;

  private readonly 'firstName': string | null;

  private readonly 'lastName': string | null;

  private readonly 'telegramUsername': string | null;

  private readonly 'telegramTag': string | null;

  private readonly 'turn': QueueParticipatesRange | null;

  private readonly 'isAllowedNotification': boolean | null;

  private constructor({
    telegramId,
    firstName,
    lastName,
    telegramUsername,
    telegramTag,
    turn,
    isAllowedNotification,
  }: {
    telegramId: number | null;
    firstName: string | null;
    lastName: string | null;
    telegramUsername: string | null;
    telegramTag: string | null;
    turn: QueueParticipatesRange | null;
    isAllowedNotification: boolean | null;
  }) {
    this.telegramId = telegramId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.telegramUsername = telegramUsername;
    this.telegramTag = telegramTag;
    this.turn = turn;
    this.isAllowedNotification = isAllowedNotification;
  }

  public static initialize({
    telegramId,
    firstName,
    lastName,
    telegramUsername,
    telegramTag,
    isAllowedNotification,
  }: {
    telegramId: number;
    firstName: string | null;
    lastName: string | null;
    telegramUsername: string;
    telegramTag: string | null;
    isAllowedNotification: boolean;
  }) {
    return new UserEntity({
      telegramId,
      firstName,
      lastName,
      telegramUsername,
      telegramTag,
      turn: null,
      isAllowedNotification,
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
      isAllowedNotification: null,
    });
  }

  public static initializeForUserDetailsUpdate({
    telegramId,
    firstName,
    lastName,
  }: {
    telegramId: number;
    firstName: string | null;
    lastName: string | null;
  }) {
    return new UserEntity({
      telegramId,
      telegramUsername: null,
      telegramTag: null,
      firstName,
      lastName,
      turn: null,
      isAllowedNotification: null,
    });
  }

  public static initializeForUserNotificationUpdate({
    telegramId,
    isAllowedNotification,
  }: {
    telegramId: number;
    isAllowedNotification: boolean;
  }) {
    return new UserEntity({
      telegramId,
      telegramUsername: null,
      telegramTag: null,
      firstName: null,
      lastName: null,
      turn: null,
      isAllowedNotification,
    });
  }

  public static initializeWithTurn({
    telegramId,
    firstName,
    lastName,
    telegramUsername,
    telegramTag,
    turn,
    isAllowedNotification,
  }: {
    telegramId: number;
    firstName: string | null;
    lastName: string | null;
    telegramUsername: string;
    telegramTag: string | null;
    turn: QueueParticipatesRange;
    isAllowedNotification: boolean;
  }) {
    return new UserEntity({
      telegramId,
      firstName,
      lastName,
      telegramUsername,
      telegramTag,
      turn,
      isAllowedNotification,
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
    isAllowedNotification: boolean;
  } {
    return {
      telegramId: this.telegramId as number,
      firstName: this.firstName as string | null,
      lastName: this.lastName as string | null,
      telegramUsername: this.telegramUsername as string,
      telegramTag: this.telegramTag as string | null,
      isAllowedNotification: this.isAllowedNotification as boolean,
    };
  }

  toObjectWithTurn(): {
    telegramId: number;
    firstName: string | null;
    lastName: string | null;
    telegramUsername: string;
    telegramTag: string | null;
    turn: QueueParticipatesRange;
    isAllowedNotification: boolean;
  } {
    return {
      telegramId: this.telegramId as number,
      firstName: this.firstName as string | null,
      lastName: this.lastName as string | null,
      telegramUsername: this.telegramUsername as string,
      telegramTag: this.telegramTag as string | null,
      turn: this.turn as QueueParticipatesRange,
      isAllowedNotification: this.isAllowedNotification as boolean,
    };
  }
}

export { UserEntity };
