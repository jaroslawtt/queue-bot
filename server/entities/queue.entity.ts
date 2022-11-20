import { IsString, IsInt } from "class-validator";


export class QueueCreateDto {
    @IsString()
    queue_name: string;
    @IsInt()
    students_number: number;
}

export class QueueRemoveDto {
    @IsInt()
    queue_id: number;
}