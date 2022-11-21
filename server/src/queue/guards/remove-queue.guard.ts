import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from "../../prisma.service";
import { QueueRemoveDto } from "../../../entities";

@Injectable()
export class RemoveQueueGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) {
    }
    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { queue_id }: QueueRemoveDto = request.body;
        const queue = this.prisma.queue.findUnique({
            where: {
                queue_id,
            }
        });
        return !!queue;
    }
}