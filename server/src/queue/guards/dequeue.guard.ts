import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { UserEnqueueDto } from "../../../entities";

@Injectable()
export class DequeueUserGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user_id, queue_id: queueId }: UserEnqueueDto = request.body;
    const user = await this.prisma.user.findUnique({
      where: {
        user_id,
      },
      include: {
        queues: {
          where: {
            queueId,
          },
        },
      },
    });
    if (user) {
      const { queues } = user;
      for (let i = 0; i <= queues.length; i++) {
        if (queues[i]?.queueId === queueId) return true;
      }
    }
    throw new ForbiddenException({
      message: `You ain't in the queue`,
    });
  }
}
