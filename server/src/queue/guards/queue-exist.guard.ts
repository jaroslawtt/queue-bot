import { Injectable, CanActivate, ExecutionContext,ForbiddenException } from '@nestjs/common';
import { PrismaService } from "../../prisma.service";
import { UserDequeueDto, UserEnqueueDto } from "../../../entities";

@Injectable()
export class IsQueueExistGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) {
    }
    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { queue_id }: UserEnqueueDto | UserDequeueDto  = request.body;
        const queue = await this.prisma.queue.findUnique({
            where: {
                queue_id,
            }
        })
        if(!queue) throw new ForbiddenException({
            message: `This queue doesn't exist`,
        });
        return true;
    }
}