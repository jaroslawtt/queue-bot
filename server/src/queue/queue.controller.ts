import { Body, Controller, Delete, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common';
import { QueueService } from "./queue.service";
import { UserEnqueueDto, QueueCreateDto, UserDequeueDto, QueueRemoveDto } from "../../entities";
import { EnqueueUserGuard } from "./guards/enqueue.guard";
import { DequeueUserGuard } from "./guards/dequeue.guard";
import { CreateQueueGuard } from "./guards/create-queue.guard";
import {RemoveQueueGuard} from "./guards/remove-queue.guard";

@Controller('queues')
export class QueueController {

    constructor(private readonly queueService: QueueService) {
    }

    @Get(``)
    getAllQueues(){
        return this.queueService.getAllQueues();
    }

    @Get(`/`)
    getQueue(@Query(`name`) queryName: string){
        return this.queueService.getQueue(queryName);
    }

    @Post(``)
    @UseGuards(CreateQueueGuard)
    createQueue(@Body() body: QueueCreateDto){
        return this.queueService.createQueue(body);
    }

    @Post(`/enqueue`)
    @UseGuards(EnqueueUserGuard)
    enqueueUser(@Body() body: UserEnqueueDto){
        return this.queueService.enqueueUser(body);
    }

    @Post(`/dequeue`)
    @HttpCode(201)
    @UseGuards(DequeueUserGuard)
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
