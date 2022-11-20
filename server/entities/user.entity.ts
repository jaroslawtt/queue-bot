
export class UserEnqueueDto {
    user_id: number;
    queue_id: number;
    username: string;
    turn: number;
}

export class UserDequeueDto {
    user_id: number;
    queue_id: number;
}