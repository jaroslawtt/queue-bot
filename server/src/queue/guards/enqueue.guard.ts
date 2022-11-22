import { Injectable, CanActivate, ExecutionContext,ForbiddenException } from '@nestjs/common';
import { PrismaService } from "../../prisma.service";
import { UserEnqueueDto } from "../../../entities";

@Injectable()
export class EnqueueUserGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) {
    }
   async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { user_id, queue_id: queueId, turn }: UserEnqueueDto = request.body;
        const usersOnQueues = await this.prisma.usersOnQueues.findMany();
        if(usersOnQueues){
            for (const userOnQueue of usersOnQueues) {
                if(userOnQueue.userId === user_id && userOnQueue.queueId === queueId) throw new ForbiddenException({
                    message: `User is already in queue`,
                });
                if(userOnQueue.userId !== user_id && userOnQueue.queueId === queueId && userOnQueue.turn === turn) throw new ForbiddenException({
                    message: `The turn is already taken`,
                });
            }
        }
        return true;
    }
}