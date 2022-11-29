import TelegramBot from "../local_modules/@types/node-telegram-bot-api";
import CallbackQuery = TelegramBot.CallbackQuery;


export interface QueueForm {
    name: string;
    numberOfStudents: number | null;
}


export interface IQueue {
    queue_id: number,
    queue_name: string,
    students_number: number,
    created_at: Date,
    users: Array<User>
}

export interface User {
    user_id: number,
    queue_id: string,
    turn: number,
    user: UserDataDetails,
}

export interface UserDataDetails {
    user_id: number,
    username: string,
}

export interface ICallbackQuery extends CallbackQuery{
    data: string;
}

export type AxiosErrorMessage = `User isn't in the queue` | `User is already in queue` | `The turn is already taken` | `This queue doesn't exist anymore`;

export type CallbackQueryType = `turn` | `cancel`;

