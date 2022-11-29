import {IsString, IsInt, IsOptional, IsNotEmpty} from "class-validator";
import {Transform} from "class-transformer";


export class QueueDto {
    @IsInt()
    user_id: number;
}

export class QueueCreateDto extends QueueDto{
    @IsString()
    queue_name: string;
    @IsInt()
    students_number: number;
    @IsString()
    username: string;
    @IsNotEmpty()
    @Transform(val => BigInt(val.value))
    chat_id: bigint;
}

export class QueueRemoveDto extends QueueDto{
    @IsInt()
    queue_id: number;
}

export class QueuesGetDto{
    @Transform(val => BigInt(val.value))
    chat_id: bigint;
}