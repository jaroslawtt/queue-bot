import {Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Query, UseGuards} from '@nestjs/common';
import { QueueService } from "./queue.service";
import {UserEnqueueDto, QueueDto, UserDequeueDto, QueueRemoveDto, QueueCreateDto, QueuesGetDto} from "../../entities";
import { CreateQueueGuard, DequeueUserGuard, IsQueueExistGuard, RemoveQueueGuard, EnqueueUserGuard } from "./guards";


@Controller('queues')
export class QueueController {

    constructor(private readonly queueService: QueueService) {
    }

    @Get(`/:id`)
    getAllQueues(@Param(`id`) id){
        return this.queueService.getAllQueues(id);
    }

    @Get(`queue/:id`)
    getQueue(@Param(`id`, ParseIntPipe) id: number){
        return this.queueService.getQueue(id);
    }

    @Post(``)
    @UseGuards(CreateQueueGuard)
    createQueue(@Body() body: QueueCreateDto){
        return this.queueService.createQueue(body);
    }

    @Post(`/enqueue`)
    @UseGuards(IsQueueExistGuard, EnqueueUserGuard)
    enqueueUser(@Body() body: UserEnqueueDto){
        return this.queueService.enqueueUser(body);
    }

    @Post(`/dequeue`)
    @UseGuards(IsQueueExistGuard,DequeueUserGuard)
    dequeueUser(@Body() body: UserDequeueDto){
        return this.queueService.dequeueUser(body);
    }

    @Delete()
    @HttpCode(201)
    @UseGuards(RemoveQueueGuard)
    removeQueue(@Body() body: QueueRemoveDto){
        return this.queueService.removeQueue(body);
    }
}
