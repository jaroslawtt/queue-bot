import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma.service";
import { UserEnqueueDto, QueueCreateDto, UserDequeueDto, QueueRemoveDto } from "../../entities";



@Injectable()
export class QueueService {
    constructor(private readonly prisma: PrismaService) {
    }


    async createQueue({ queue_name, students_number}: QueueCreateDto) {
        return await this.prisma.queue.create({
            data: {
                queue_name,
                students_number,
            }
        })
    }

    async getAllQueues(){
        return await this.prisma.queue.findMany({
            include: {
                users: true,
            }
        });
    };

    async getQueue(queue_name: string){
        return await this.prisma.queue.findUnique({
            where: {
                queue_name,
            },
            include: {
                users: true,
            }
        })
    };

    async enqueueUser({ queue_id, user_id, username, turn }: UserEnqueueDto): Promise<void>{
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
    };

    async removeQueue({ queue_id }: QueueRemoveDto){
        await this.prisma.queue.delete({
            where: {
                queue_id,
            }
        })
    }
}
