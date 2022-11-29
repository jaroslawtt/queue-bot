import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma.service";
import { UserEnqueueDto, UserDequeueDto, QueueRemoveDto, QueueCreateDto, QueuesGetDto} from "../../entities";



BigInt.prototype.toJSON = function () {
    return this.toString();
};

@Injectable()
export class QueueService {
    constructor(private readonly prisma: PrismaService) {
    }


    async createQueue({ queue_name, students_number, user_id, username, chat_id: chatId}: QueueCreateDto) {
        return await this.prisma.queue.create({
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
                        }
                    }
                }
            },
            include: {
                users: true,
            }
        })
    }

    async getAllQueues(chat_id){
        return await this.prisma.queue.findMany({
            where: {
                chatId: BigInt(chat_id),
            },
            include: {
                users: {
                    include: {
                        user: true,
                    }
                },
            }
        });
    };

    async getQueue(queue_id?: number){
        return await this.prisma.queue.findUnique({
            where: {
                queue_id,
            },
            include: {
                users: {
                    include: {
                        user: true,
                    }
                },
            }
        })
    }

    async enqueueUser({ queue_id, user_id, username, turn }: UserEnqueueDto): Promise<any>{
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
                        }
                    }
                },
                queue: {
                    connect: {
                        queue_id,
                    }
                },
                turn,
            }
        })
        return await this.prisma.queue.findUnique({
            where: {
                queue_id,
            },
            include: {
                users: {
                    include: {
                        user: true,
                    }
                },
            }
        })
    };

    async dequeueUser({user_id: userId, queue_id: queueId}: UserDequeueDto){
        await this.prisma.usersOnQueues.delete({
            where: {
                userId_queueId: {
                    userId,
                    queueId,
                }
            }
        })
        return await this.prisma.queue.findUnique({
            where: {
                queue_id: queueId,
            },
            include: {
                users: {
                    include: {
                        user: true,
                    }
                }
            },
        })
    };

    async removeQueue({ queue_id }: QueueRemoveDto){
        await this.prisma.queue.delete({
            where: {
                queue_id,
            }
        })
    }
}
