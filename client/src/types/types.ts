export interface QueueForm {
  name: string;
  numberOfStudents: number | null;
}

export interface IQueue {
  queue_id: number;
  queue_name: string;
  students_number: number;
  created_at: Date;
  host: Host;
  users: Array<User>;
}

export interface User {
  user_id: number;
  queue_id: string;
  turn: number;
  user: UserDataDetails;
}

export interface Host {
  user_id: number;
  username: string;
  is_admin: boolean;
  telegram_tag: string;
}

export interface UserDataDetails {
  user_id: number;
  username: string;
  telegram_tag: string;
}

export interface AxiosCustomException {
  response: {
    data: {
      message: AxiosErrorMessage | string;
    };
    status: number;
  };
}

export type AxiosErrorMessage =
  | `User isn't in the queue`
  | `User is already in queue`
  | `The turn is already taken`
  | `This queue doesn't exist anymore`;

export type CallbackQueryType =
  | `turn`
  | `delete`
  | `back`
  | `control`
  | `queue`
  | `cancel`
  | "page"
  | "update";

export enum CallbackQueryTypeList {
  Turn = "turn",
  Delete = "delete",
  Back = "back",
  Control = "control",
  Queue = "queue",
  Cancel = "cancel",
  Page = "page",
  Update = "update",
}
