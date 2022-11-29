import {Injectable, CanActivate, ExecutionContext, ForbiddenException} from '@nestjs/common';
import { PrismaService } from "../../prisma.service";
import {QueueCreateDto, QueueDto} from "../../../entities";

@Injectable()
export class CreateQueueGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) {
    }
    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { queue_name, students_number }: QueueCreateDto = request.body;
        const queue = await this.prisma.queue.findUnique({
            where: {
                queue_name,
            }
        });
        if(queue) throw new ForbiddenException({
            message: `The queue with this name already exists`
        })
        if(students_number > 40) throw new ForbiddenException({
            message: `Number of students can't be higher than 40`,
        })
        return true;
    }
}