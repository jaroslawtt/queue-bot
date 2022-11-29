import {IsInt, IsString} from "class-validator";

export class UserEnqueueDto {
    @IsInt()
    user_id: number;
    @IsInt()
    queue_id: number;
    @IsString()
    username: string;
    @IsInt()
    turn: number;
}

export class UserDequeueDto {
    @IsInt()
    user_id: number;
    @IsInt()
    queue_id: number;
}