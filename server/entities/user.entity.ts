import { IsInt, IsString, IsOptional } from "class-validator";

export class UserEnqueueDto {
  @IsInt()
  user_id: number;
  @IsInt()
  queue_id: number;
  @IsString()
  username: string;
  @IsInt()
  turn: number;
  @IsString()
  @IsOptional()
  telegram_tag: string;
}

export class UserDequeueDto {
  @IsInt()
  user_id: number;
  @IsInt()
  queue_id: number;
}
