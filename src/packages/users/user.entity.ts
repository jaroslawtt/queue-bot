import { IEntity } from '~/libs/interfaces/entity.interface.js';

class UserEntity implements IEntity {
  private readonly 'telegramId': number | null;

  private readonly 'firstName': string | null;

  private readonly 'lastName': string | null;

  private readonly 'telegramUsername': string | null;

  private readonly 'telegramTag': string | null;

  private constructor({
    telegramId,
    firstName,
    lastName,
    telegramUsername,
    telegramTag,
  }: {
    telegramId: number | null;
    firstName: string | null;
    lastName: string | null;
    telegramUsername: string | null;
    telegramTag: string | null;
  }) {
    this.telegramId = telegramId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.telegramUsername = telegramUsername;
    this.telegramTag = telegramTag;
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
}

export { UserEntity };
