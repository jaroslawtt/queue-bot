import {Injectable, CanActivate, ExecutionContext, ForbiddenException} from '@nestjs/common';
import { PrismaService } from "../../prisma.service";
import { QueueCreateDto } from "../../../entities";

@Injectable()
export class CreateQueueGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) {
    }
    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { queue_name }: QueueCreateDto = request.body;
        const queue = this.prisma.queue.findUnique({
            where: {
                queue_name,
            }
        });
        if(queue) throw new ForbiddenException({
            message: `The queue with this name already exists`
        })
        return true;
    }
}