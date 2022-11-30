import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
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
        const { queue_id, user_id }: QueueRemoveDto = request.body;
        const queue = await this.prisma.queue.findUnique({
            where: {
                queue_id,
            },
            include: {
                host: true,
            }
        });
        if(!queue) throw new ForbiddenException({
            message: `This queue doesn't exist`,
        })
        if(queue.host?.user_id !== user_id){
            const user = await this.prisma.user.findUnique({
                where: {
                    user_id,
                }
            });
            if(!user.is_admin) throw new ForbiddenException({
                message: `You have no rights for this operation`,
            })
        }
        return true;
    }
}