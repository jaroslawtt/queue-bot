import { Body, Controller, Delete, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common';
import { QueueService } from "./queue.service";
import { UserEnqueueDto, QueueCreateDto, UserDequeueDto, QueueRemoveDto } from "../../entities";
import { CreateQueueGuard, DequeueUserGuard, IsQueueExistGuard, RemoveQueueGuard, EnqueueUserGuard } from "./guards";


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
