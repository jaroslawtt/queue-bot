import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import {
  UserEnqueueDto,
  UserDequeueDto,
  QueueRemoveDto,
  QueueCreateDto,
} from "../../entities";

BigInt.prototype[`toJSON`] = function () {
  return this.toString();
};

@Injectable()
export class QueueService {
  constructor(private readonly prisma: PrismaService) {}

  async createQueue({
    queue_name,
    students_number,
    user_id,
    username,
    chat_id: chatId,
  }: QueueCreateDto) {
    return this.prisma.queue.create({
      data: {
        queue_name,
        students_number,
        chatId: BigInt(chatId),
        host: {
          connectOrCreate: {
            where: {
              user_id,
            },
            create: {
              user_id,
              username,
              is_admin: false,
            },
          },
        },
      },
      include: {
        users: true,
      },
    });
  }

  async getQueues(chat_id, limit: number, page: number) {
    return this.prisma.queue.findMany({
      where: {
        chatId: BigInt(chat_id),
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
      take: Number.isNaN(limit) ? undefined : limit,
      skip: Number.isNaN(page * limit) ? undefined : page * limit,
    });
  }

  async getQueue(queue_id?: number) {
    const queue = await this.prisma.queue.findUnique({
      where: {
        queue_id,
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
        host: true,
      },
    });
    if (!queue)
      throw new ForbiddenException({
        message: `This queue doesn't exist`,
      });
    return queue;
  }

  async enqueueUser({
    queue_id,
    user_id,
    username,
    turn,
    telegram_tag,
  }: UserEnqueueDto) {
    await this.prisma.user.update({
      data: {
        username,
        telegram_tag,
      },
      where: {
        user_id,
      },
    });
    await this.prisma.usersOnQueues.create({
      data: {
        user: {
          connectOrCreate: {
            where: {
              user_id,
            },
            create: {
              user_id,
              username,
              telegram_tag,
              is_admin: false,
            },
          },
        },
        queue: {
          connect: {
            queue_id,
          },
        },
        turn,
      },
    });

    return this.prisma.queue.findUnique({
      where: {
        queue_id,
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async dequeueUser({ user_id: userId, queue_id: queueId }: UserDequeueDto) {
    await this.prisma.usersOnQueues.delete({
      where: {
        userId_queueId: {
          userId,
          queueId,
        },
      },
    });
    return this.prisma.queue.findUnique({
      where: {
        queue_id: queueId,
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async removeQueue({ queue_id }: QueueRemoveDto) {
    await this.prisma.queue.delete({
      where: {
        queue_id,
      },
    });
  }
}
